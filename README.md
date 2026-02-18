# 🔖 Smart Bookmark

A modern, privacy-focused bookmark manager with real-time synchronization across devices. Built with Next.js, Supabase, and Tailwind CSS.

![Smart Bookmark Banner](https://via.placeholder.com/1200x400/1f2937/3b82f6?text=Smart+Bookmark)

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure, passwordless login
- 🔒 **Private Bookmarks** - Your bookmarks are completely private
- ⚡ **Real-Time Sync** - Changes instantly appear across all your devices and tabs
- ✏️ **Edit Bookmarks** - Update bookmark titles and URLs in place
- 🤖 **Auto-Fetch Titles** - Automatically extracts page titles from URLs
- 🚫 **Duplicate Prevention** - Can't accidentally save the same URL twice
- 🔍 **Search & Filter** - Quickly find bookmarks by title or URL
- 🎨 **Modern Dark UI** - Beautiful, responsive dark theme
- 📱 **Mobile Friendly** - Works perfectly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- pnpm ([Install](https://pnpm.io/installation)) or npm
- Supabase account ([Sign up](https://supabase.com/))
- Google Cloud account for OAuth ([Console](https://console.cloud.google.com/))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/abhay299/smart-bookmark.git
   cd smart-bookmark
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**

   Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor

5. **Configure Google OAuth**

   See [Environment Setup Guide](./docs/02-environment-setup.md#4-google-oauth-setup) for detailed steps

6. **Run the development server**

   ```bash
   pnpm dev
   ```

7. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

Complete documentation is available in the `/docs` folder:

| Document | Description |
|----------|-------------|
| [01-project-overview.md](./docs/01-project-overview.md) | Project architecture and features |
| [02-environment-setup.md](./docs/02-environment-setup.md) | Complete setup instructions |
| [03-authentication.md](./docs/03-authentication.md) | How OAuth authentication works |
| [04-database-schema.md](./docs/04-database-schema.md) | Database structure and RLS policies |
| [05-bookmark-features.md](./docs/05-bookmark-features.md) | How bookmark features work |
| [06-realtime-sync.md](./docs/06-realtime-sync.md) | Real-time synchronization explained |
| [07-ui-components.md](./docs/07-ui-components.md) | UI component library |
| [08-deployment.md](./docs/08-deployment.md) | Deploying to Vercel |

## 🛠 Tech Stack
### Frontend

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Styling
- **[Lucide React](https://lucide.dev/)** - Icons
- **[React Hot Toast](https://react-hot-toast.com/)** - Notifications

### Backend & Database

- **[Supabase](https://supabase.com/)**
  - PostgreSQL database
  - Row-Level Security (RLS)
  - Google OAuth authentication
  - Real-time subscriptions

### Deployment

- **[Vercel](https://vercel.com/)** - Hosting and deployment

## 🏗 Project Structure

```text
smart-bookmark/
├── app/
│   ├── login/              # Authentication page
│   ├── dashboard/          # Main app
│   ├── api/
│   │   ├── auth/callback/  # OAuth callback
│   │   ├── fetch-title/    # Title fetching API
│   │   └── bookmarks/[id]/ # Bookmark update API
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home (redirects)
│   └── globals.css         # Global styles
├── components/
│   ├── bookmarks/          # Bookmark components
│   ├── ui/                 # Reusable UI components
│   └── providers/          # App providers
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── utils.ts            # Utility functions
│   └── constants.ts        # Shared constants (e.g. regex)
├── types/
│   └── database.types.ts   # TypeScript types
├── docs/                   # Documentation
├── supabase-schema.sql     # Database schema
└── middleware.ts           # Auth middleware
```

## 🎯 How It Works

### Authentication Flow

1. User clicks "Continue with Google"
2. Redirected to Google OAuth
3. After authorization, redirected back to app
4. Session stored in secure cookies
5. User can now add bookmarks

### Real-Time Synchronization

1. User adds bookmark in Tab 1
2. Bookmark saved to Supabase
3. Supabase broadcasts change via WebSocket
4. All tabs (Tab 1, Tab 2, etc.) receive update
5. UI updates instantly

### Privacy & Security

- **Row-Level Security (RLS)**: Users can only access their own bookmarks
- **HTTP-only Cookies**: Session tokens protected from XSS
- **OAuth**: No passwords to manage or leak
- **Database Constraints**: Duplicate prevention at DB level

## 🔧 Development

### Available Scripts

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

### Environment Variables

| Variable                   | Description          | Example                   |
|----------------------------|----------------------|---------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...`              |

## 📖 Usage Guide

### Adding a Bookmark

1. Enter a URL in the form
2. Title is auto-fetched (you can edit it)
3. Click "Add Bookmark"
4. Bookmark appears instantly in your list

### Searching Bookmarks

1. Type in the search box
2. Results filter in real-time
3. Search matches both titles and URLs

### Deleting a Bookmark

1. Hover over a bookmark card
2. Click the delete button (trash icon)
3. Confirm deletion
4. Bookmark removed instantly

### Editing a Bookmark

1. Hover over a bookmark card
2. Click the edit button (pencil icon)
3. Update the URL and/or title in the modal
4. Click "Save changes"
5. The card updates instantly and syncs in real-time

## 🧠 Problems I Solved

### 1. Keeping bookmarks in sync in real time

- **The problem**: I wanted every open tab to stay in sync without manual refresh. If I added, edited, or deleted a bookmark in one tab, the others should update automatically. Doing this with just `fetch` and local state would get messy and easy to break.
- **What I tried first**: I started with a simple `fetch` on page load inside `BookmarkList` and manually updated the array when I added or deleted a bookmark. This worked in a single tab, but other tabs never saw the change.
- **Final approach**:
  - I used **Supabase Realtime** subscriptions in `BookmarkList` to listen to `INSERT`, `UPDATE`, and `DELETE` events on the `bookmarks` table.
  - On each event, I update the local `bookmarks` state:
    - `INSERT`: prepend the new bookmark to the list.
    - `UPDATE`: map over the list and replace the matching `id`.
    - `DELETE`: filter out the deleted `id`.
  - I still run an initial `SELECT` on mount, but after that the UI stays up to date from the realtime channel.
- **Why this is better**: All tabs stay in sync, the code is simple to reason about, and I do not need to refetch the whole list after every action. Supabase’s RLS also guarantees that even with realtime, each user only sees their own data.

### 2. Adding a safe edit flow without breaking data rules

- **The problem**: I needed an “Edit bookmark” feature that lets users change URL and title, but I had to respect:
  - The **unique constraint** on `(user_id, url)` (no duplicate URLs per user).
  - **Row-Level Security** so a user cannot edit someone else’s bookmark.
  - The existing realtime behavior and type safety.
- **What I tried first**: My first thought was to call Supabase directly from the client (like add/delete) with `.update()` and let RLS handle the rest. This worked, but it spread logic across the client and made the rules harder to see and test.
- **Final approach**:
  - I created a dedicated API route at `app/api/bookmarks/[id]/route.ts` that:
    - Validates `title` and `url` and checks URL format.
    - Uses the **server Supabase client** to get the current user from cookies.
    - Runs an `UPDATE` on `bookmarks` with a `user_id` check and sets `updated_at`.
    - Handles Postgres error code `23505` to show a friendly “already bookmarked” message.
  - On the frontend, the edit modal in `BookmarkCard` calls this route and then updates local state (and Realtime also sends the update).
- **Why this is better**: All edit rules live in one place (the API route), the UI stays simple, and the database remains the single source of truth. This also made it easier to explain and debug the behavior during development.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Support

If you encounter any issues:

- Check the [Documentation](./docs/)
- Open an [Issue](https://github.com/your-username/smart-bookmark/issues)
- Read [Troubleshooting Guide](./docs/02-environment-setup.md#troubleshooting)

## 🎉 Live Demo

Visit the live demo: [https://abhay-smart-bookmark.vercel.app](https://abhay-smart-bookmark.vercel.app)

---

Built with ❤️ using Next.js, Supabase, and Tailwind CSS.
