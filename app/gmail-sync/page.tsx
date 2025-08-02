/**
 * DINO v2.0 - Gmail Sync Page
 * Flight data extraction from Gmail
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { GmailSyncClient } from '@/components/gmail/GmailSyncClient';

export default async function GmailSyncPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Check Gmail access status
  const hasGmailAccess = !!(session as any).accessToken;
  
  // Debug session information
  console.log('Session debug:', {
    userEmail: session.user?.email,
    hasAccessToken: !!(session as any).accessToken,
    sessionKeys: Object.keys(session),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ✈️ Gmail Flight Sync
          </h1>
          <p className="mt-2 text-gray-600">
            Automatically import your flight data from Gmail to track your travel history.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            🤖 How Gmail Sync Works
          </h2>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">1.</span>
              <span>Securely searches your Gmail for flight confirmation emails</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">2.</span>
              <span>Extracts flight details: dates, airports, airlines, booking references</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">3.</span>
              <span>Converts flights into travel periods for Schengen calculation</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">4.</span>
              <span>Presents data for review before importing to your travel tracker</span>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">🔧 Debug Information</h3>
            <div className="text-xs text-yellow-800 space-y-1">
              <div>Gmail Access: {hasGmailAccess ? '✅ Active' : '❌ Missing'}</div>
              <div>Environment: {process.env.NODE_ENV}</div>
              <div>User: {session.user?.email}</div>
            </div>
            <div className="mt-2">
              <a 
                href="/api/debug/session" 
                target="_blank"
                className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded text-yellow-900"
              >
                🔍 Debug Session Details
              </a>
            </div>
          </div>
        )}

        {/* Gmail Sync Component */}
        <GmailSyncClient 
          initialStatus={{
            hasGmailAccess,
            lastSync: null,
            isConfigured: true,
          }} 
        />

        {/* Privacy Notice */}
        <div className="mt-8 bg-gray-100 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            🔒 Privacy & Security
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• We only read emails containing flight-related keywords</div>
            <div>• Your email data is processed in real-time and not permanently stored</div>
            <div>• You can revoke Gmail access at any time from your Google account settings</div>
            <div>• All communication uses HTTPS encryption</div>
          </div>
        </div>

        {/* Supported Airlines/Platforms */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            🏢 Supported Platforms
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <div className="font-medium text-gray-900 mb-1">Booking Sites</div>
              <div>• Booking.com</div>
              <div>• Expedia</div>
              <div>• Kayak</div>
              <div>• Skyscanner</div>
            </div>
            <div>
              <div className="font-medium text-gray-900 mb-1">US Airlines</div>
              <div>• United Airlines</div>
              <div>• Delta Air Lines</div>
              <div>• American Airlines</div>
              <div>• Southwest</div>
            </div>
            <div>
              <div className="font-medium text-gray-900 mb-1">European Airlines</div>
              <div>• Lufthansa</div>
              <div>• British Airways</div>
              <div>• Air France</div>
              <div>• KLM</div>
            </div>
            <div>
              <div className="font-medium text-gray-900 mb-1">Asian Airlines</div>
              <div>• Korean Air</div>
              <div>• Singapore Airlines</div>
              <div>• Emirates</div>
              <div>• Japan Airlines</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Don't see your airline? Our AI parser can recognize most flight confirmation formats.
          </div>
        </div>
      </div>
    </div>
  );
}