# Environment Setup Guide

## Prerequisites

Before setting up the Smart Bookmark project, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **pnpm** package manager ([Install](https://pnpm.io/installation))
  ```bash
  npm install -g pnpm
  ```
- **Git** for version control
- A **Supabase account** ([Sign up](https://supabase.com/))
- A **Google Cloud account** for OAuth ([Console](https://console.cloud.google.com/))

## 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-bookmark
```

## 2. Install Dependencies

```bash
pnpm install
```

This will install:
- Next.js and React
- Supabase client libraries
- Tailwind CSS
- TypeScript
- UI libraries (lucide-react, react-hot-toast, clsx)

## 3. Supabase Setup

### 3.1 Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Enter project details:
   - Name: `smart-bookmark`
   - Database Password: (save this securely)
   - Region: (choose closest to your users)
4. Wait for project to be created (~2 minutes)

### 3.2 Get Supabase Credentials

1. Go to **Project Settings** > **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGc...`)

### 3.3 Run Database Migration

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy the contents of `supabase-schema.sql` from the project root
4. Paste and click "Run"
5. Verify the `bookmarks` table was created in **Database** > **Tables**

### 3.4 Enable Realtime

1. Go to **Database** > **Replication**
2. Find the `bookmarks` table
3. Toggle **Realtime** to ON
4. Confirm the change

## 4. Google OAuth Setup

### 4.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: Smart Bookmark
   - User support email: (your email)
   - Developer contact: (your email)
   - Save and continue through scopes and test users

6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: Smart Bookmark
   - Authorized redirect URIs:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
     (Replace `<your-project-ref>` with your actual Supabase project reference)

7. Copy **Client ID** and **Client Secret**

### 4.2 Configure Google Provider in Supabase

1. Go to your Supabase project
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and click to enable
4. Enter:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
5. Click **Save**

## 5. Environment Variables

Create a `.env` (or `.env.local`) file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual Supabase credentials from step 3.2. These names must match what the app reads in `lib/supabase/*`.

> **Note**: The `.env.local` file is git-ignored for security. Never commit secrets to version control.

## 6. Run Development Server

```bash
pnpm dev
```

The app will be available at: [http://localhost:3000](http://localhost:3000)

## 7. Verify Setup

1. Navigate to `http://localhost:3000`
2. You should be redirected to `/login`
3. Click "Continue with Google"
4. Complete Google OAuth flow
5. You should land on `/dashboard`
6. Try adding a bookmark!

## Troubleshooting

### "Invalid login credentials" error
- Check that your Supabase URL and anon key are correct
- Verify environment variables are loaded (restart dev server)

### Google OAuth not working
- Verify redirect URI in Google Console matches Supabase callback URL
- Check that Google provider is enabled in Supabase
- Ensure Client ID and Secret are correctly entered

### Bookmarks not saving
- Check that you ran the SQL migration (step 3.3)
- Verify RLS policies are created
- Check browser console for errors

### Real-time not working
- Ensure Realtime is enabled for `bookmarks` table (step 3.4)
- Check network tab for WebSocket connection
- Verify Supabase project is not paused

## Next Steps

- Read [03-authentication.md](./03-authentication.md) to understand the auth flow
- See [04-database-schema.md](./04-database-schema.md) for database details
- Explore [05-bookmark-features.md](./05-bookmark-features.md) for feature documentation
