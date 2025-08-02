/**
 * DINO v2.0 - Visa Tracker Client Component
 * Client-side wrapper for visa tracking functionality
 */

'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import { VisaExpiryTracker } from './VisaExpiryTracker';
import type { Visa } from '@prisma/client';

interface VisaTrackerClientProps {
  initialVisas: Visa[];
}

export function VisaTrackerClient({ initialVisas }: VisaTrackerClientProps) {
  const [visas] = useState(initialVisas);
  // const router = useRouter();

  const handleRenewVisa = (visa: Visa) => {
    // Navigate to visa renewal page or show renewal modal
    console.log('Renew visa:', visa);
    // In production: router.push(`/visa-assistant?renew=${visa.id}`)
  };

  const handleUpdateVisa = (visa: Visa) => {
    // Navigate to visa edit page or show edit modal
    console.log('Update visa:', visa);
    // In production: router.push(`/visa/edit/${visa.id}`)
  };

  return (
    <VisaExpiryTracker
      visas={visas}
      onRenewVisa={handleRenewVisa}
      onUpdateVisa={handleUpdateVisa}
    />
  );
}