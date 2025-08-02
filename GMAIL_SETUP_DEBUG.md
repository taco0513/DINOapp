# Gmail OAuth Debug Guide

## Issue: Gmail Authorization Not Working on Localhost

The Gmail API has strict requirements that often cause issues in local development.

## Debug Steps

### 1. Check Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Enabled APIs**
4. Verify **Gmail API** is enabled
5. Go to **OAuth consent screen**
6. Check if app is in "Testing" mode (required for localhost)

### 2. OAuth Consent Screen Configuration

**For Development (localhost):**
- User Type: **External** 
- Publishing Status: **Testing**
- Add your email to "Test users"

**Required Scopes:**
```
https://www.googleapis.com/auth/gmail.readonly
```

### 3. Credentials Configuration

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
```

### 4. Current Environment Variables

Check `.env.local`:
```bash
GOOGLE_CLIENT_ID=80225773538-73850ogg76idjnb1bbh796620rtavkbe.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXTAUTH_URL="http://localhost:3000"
```

## Common Issues & Fixes

### Issue 1: "This app isn't verified"
**Solution:** Add your email to test users in OAuth consent screen

### Issue 2: "access_denied" error
**Solution:** 
1. Enable Gmail API in Google Cloud Console
2. Set app to "Testing" mode
3. Add gmail.readonly scope to consent screen

### Issue 3: No access token in session
**Solution:**
1. Sign out completely: `/api/auth/signout`
2. Clear browser cookies for localhost:3000
3. Sign in again with fresh consent

### Issue 4: "redirect_uri_mismatch"
**Solution:** Verify redirect URI exactly matches:
```
http://localhost:3000/api/auth/callback/google
```

## Quick Test Commands

```bash
# Clear session and test
curl http://localhost:3000/api/auth/signout

# Check current session
curl http://localhost:3000/api/auth/session

# Test Gmail sync status
curl http://localhost:3000/api/gmail/sync
```

## Alternative: Use Public URL for Testing

If localhost continues to fail:

1. **Use ngrok for HTTPS:**
```bash
npx ngrok http 3000
# Update OAuth redirect to: https://xyz.ngrok.io/api/auth/callback/google
```

2. **Deploy to Vercel:**
```bash
npm run build
vercel deploy
# Update OAuth redirect to: https://your-app.vercel.app/api/auth/callback/google
```

## Expected Working Flow

1. User clicks "Authorize Gmail Access"
2. Redirects to Google OAuth consent screen
3. User grants Gmail read permission
4. Returns with access token that includes Gmail scope
5. Gmail sync API can access flight emails

## Debug Session Information

The session should include:
```javascript
{
  user: { email: "...", name: "..." },
  accessToken: "ya29.a0ARrdaM...", // This is crucial for Gmail API
  expires: "..."
}
```