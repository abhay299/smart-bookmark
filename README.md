# 🔖 Smart Bookmark

A modern, privacy-focused bookmark manager with real-time synchronization across devices. Built with Next.js, Supabase, and Tailwind CSS.

![Smart Bookmark Banner](https://via.placeholder.com/1200x400/1f2937/3b82f6?text=Smart+Bookmark)

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure, passwordless login
- 🔒 **Private Bookmarks** - Your bookmarks are completely private
- ⚡ **Real-Time Sync** - Changes instantly appear across all your devices and tabs
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
   git clone <your-repo-url>
   cd smart-bookmark
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file:
   ```bash
   NEXT_SUPABASE_URL=your_supabase_url
   NEXT_ANON_KEY=your_supabase_anon_key
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

```
smart-bookmark/
├── app/
│   ├── login/              # Authentication page
│   ├── dashboard/          # Main app
│   ├── api/
│   │   ├── auth/callback/  # OAuth callback
│   │   └── fetch-title/    # Title fetching API
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home (redirects)
│   └── globals.css         # Global styles
├── components/
│   ├── bookmarks/          # Bookmark components
│   ├── ui/                 # Reusable UI components
│   └── providers/          # App providers
├── lib/
│   ├── supabase/           # Supabase clients
│   └── utils.ts            # Utility functions
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

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |

## 🚢 Deployment

Deploy to Vercel in minutes:

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy!

See [Deployment Guide](./docs/08-deployment.md) for detailed instructions.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/smart-bookmark)

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Support

If you encounter any issues:

- Check the [Documentation](./docs/)
- Open an [Issue](https://github.com/your-username/smart-bookmark/issues)
- Read [Troubleshooting Guide](./docs/02-environment-setup.md#troubleshooting)

## 🎉 Live Demo

Visit the live demo: [https://smart-bookmark.vercel.app](https://smart-bookmark.vercel.app)

---

Built with ❤️ using Next.js, Supabase, and Tailwind CSS.
