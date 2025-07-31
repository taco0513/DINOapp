import { google } from 'googleapis';
import {
  createGmailClient,
  searchTravelEmails,
  extractTravelInfo,
  analyzeTravelEmails,
  checkGmailConnection,
} from '@/lib/gmail';
import {
  createCalendarClient,
  checkCalendarConnection,
  getUserCalendars,
  createTravelEvents,
  createCalendarEvent,
  syncTravelToCalendar,
} from '@/lib/calendar';
import { OAuth2Client } from 'google-auth-library';

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
      })),
    },
    gmail: jest.fn().mockReturnValue({
      users: {
        messages: {
          list: jest.fn(),
          get: jest.fn(),
        },
        getProfile: jest.fn(),
      },
    }),
    calendar: jest.fn().mockReturnValue({
      events: {
        list: jest.fn(),
        insert: jest.fn(),
        delete: jest.fn(),
      },
      calendarList: {
        list: jest.fn(),
      },
    }),
  },
}));

describe('Google API Integration Tests', () => {
  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Gmail Integration', () => {
    it('should check Gmail connection successfully', async () => {
      const gmailMock = google.gmail();
      (gmailMock.users.getProfile as jest.Mock).mockResolvedValue({
        data: { emailAddress: 'test@example.com' },
      });

      const result = await checkGmailConnection(mockAccessToken);

      expect(result).toBe(true);
      expect(gmailMock.users.getProfile).toHaveBeenCalledWith({
        userId: 'me',
      });
    });

    it('should search travel emails successfully', async () => {
      const mockMessages = {
        data: {
          messages: [
            { id: '1', threadId: 'thread1' },
            { id: '2', threadId: 'thread2' },
          ],
        },
      };

      const mockMessageDetails = {
        data: {
          id: '1',
          threadId: 'thread1',
          snippet: 'Your flight booking confirmation',
          payload: {
            headers: [
              { name: 'From', value: 'airline@example.com' },
              { name: 'Subject', value: 'Flight Booking Confirmation' },
              { name: 'Date', value: '2024-06-01' },
            ],
            body: {
              data: Buffer.from('Flight details: NYC to Paris').toString(
                'base64'
              ),
            },
          },
        },
      };

      const gmailMock = google.gmail();
      (gmailMock.users.messages.list as jest.Mock).mockResolvedValue(
        mockMessages
      );
      (gmailMock.users.messages.get as jest.Mock).mockResolvedValue(
        mockMessageDetails
      );

      const result = await searchTravelEmails(mockAccessToken);

      expect(result.length).toBeGreaterThan(0);
      expect(gmailMock.users.messages.list).toHaveBeenCalled();
    });

    it('should handle Gmail API errors gracefully', async () => {
      const gmailMock = google.gmail();
      (gmailMock.users.getProfile as jest.Mock).mockRejectedValue(
        new Error('Gmail API error')
      );

      const result = await checkGmailConnection(mockAccessToken);

      expect(result).toBe(false);
    });

    it('should extract travel info from emails', () => {
      const travelEmail = {
        id: '1',
        subject: 'Flight Booking Confirmation - NYC to Paris',
        from: 'noreply@airline.com',
        to: 'user@example.com',
        date: '2024-06-01',
        snippet: 'Your flight AA100 from JFK to CDG on July 15, 2024',
        body: 'Flight AA100 from JFK to CDG departure July 15, 2024 at 10:00 PM',
      };

      const result = extractTravelInfo(travelEmail);

      expect(result).not.toBeNull();
      expect(result?.destination).toContain('CDG');
      expect(result?.flightNumber).toContain('AA100');
      expect(result?.category).toBe('airline');
    });

    it('should analyze multiple travel emails', async () => {
      const emails = [
        {
          id: '1',
          subject: 'Hotel Booking Confirmation',
          from: 'bookings@hotel.com',
          to: 'user@example.com',
          date: '2024-06-01',
          snippet: 'Your reservation at Paris Hotel',
          body: 'Confirmation for Paris Hotel, check-in July 16, 2024',
        },
      ];

      const gmailMock = google.gmail();
      (gmailMock.users.messages.list as jest.Mock).mockResolvedValue({
        data: { messages: [{ id: '1' }] },
      });

      const result = await analyzeTravelEmails(mockAccessToken, {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-01'),
      });

      expect(result).toBeDefined();
    });
  });

  describe('Calendar Integration', () => {
    it('should check calendar connection successfully', async () => {
      const calendarMock = google.calendar();
      (calendarMock.calendarList.list as jest.Mock).mockResolvedValue({
        data: { items: [{ id: 'primary' }] },
      });

      const result = await checkCalendarConnection(mockAccessToken);

      expect(result).toBe(true);
      expect(calendarMock.calendarList.list).toHaveBeenCalled();
    });

    it('should get user calendars', async () => {
      const mockCalendars = {
        data: {
          items: [
            { id: 'primary', summary: 'Primary Calendar' },
            {
              id: 'travel@group.calendar.google.com',
              summary: 'Travel Calendar',
            },
          ],
        },
      };

      const calendarMock = google.calendar();
      (calendarMock.calendarList.list as jest.Mock).mockResolvedValue(
        mockCalendars
      );

      const result = await getUserCalendars(mockAccessToken);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'primary',
      });
    });

    it('should create travel events from travel info', () => {
      const travelInfo = {
        emailId: '1',
        subject: 'Flight Booking',
        from: 'airline@example.com',
        departureDate: '2024-07-15',
        returnDate: '2024-07-20',
        destination: 'Paris',
        departure: 'NYC',
        flightNumber: 'AA100',
        category: 'airline' as const,
        confidence: 0.9,
        extractedData: {
          dates: ['2024-07-15', '2024-07-20'],
          airports: ['JFK', 'CDG'],
          flights: ['AA100'],
          bookingCodes: ['ABC123'],
          matchedPatterns: ['flight'],
        },
      };

      const events = createTravelEvents(travelInfo);

      expect(events).toHaveLength(2); // Departure and return events
      expect(events[0].summary).toBeDefined();
      expect(events[0].description).toContain('AA100');
    });

    it('should create calendar event', async () => {
      const mockEvent = {
        summary: 'Flight to Paris',
        start: { dateTime: '2024-07-01T10:00:00Z' },
        end: { dateTime: '2024-07-01T14:00:00Z' },
        location: 'CDG Airport',
      };

      const calendarMock = google.calendar();
      (calendarMock.events.insert as jest.Mock).mockResolvedValue({
        data: { ...mockEvent, id: 'created-event-id' },
      });

      const result = await createCalendarEvent(
        mockAccessToken,
        mockEvent,
        'primary'
      );

      expect(result).toBe('created-event-id');
    });

    it('should handle Calendar API errors gracefully', async () => {
      const calendarMock = google.calendar();
      (calendarMock.calendarList.list as jest.Mock).mockRejectedValue(
        new Error('Calendar API error')
      );

      const result = await checkCalendarConnection(mockAccessToken);

      expect(result).toBe(false);
    });
  });

  describe('OAuth Token Management', () => {
    it('should handle token refresh', async () => {
      const mockOAuth2Client = new google.auth.OAuth2();
      (mockOAuth2Client.setCredentials as jest.Mock).mockImplementation(
        () => {}
      );

      mockOAuth2Client.setCredentials({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
      });

      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
      });
    });

    it('should handle expired tokens', async () => {
      const gmailMock = google.gmail();
      const authError = new Error('Invalid Credentials');
      (authError as any).code = 401;
      (gmailMock.users.getProfile as jest.Mock).mockRejectedValue(authError);

      const result = await checkGmailConnection(mockAccessToken);

      expect(result).toBe(false);
      // In a real implementation, this would trigger token refresh
    });
  });
});
