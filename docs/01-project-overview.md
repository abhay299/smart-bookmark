# Smart Bookmark Manager - Project Overview

## Introduction

Smart Bookmark is a modern, privacy-focused bookmark manager built with Next.js 16, Supabase, and Tailwind CSS. It allows users to save, organize, and search their bookmarks with real-time synchronization across multiple devices and browser tabs.

## Key Features

### 1. **Google OAuth Authentication**
- Secure sign-in using Google OAuth 2.0
- No password management required
- Session persistence across visits

### 2. **Private Bookmarks**
- Each user has their own private collection
- Row-Level Security (RLS) ensures data isolation
- No user can access another user's bookmarks

### 3. **Real-Time Synchronization**
- Instant updates across all open tabs
- Uses Supabase Realtime subscriptions
- Add, edit, or delete in one tab, see changes immediately everywhere

### 4. **Smart Title Auto-Fetch**
- Automatically fetches page titles from URLs
- Falls back to domain name if title extraction fails
- Titles are editable before saving

### 5. **Duplicate Prevention**
- Database-level unique constraint on (user_id, url)
- Client-side validation before insertion
- Clear error messages for duplicates

### 6. **Search & Filter**
- Real-time search by title or URL
- Case-insensitive filtering
- Result count display

### 7. **Bookmark Editing**
- Update bookmark titles and URLs after creation
- Edit via inline modal with validation
- Changes propagate in real-time across tabs

### 8. **Modern UI/UX**
- Dark theme design
- Skeleton loading states
- Toast notifications for feedback
- Smooth animations and transitions
- Responsive design for all devices

## Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **lucide-react** (icons)
- **react-hot-toast** (notifications)

### Backend & Database
- **Supabase**
  - Authentication (Google OAuth)
  - PostgreSQL Database
  - Row-Level Security (RLS)
  - Realtime subscriptions
- **@supabase/ssr** (SSR support for Next.js)

### Deployment
- **Vercel** (hosting platform)

## Architecture Overview

### File Structure
```
smart-bookmark/
├── app/
│   ├── login/              # Authentication page
│   ├── dashboard/          # Main app dashboard
│   ├── api/
│   │   ├── auth/callback/  # OAuth callback handler
│   │   └── fetch-title/    # Title fetching API
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home redirect
│   └── globals.css         # Global styles
├── components/
│   ├── bookmarks/          # Bookmark-related components
│   ├── ui/                 # Reusable UI components
│   └── providers/          # App providers (Toast)
├── lib/
│   ├── supabase/           # Supabase client configurations
│   └── utils.ts            # Utility functions
├── types/
│   └── database.types.ts   # TypeScript types
├── docs/                   # Documentation
└── middleware.ts           # Auth middleware
```

### Data Flow

1. **Authentication Flow**
   - User clicks "Continue with Google" on `/login`
   - Supabase redirects to Google OAuth
   - Google redirects back to `/api/auth/callback`
   - Callback exchanges code for session
   - User redirected to `/dashboard`

2. **Bookmark Creation Flow**
   - User enters URL in form
   - On blur, title is auto-fetched from `/api/fetch-title`
   - User can edit title
   - On submit, bookmark is inserted into Supabase
   - Duplicate check happens before insertion
   - Real-time subscription broadcasts INSERT to all tabs

3. **Real-Time Sync Flow**
   - Component subscribes to `bookmarks` table changes
   - Supabase broadcasts INSERT/DELETE events
   - All subscribed clients receive updates
   - UI updates automatically

## Security

### Authentication
- OAuth tokens managed by Supabase
- HTTP-only cookies for session storage
- Middleware refreshes sessions automatically

### Authorization
- Row-Level Security (RLS) policies enforce user isolation
- Every query is automatically scoped to `auth.uid()`
- Users can only INSERT/SELECT/UPDATE/DELETE their own bookmarks

### Data Validation
- URL validation on client and server
- SQL injection prevention via parameterized queries
- XSS protection via React's default escaping

## Design Principles

1. **Simplicity First** - Clean, intuitive interface
2. **Privacy by Default** - RLS ensures complete data isolation
3. **Real-Time Experience** - Instant updates across devices
4. **Performance** - Optimized loading with skeletons and lazy loading
5. **Accessibility** - Semantic HTML and keyboard navigation

## Getting Started

See [02-environment-setup.md](./02-environment-setup.md) for installation and setup instructions.
