/**
 * DINO v2.0 - Gmail API Service
 * Strict TypeScript implementation for Gmail integration
 */

import type { GmailMessage } from '@/types/gmail';

export class GmailService {
  private readonly accessToken: string;
  private readonly baseUrl = 'https://gmail.googleapis.com/gmail/v1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Search for flight-related emails
   */
  async searchFlightEmails(options: {
    readonly maxResults?: number;
    readonly dateAfter?: Date;
    readonly dateBefore?: Date;
  } = {}): Promise<readonly string[]> {
    const { maxResults = 50, dateAfter, dateBefore } = options;
    
    // Build Gmail search query for flight emails
    const queryParts = [
      // Travel booking sites
      '(from:booking.com OR from:expedia.com OR from:kayak.com OR from:skyscanner.com OR from:priceline.com OR from:orbitz.com OR from:travelocity.com)',
      // Airlines - US
      'OR (from:united.com OR from:delta.com OR from:american.com OR from:southwest.com OR from:jetblue.com OR from:alaskaair.com)',
      // Airlines - International  
      'OR (from:lufthansa.com OR from:emirates.com OR from:britishairways.com OR from:airfrance.com OR from:klm.com OR from:singaporeair.com)',
      // Airlines - Asian
      'OR (from:koreanair.com OR from:flyasiana.com OR from:jal.co.jp OR from:ana.co.jp OR from:cathaypacific.com OR from:evaair.com OR from:thaiairways.com OR from:malaysiaairlines.com)',
      // Subject patterns
      'OR (subject:"flight" OR subject:"boarding" OR subject:"itinerary" OR subject:"confirmation" OR subject:"ticket" OR subject:"travel")',
      // Body patterns
      'OR (body:"flight number" OR body:"departure" OR body:"arrival" OR body:"gate" OR body:"boarding pass" OR body:"check-in")'
    ];

    if (dateAfter) {
      queryParts.push(`after:${this.formatDate(dateAfter)}`);
    }
    if (dateBefore) {
      queryParts.push(`before:${this.formatDate(dateBefore)}`);
    }

    const query = queryParts.join(' ');
    
    try {
      const response = await fetch(
        `${this.baseUrl}/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Gmail authentication expired. Please re-authenticate.');
        }
        throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { messages?: Array<{ id: string }> };
      return data.messages?.map(msg => msg.id) ?? [];
    } catch (error) {
      console.error('Gmail search error:', error);
      throw new Error(`Failed to search Gmail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get full message details
   */
  async getMessage(messageId: string): Promise<GmailMessage> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/me/messages/${messageId}?format=full`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Gmail authentication expired. Please re-authenticate.');
        }
        throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as GmailMessage;
    } catch (error) {
      console.error('Gmail message fetch error:', error);
      throw new Error(`Failed to fetch message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text content from Gmail message
   */
  extractTextContent(message: GmailMessage): string {
    const extractFromPart = (part: any): string => {
      let text = '';
      
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text += this.decodeBase64(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        // Basic HTML to text conversion
        const html = this.decodeBase64(part.body.data);
        text += html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      
      if (part.parts) {
        for (const subPart of part.parts) {
          text += ' ' + extractFromPart(subPart);
        }
      }
      
      return text;
    };

    return extractFromPart(message.payload).trim();
  }

  /**
   * Get message headers
   */
  getHeaders(message: GmailMessage): Record<string, string> {
    const headers: Record<string, string> = {};
    
    for (const header of message.payload.headers) {
      headers[header.name.toLowerCase()] = header.value;
    }
    
    return headers;
  }

  /**
   * Check if message is likely a flight email
   */
  isFlightEmail(message: GmailMessage, textContent: string): boolean {
    const headers = this.getHeaders(message);
    const subject = headers['subject']?.toLowerCase() ?? '';
    const from = headers['from']?.toLowerCase() ?? '';
    const content = textContent.toLowerCase();

    // Flight-related keywords
    const flightKeywords = [
      'flight', 'boarding', 'itinerary', 'confirmation', 'ticket',
      'departure', 'arrival', 'gate', 'terminal', 'seat',
      'airline', 'aircraft', 'boeing', 'airbus'
    ];

    // Travel booking domains
    const bookingDomains = [
      'booking.com', 'expedia.com', 'kayak.com', 'skyscanner.com',
      'priceline.com', 'orbitz.com', 'travelocity.com',
      // US Airlines
      'united.com', 'delta.com', 'american.com', 'southwest.com', 'jetblue.com', 'alaskaair.com',
      // International Airlines
      'lufthansa.com', 'emirates.com', 'britishairways.com', 'airfrance.com', 'klm.com', 'singaporeair.com',
      // Asian Airlines
      'koreanair.com', 'asiana.com', 'jal.co.jp', 'ana.co.jp', 'cathaypacific.com', 'evaair.com',
      // Other travel services
      'agoda.com', 'hotels.com', 'trip.com', 'momondo.com'
    ];

    // Check subject line
    const hasFlightSubject = flightKeywords.some(keyword => subject.includes(keyword));
    
    // Check sender domain
    const hasBookingDomain = bookingDomains.some(domain => from.includes(domain));
    
    // Check content
    const hasFlightContent = flightKeywords.filter(keyword => content.includes(keyword)).length >= 2;
    
    // Flight number pattern (e.g., UA123, DL4567)
    const hasFlightNumber = /\b[A-Z]{2}\d{3,4}\b/.test(content);

    return hasFlightSubject || hasBookingDomain || (hasFlightContent && hasFlightNumber);
  }

  /**
   * Format date for Gmail API
   */
  private formatDate(date: Date): string {
    return Math.floor(date.getTime() / 1000).toString();
  }

  /**
   * Decode base64 content
   */
  private decodeBase64(data: string): string {
    try {
      // Gmail uses URL-safe base64
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      return Buffer.from(base64, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Base64 decode error:', error);
      return '';
    }
  }
}

/**
 * Create Gmail service instance with access token
 */
export function createGmailService(accessToken: string): GmailService {
  return new GmailService(accessToken);
}