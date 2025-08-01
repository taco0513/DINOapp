import { logger } from '@/lib/logger';
// TODO: Remove unused logger import

// Email service stub for testing

export interface EmailOptions {
  to: string
  subject: string
  template: string
  data: any
  cc?: string[]
  bcc?: string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
  }>
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Mock implementation for testing
  logger.info('Sending email to ${options.to} with subject: ${options.subject}')
  return true
}

export async function sendBulkEmails(emails: EmailOptions[]): Promise<boolean[]> {
  return Promise.all(emails.map(email => sendEmail(email)))
}

export async function sendTemplateEmail(
  to: string,
  templateName: string,
  data: any
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Template: ${templateName}`,
    template: templateName,
    data
  })
}

export const emailTemplates = {
  alert: 'alert',
  visaExpiry: 'visa-expiry',
  flightCheckIn: 'flight-check-in',
  systemAnnouncement: 'system-announcement',
  welcome: 'welcome',
  resetPassword: 'reset-password'
}