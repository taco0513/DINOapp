/**
 * DINO v2.0 - Passport Database Operations
 * Database operations for multiple passport management
 */

import { prisma } from '@/lib/prisma';
import type { Passport } from '@prisma/client';

export async function getUserPassports(userId: string) {
  try {
    return await prisma.passport.findMany({
      where: { userId },
      orderBy: [
        { isPrimary: 'desc' },
        { isActive: 'desc' },
        { expiryDate: 'desc' }
      ]
    });
  } catch (error) {
    console.error('Error fetching passports:', error);
    return [];
  }
}

export async function createPassport(data: {
  userId: string;
  countryCode: string;
  countryName: string;
  passportNumber: string;
  issueDate: Date;
  expiryDate: Date;
  isPrimary?: boolean;
  notes?: string;
}) {
  try {
    // If this is the first passport or marked as primary, set it as primary
    const existingPassports = await prisma.passport.count({
      where: { userId: data.userId }
    });

    if (existingPassports === 0 || data.isPrimary) {
      // Unset other primary passports
      await prisma.passport.updateMany({
        where: { userId: data.userId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    return await prisma.passport.create({
      data: {
        ...data,
        isPrimary: existingPassports === 0 || data.isPrimary || false
      }
    });
  } catch (error) {
    console.error('Error creating passport:', error);
    throw error;
  }
}

export async function updatePassport(
  id: string,
  userId: string,
  data: Partial<Passport>
) {
  try {
    // If setting as primary, unset others
    if (data.isPrimary) {
      await prisma.passport.updateMany({
        where: { userId, isPrimary: true, id: { not: id } },
        data: { isPrimary: false }
      });
    }

    return await prisma.passport.update({
      where: { id, userId },
      data
    });
  } catch (error) {
    console.error('Error updating passport:', error);
    throw error;
  }
}

export async function deletePassport(id: string, userId: string) {
  try {
    const passport = await prisma.passport.findUnique({
      where: { id }
    });

    if (!passport || passport.userId !== userId) {
      throw new Error('Passport not found or unauthorized');
    }

    await prisma.passport.delete({
      where: { id }
    });

    // If deleted passport was primary, set another as primary
    if (passport.isPrimary) {
      const firstActive = await prisma.passport.findFirst({
        where: { userId, isActive: true },
        orderBy: { expiryDate: 'desc' }
      });

      if (firstActive) {
        await prisma.passport.update({
          where: { id: firstActive.id },
          data: { isPrimary: true }
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting passport:', error);
    throw error;
  }
}