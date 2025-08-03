/**
 * DINO v3.0 - Home Page (Redirects to Dashboard)
 * Dashboard-centric approach for immediate value
 */

import { redirect } from 'next/navigation';

export default function Home() {
  // v3.0: Dashboard-centric navigation
  // All users (demo or authenticated) start at the dashboard
  redirect('/dashboard');
  
  return null;
}