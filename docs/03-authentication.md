# Authentication Flow Documentation

## Overview

Smart Bookmark uses **Google OAuth 2.0** for authentication, managed by Supabase Auth. This provides a secure, passwordless login experience without requiring you to manage sensitive credentials.

## Authentication Architecture

### Components Involved

1. **Login Page** (`app/login/page.tsx`)
   - Client component with Google sign-in button
   - Initiates OAuth flow

2. **OAuth Callback** (`app/api/auth/callback/route.ts`)
   - Server route that handles Google's redirect
   - Exchanges authorization code for session

3. **Middleware** (`middleware.ts`)
   - Runs on every request
   - Refreshes user session
   - Protects `/dashboard` route

4. **Supabase Clients**
   - `lib/supabase/client.ts` - Browser client
   - `lib/supabase/server.ts` - Server client
   - `lib/supabase/middleware.ts` - Middleware client

## Flow Diagram

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Visits app
     ▼
┌──────────────────┐
│   app/page.tsx   │ ──── Check session
└────┬─────────────┘
     │
     │ No session
     ▼
┌──────────────────┐
│  app/login/      │
│  page.tsx        │
└────┬─────────────┘
     │
     │ 2. Click "Continue with Google"
     ▼
┌──────────────────┐
│   Supabase Auth  │
└────┬─────────────┘
     │
     │ 3. Redirect to Google
     ▼
┌──────────────────┐
│  Google OAuth    │
└────┬─────────────┘
     │
     │ 4. User grants permission
     ▼
┌──────────────────────┐
│  app/api/auth/       │
│  callback/route.ts   │ ──── 5. Exchange code for session
└────┬─────────────────┘
     │
     │ 6. Set cookies
     ▼
┌──────────────────┐
│  app/dashboard/  │
│  page.tsx        │
└──────────────────┘
```

## Detailed Flow

### Step 1: User Visits App

When a user visits the root URL (`/`), the `app/page.tsx` checks for an active session:

```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

if (user) {
  redirect('/dashboard')
} else {
  redirect('/login')
}
```

### Step 2: Login Page

On `/login`, the user sees the Google sign-in button. When clicked:

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/api/auth/callback`,
  },
})
```

This redirects to Supabase, which then redirects to Google.

### Step 3: Google Authorization

Google displays a consent screen where the user:
- Chooses a Google account
- Grants permission to access basic profile info (name, email, photo)

### Step 4: OAuth Callback

After authorization, Google redirects back to `/api/auth/callback?code=...`

The callback route exchanges the code for a session:

```typescript
const code = searchParams.get('code')
if (code) {
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  // Session is now active and stored in cookies
  return NextResponse.redirect('/dashboard')
}
```

### Step 5: Session Management

The session is stored in HTTP-only cookies managed by Supabase:
- `sb-access-token` - JWT for API authentication
- `sb-refresh-token` - Refresh token for session renewal

These cookies are automatically sent with every request.

### Step 6: Middleware Protection

On every request, the middleware runs:

```typescript
export async function middleware(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect('/login')
  }
  
  return supabaseResponse
}
```

This:
- Refreshes the session if needed
- Redirects unauthenticated users away from `/dashboard`
- Allows the request to proceed if authorized

## Session Persistence

### Cookie Storage
Sessions are stored as HTTP-only cookies, which are:
- Secure (HTTPS only in production)
- Not accessible via JavaScript (prevents XSS attacks)
- Automatically sent with every request

### Token Refresh
Supabase automatically refreshes the access token when it expires:
- Access tokens expire after 1 hour
- Middleware calls `getUser()` which refreshes if needed
- Users stay logged in without manual re-authentication

### Logout

To log out:

```typescript
await supabase.auth.signOut()
router.push('/login')
```

This:
- Clears the session from Supabase
- Removes cookies
- Redirects to login page

## Security Considerations

### PKCE Flow
Supabase uses PKCE (Proof Key for Code Exchange) for OAuth:
- Generates a random `code_verifier`
- Sends hashed `code_challenge` to Google
- Verifies integrity on callback
- Prevents authorization code interception attacks

### Session Security
- HTTP-only cookies prevent XSS access
- SameSite cookie attribute prevents CSRF
- Short-lived access tokens minimize exposure
- Refresh tokens are rotated on use

### User Data
From Google OAuth, we receive:
- Email address
- Full name
- Profile picture URL

This is stored in Supabase's `auth.users` table. We don't request additional scopes.

## Client vs Server Authentication

### Browser Client (`lib/supabase/client.ts`)
Used for:
- Client components
- Browser-side auth operations
- Real-time subscriptions

```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Server Client (`lib/supabase/server.ts`)
Used for:
- Server components
- API routes
- Server-side rendering

```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

## Troubleshooting

### "User not authenticated" error
- Check that cookies are enabled in browser
- Verify redirect URIs match in Google Console and Supabase
- Clear cookies and try logging in again

### Infinite redirect loop
- Ensure middleware isn't redirecting authenticated users incorrectly
- Check that `/dashboard` route is protected but accessible after login

### OAuth error on Google
- Verify OAuth consent screen is configured
- Check that redirect URI is added to allowed list
- Ensure Google OAuth is enabled in Supabase

## Related Files

- `app/login/page.tsx` - Login UI
- `app/api/auth/callback/route.ts` - OAuth callback handler
- `middleware.ts` - Route protection and session refresh
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client
- `lib/supabase/middleware.ts` - Middleware Supabase client
