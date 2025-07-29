// Email Service Tests

import {
  sendEmail,
  sendBulkEmails,
  sendTemplateEmail,
  emailTemplates,
  EmailOptions
} from '@/lib/email/service'

// Mock console.log to avoid test output noise
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation()

describe('Email Service', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear()
  })

  afterAll(() => {
    mockConsoleLog.mockRestore()
  })

  describe('sendEmail', () => {
    it('should send basic email successfully', async () => {
      const options: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        template: 'basic',
        data: { message: 'Hello World' }
      }

      const result = await sendEmail(options)

      expect(result).toBe(true)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Sending email to test@example.com with subject: Test Email'
      )
    })

    it('should handle email with CC and BCC', async () => {
      const options: EmailOptions = {
        to: 'primary@example.com',
        subject: 'CC/BCC Test',
        template: 'notification',
        data: { type: 'alert' },
        cc: ['cc1@example.com', 'cc2@example.com'],
        bcc: ['bcc@example.com']
      }

      const result = await sendEmail(options)

      expect(result).toBe(true)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Sending email to primary@example.com with subject: CC/BCC Test'
      )
    })

    it('should handle email with attachments', async () => {
      const options: EmailOptions = {
        to: 'user@example.com',
        subject: 'Email with Attachments',
        template: 'document',
        data: { document: 'report.pdf' },
        attachments: [
          {
            filename: 'report.pdf',
            content: Buffer.from('PDF content')
          },
          {
            filename: 'data.txt',
            content: 'Text file content'
          }
        ]
      }

      const result = await sendEmail(options)

      expect(result).toBe(true)
    })

    it('should handle complex email data', async () => {
      const complexData = {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          preferences: {
            language: 'en',
            timezone: 'UTC'
          }
        },
        trip: {
          destination: 'France',
          dates: {
            departure: '2024-06-01',
            return: '2024-06-10'
          }
        },
        metadata: {
          source: 'automated',
          priority: 'high'
        }
      }

      const options: EmailOptions = {
        to: 'john@example.com',
        subject: 'Trip Confirmation',
        template: 'trip-confirmation',
        data: complexData
      }

      const result = await sendEmail(options)

      expect(result).toBe(true)
    })
  })

  describe('sendBulkEmails', () => {
    it('should send multiple emails successfully', async () => {
      const emails: EmailOptions[] = [
        {
          to: 'user1@example.com',
          subject: 'Bulk Email 1',
          template: 'newsletter',
          data: { content: 'Newsletter content 1' }
        },
        {
          to: 'user2@example.com',
          subject: 'Bulk Email 2',
          template: 'newsletter',
          data: { content: 'Newsletter content 2' }
        },
        {
          to: 'user3@example.com',
          subject: 'Bulk Email 3',
          template: 'newsletter',
          data: { content: 'Newsletter content 3' }
        }
      ]

      const results = await sendBulkEmails(emails)

      expect(results).toHaveLength(3)
      expect(results.every(result => result === true)).toBe(true)
      expect(mockConsoleLog).toHaveBeenCalledTimes(3)
    })

    it('should handle empty bulk email array', async () => {
      const results = await sendBulkEmails([])

      expect(results).toEqual([])
      expect(mockConsoleLog).not.toHaveBeenCalled()
    })

    it('should handle bulk emails with different templates', async () => {
      const emails: EmailOptions[] = [
        {
          to: 'alert@example.com',
          subject: 'System Alert',
          template: 'alert',
          data: { severity: 'critical', message: 'System down' }
        },
        {
          to: 'welcome@example.com',
          subject: 'Welcome!',
          template: 'welcome',
          data: { username: 'newuser' }
        },
        {
          to: 'visa@example.com',
          subject: 'Visa Expiry Warning',
          template: 'visa-expiry',
          data: { country: 'France', daysLeft: 30 }
        }
      ]

      const results = await sendBulkEmails(emails)

      expect(results).toEqual([true, true, true])
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Sending email to alert@example.com with subject: System Alert'
      )
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Sending email to welcome@example.com with subject: Welcome!'
      )
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Sending email to visa@example.com with subject: Visa Expiry Warning'
      )
    })
  })

  describe('sendTemplateEmail', () => {
    it('should send template email with generated subject', async () => {
      const result = await sendTemplateEmail(
        'template@example.com',
        'welcome',
        { username: 'testuser', firstName: 'Test' }
      )

      expect(result).toBe(true)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Sending email to template@example.com with subject: Template: welcome'
      )
    })

    it('should handle different template types', async () => {
      const templates = ['alert', 'visa-expiry', 'flight-check-in', 'reset-password']

      for (const template of templates) {
        const result = await sendTemplateEmail(
          `${template}@example.com`,
          template,
          { data: `${template} data` }
        )

        expect(result).toBe(true)
        expect(mockConsoleLog).toHaveBeenCalledWith(
          `Sending email to ${template}@example.com with subject: Template: ${template}`
        )
      }
    })

    it('should handle complex template data', async () => {
      const templateData = {
        visa: {
          country: 'Germany',
          expiryDate: '2024-12-31',
          type: 'Tourist'
        },
        user: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        },
        alert: {
          severity: 'warning',
          daysUntilExpiry: 14
        }
      }

      const result = await sendTemplateEmail(
        'jane@example.com',
        'visa-expiry',
        templateData
      )

      expect(result).toBe(true)
    })
  })

  describe('emailTemplates', () => {
    it('should provide all required email templates', () => {
      expect(emailTemplates.alert).toBe('alert')
      expect(emailTemplates.visaExpiry).toBe('visa-expiry')
      expect(emailTemplates.flightCheckIn).toBe('flight-check-in')
      expect(emailTemplates.systemAnnouncement).toBe('system-announcement')
      expect(emailTemplates.welcome).toBe('welcome')
      expect(emailTemplates.resetPassword).toBe('reset-password')
    })

    it('should have consistent template naming', () => {
      const templateValues = Object.values(emailTemplates)
      const uniqueValues = new Set(templateValues)

      // All template values should be unique
      expect(templateValues.length).toBe(uniqueValues.size)

      // All template values should be strings
      templateValues.forEach(template => {
        expect(typeof template).toBe('string')
        expect(template.length).toBeGreaterThan(0)
      })
    })

    it('should support template enumeration', () => {
      const templateKeys = Object.keys(emailTemplates)
      expect(templateKeys).toContain('alert')
      expect(templateKeys).toContain('visaExpiry')
      expect(templateKeys).toContain('flightCheckIn')
      expect(templateKeys).toContain('systemAnnouncement')
      expect(templateKeys).toContain('welcome')
      expect(templateKeys).toContain('resetPassword')
    })
  })

  describe('Integration scenarios', () => {
    it('should handle visa expiry notification workflow', async () => {
      // Step 1: Send individual visa expiry alert
      const alertResult = await sendTemplateEmail(
        'user@example.com',
        emailTemplates.visaExpiry,
        {
          country: 'France',
          expiryDate: '2024-07-15',
          daysLeft: 7
        }
      )

      expect(alertResult).toBe(true)

      // Step 2: Send bulk reminders to multiple users
      const bulkReminders: EmailOptions[] = [
        {
          to: 'user1@example.com',
          subject: 'Visa Expiry Reminder - France',
          template: emailTemplates.visaExpiry,
          data: { country: 'France', daysLeft: 7 }
        },
        {
          to: 'user2@example.com',
          subject: 'Visa Expiry Reminder - Germany',
          template: emailTemplates.visaExpiry,
          data: { country: 'Germany', daysLeft: 14 }
        }
      ]

      const bulkResults = await sendBulkEmails(bulkReminders)
      expect(bulkResults.every(result => result === true)).toBe(true)
    })

    it('should handle system alert cascade', async () => {
      // System alert to administrators
      const adminAlert: EmailOptions = {
        to: 'admin@example.com',
        subject: 'Critical System Alert',
        template: emailTemplates.alert,
        data: {
          severity: 'critical',
          message: 'Database connection lost',
          timestamp: new Date().toISOString()
        },
        cc: ['tech-lead@example.com'],
        bcc: ['monitoring@example.com']
      }

      const adminResult = await sendEmail(adminAlert)
      expect(adminResult).toBe(true)

      // User notification about service disruption
      const userNotification = await sendTemplateEmail(
        'users@example.com',
        emailTemplates.systemAnnouncement,
        {
          title: 'Service Maintenance',
          message: 'We are experiencing temporary service disruption',
          estimatedDuration: '30 minutes'
        }
      )

      expect(userNotification).toBe(true)
    })

    it('should handle new user onboarding flow', async () => {
      const userData = {
        username: 'newuser123',
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        registrationDate: '2024-01-15'
      }

      // Welcome email
      const welcomeResult = await sendTemplateEmail(
        userData.email,
        emailTemplates.welcome,
        userData
      )

      expect(welcomeResult).toBe(true)

      // Follow-up with system announcement
      const announcementResult = await sendTemplateEmail(
        userData.email,
        emailTemplates.systemAnnouncement,
        {
          title: 'Getting Started Guide',
          message: 'Here are some tips to get you started...'
        }
      )

      expect(announcementResult).toBe(true)
    })
  })
})