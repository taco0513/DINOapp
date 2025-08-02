/**
 * DINO v2.0 - Visa Database Operations
 * Database operations for visa management
 */

import { prisma } from '@/lib/prisma';
import type { Visa } from '@prisma/client';

export async function getUserVisas(
  userId: string,
  includeExpired = true
) {
  try {
    return await prisma.visa.findMany({
      where: { 
        userId,
        ...(includeExpired ? {} : {
          expiryDate: { gte: new Date() }
        })
      },
      orderBy: [
        { status: 'asc' },
        { expiryDate: 'asc' }
      ]
    });
  } catch (error) {
    console.error('Error fetching visas:', error);
    return [];
  }
}

export async function getExpiringVisas(
  userId: string,
  daysAhead = 90
) {
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return await prisma.visa.findMany({
      where: {
        userId,
        expiryDate: {
          gte: new Date(),
          lte: futureDate
        },
        status: 'active'
      },
      orderBy: { expiryDate: 'asc' }
    });
  } catch (error) {
    console.error('Error fetching expiring visas:', error);
    return [];
  }
}

export async function createVisa(data: {
  userId: string;
  country: string;
  countryName: string;
  visaType: string;
  issueDate: Date;
  expiryDate: Date;
  maxStayDays: number;
  entries: string;
  notes?: string;
  documentUrl?: string;
}) {
  try {
    return await prisma.visa.create({
      data: {
        ...data,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error creating visa:', error);
    throw error;
  }
}

export async function updateVisa(
  id: string,
  userId: string,
  data: Partial<Visa>
) {
  try {
    // Update status based on expiry date
    if (data.expiryDate) {
      const expiryDate = new Date(data.expiryDate);
      if (expiryDate < new Date()) {
        data.status = 'expired';
      } else {
        data.status = 'active';
      }
    }
    
    return await prisma.visa.update({
      where: { id, userId },
      data
    });
  } catch (error) {
    console.error('Error updating visa:', error);
    throw error;
  }
}

export async function deleteVisa(id: string, userId: string) {
  try {
    await prisma.visa.delete({
      where: { id, userId }
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting visa:', error);
    throw error;
  }
}

export async function updateExpiredVisaStatuses(userId: string) {
  try {
    const result = await prisma.visa.updateMany({
      where: {
        userId,
        expiryDate: { lt: new Date() },
        status: 'active'
      },
      data: {
        status: 'expired'
      }
    });
    
    return result.count;
  } catch (error) {
    console.error('Error updating expired visa statuses:', error);
    return 0;
  }
}