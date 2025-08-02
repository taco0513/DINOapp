/**
 * DINO v2.0 - Visa Application Database Operations
 * Database operations for visa application management
 */

import { prisma } from '@/lib/prisma';
import type { VisaApplication, VisaDocument } from '@prisma/client';
// import type { VisaAlert } from '@prisma/client';

export async function getUserVisaApplications(
  userId: string,
  status?: string
) {
  try {
    return await prisma.visaApplication.findMany({
      where: { 
        userId,
        ...(status && status !== 'all' ? { status } : {})
      },
      include: {
        documents: true,
        alerts: {
          where: { isRead: false },
          orderBy: { alertDate: 'asc' }
        }
      },
      orderBy: [
        { status: 'asc' },
        { applicationDeadline: 'asc' },
        { plannedTravelDate: 'asc' }
      ]
    });
  } catch (error) {
    console.error('Error fetching visa applications:', error);
    return [];
  }
}

export async function createVisaApplication(data: {
  userId: string;
  countryCode: string;
  countryName: string;
  applicationType: string;
  plannedTravelDate: Date;
  applicationDeadline?: Date;
  notes?: string;
  alertsEnabled?: boolean;
  reminderDays?: number[];
}) {
  try {
    const application = await prisma.visaApplication.create({
      data: {
        ...data,
        status: 'planning',
        reminderDays: data.reminderDays ? JSON.stringify(data.reminderDays) : '[30,14,7,3,1]'
      }
    });

    // Create initial alerts if enabled
    if (data.alertsEnabled && data.applicationDeadline) {
      const reminders = data.reminderDays || [30, 14, 7, 3, 1];
      const alerts = reminders.map(days => {
        const alertDate = new Date(data.applicationDeadline!);
        alertDate.setDate(alertDate.getDate() - days);
        
        return {
          applicationId: application.id,
          type: 'deadline',
          title: `${data.countryName} 비자 신청 마감 ${days}일 전`,
          message: `${data.countryName} ${data.applicationType} 비자 신청 마감일이 ${days}일 남았습니다.`,
          alertDate,
          priority: days <= 3 ? 'urgent' : days <= 7 ? 'high' : 'medium'
        };
      }).filter(alert => alert.alertDate > new Date());

      if (alerts.length > 0) {
        await prisma.visaAlert.createMany({ data: alerts });
      }
    }

    return await prisma.visaApplication.findUnique({
      where: { id: application.id },
      include: { documents: true, alerts: true }
    });
  } catch (error) {
    console.error('Error creating visa application:', error);
    throw error;
  }
}

export async function updateVisaApplication(
  id: string,
  userId: string,
  data: Partial<VisaApplication>
) {
  try {
    return await prisma.visaApplication.update({
      where: { id, userId },
      data,
      include: { documents: true, alerts: true }
    });
  } catch (error) {
    console.error('Error updating visa application:', error);
    throw error;
  }
}

export async function deleteVisaApplication(id: string, userId: string) {
  try {
    await prisma.visaApplication.delete({
      where: { id, userId }
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting visa application:', error);
    throw error;
  }
}

// Document management
export async function updateDocument(
  documentId: string,
  data: Partial<VisaDocument>
) {
  try {
    return await prisma.visaDocument.update({
      where: { id: documentId },
      data
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

// Alert management
export async function getUserAlerts(userId: string, unreadOnly = false) {
  try {
    return await prisma.visaAlert.findMany({
      where: {
        application: { userId },
        ...(unreadOnly ? { isRead: false } : {}),
        alertDate: { lte: new Date() }
      },
      include: {
        application: {
          select: {
            countryName: true,
            countryCode: true,
            applicationType: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { alertDate: 'asc' }
      ]
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

export async function markAlertAsRead(alertId: string) {
  try {
    return await prisma.visaAlert.update({
      where: { id: alertId },
      data: { isRead: true }
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw error;
  }
}

export async function dismissAlert(alertId: string) {
  try {
    await prisma.visaAlert.delete({
      where: { id: alertId }
    });
    return { success: true };
  } catch (error) {
    console.error('Error dismissing alert:', error);
    throw error;
  }
}