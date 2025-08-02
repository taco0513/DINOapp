/**
 * DINO v2.0 - Flight Demo Page
 * Showcase page for flight card components
 */

import { FlightCardDemo } from '@/components/ui/FlightCardDemo';

export default function FlightDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <FlightCardDemo />
    </div>
  );
}

export const metadata = {
  title: '항공편 카드 데모 - DINO v2.0',
  description: '디지털 노마드를 위한 현대적인 항공편 카드 UI 컴포넌트',
};