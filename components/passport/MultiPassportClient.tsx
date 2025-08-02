/**
 * DINO v2.0 - Multi-Passport Client Component
 * Client-side wrapper for multi-passport functionality
 */

'use client';

import { useState } from 'react';
import { MultiPassportDashboard } from './MultiPassportDashboard';
import type { Passport } from '@prisma/client';

interface MultiPassportClientProps {
  initialPassports: Passport[];
}

export function MultiPassportClient({ initialPassports }: MultiPassportClientProps) {
  const [passports, setPassports] = useState(initialPassports);

  const handleAddPassport = async (passport: Omit<Passport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/passports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passport),
      });

      if (!response.ok) {
        throw new Error('Failed to add passport');
      }

      const newPassport = await response.json();
      setPassports([...passports, newPassport]);
    } catch (error) {
      console.error('Error adding passport:', error);
      // In production: show error message to user
    }
  };

  const handleUpdatePassport = async (passport: Passport) => {
    try {
      const response = await fetch(`/api/passports/${passport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passport),
      });

      if (!response.ok) {
        throw new Error('Failed to update passport');
      }

      const updatedPassport = await response.json();
      setPassports(passports.map(p => 
        p.id === updatedPassport.id ? updatedPassport : p
      ));
    } catch (error) {
      console.error('Error updating passport:', error);
      // In production: show error message to user
    }
  };

  const handleDeletePassport = async (id: string) => {
    try {
      const response = await fetch(`/api/passports/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete passport');
      }

      setPassports(passports.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting passport:', error);
      // In production: show error message to user
    }
  };

  return (
    <MultiPassportDashboard 
      passports={passports}
      onAddPassport={handleAddPassport}
      onUpdatePassport={handleUpdatePassport}
      onDeletePassport={handleDeletePassport}
    />
  );
}