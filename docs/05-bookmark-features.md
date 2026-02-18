# Bookmark Features Documentation

This document explains how the core bookmark features work under the hood.

## Feature 1: Add Bookmark with Auto-Fetch Title

### Overview
Users can add bookmarks by entering a URL. The page title is automatically fetched and can be edited before saving.

### Component: `AddBookmarkForm.tsx`

### Flow

```
User enters URL
     ↓
On blur (leave input)
     ↓
Validate URL format
     ↓
Call /api/fetch-title
     ↓
Display fetched title (editable)
     ↓
User clicks "Add Bookmark"
     ↓
Check for duplicates
     ↓
Insert into database
     ↓
Show success toast
     ↓
Clear form
```

### URL Validation

```typescript
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}
```

**Rules**:
- Must be a valid URL format
- Must start with `http://` or `https://`
- Example valid: `https://example.com`, `http://localhost:3000`
- Example invalid: `example.com` (missing protocol), `ftp://files.com` (wrong protocol)

### Title Auto-Fetch

#### API Route: `/api/fetch-title/route.ts`

The server-side API fetches the URL and extracts the title:

```typescript
const response = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0...' },
  signal: AbortSignal.timeout(5000), // 5 sec timeout
})

const html = await response.text()
const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname
```

**Process**:
1. Fetch the URL with a 5-second timeout
2. Extract HTML content
3. Use regex to find `<title>` tag
4. If found, return the title text
5. If not found or error, fallback to domain name

**Why server-side?**
- Avoids CORS (Cross-Origin Resource Sharing) issues
- Can fetch from any website without browser restrictions
- Keeps the heavy lifting off the client

**Fallback Strategy**:
- Primary: Extract from `<title>` tag
- Fallback 1: Use domain name (e.g., `example.com`)
- Fallback 2: Return error if URL is invalid

### Duplicate Prevention

#### Client-Side Check

Before inserting, we query for existing bookmarks:

```typescript
const { data: existing } = await supabase
  .from('bookmarks')
  .select('id')
  .eq('user_id', user.id)
  .eq('url', url)
  .single()

if (existing) {
  toast.error('This URL is already bookmarked')
  return
}
```

#### Database Constraint

The database also enforces uniqueness:

```sql
CONSTRAINT unique_user_url UNIQUE(user_id, url)
```

If a duplicate INSERT is attempted, the database returns error code `23505`:

```typescript
if (error.code === '23505') {
  toast.error('This URL is already bookmarked')
}
```

**Why both?**
- Client-side: Better UX (instant feedback)
- Database-side: Security (enforces rule even if client check fails)

### Form States

| State | Description | UI |
|-------|-------------|-----|
| **Empty** | Initial state | Both inputs empty, button disabled |
| **Fetching Title** | Auto-fetch in progress | Loading spinner in title input, button disabled |
| **Ready** | URL and title populated | Button enabled |
| **Saving** | Submitting to database | Loading spinner in button, inputs disabled |
| **Error** | Validation or save error | Error message below input, button enabled |
| **Success** | Saved successfully | Toast notification, form cleared |

## Feature 2: Delete Bookmark

### Component: `BookmarkCard.tsx`

### Flow

```
User clicks delete button
     ↓
Show confirmation dialog
     ↓
User confirms
     ↓
Delete from database
     ↓
Show success toast
     ↓
Real-time removes from UI
```

### Implementation

```typescript
const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this bookmark?')) {
    return
  }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmark.id)

  if (error) throw error

  toast.success('Bookmark deleted')
}
```

**Security**: RLS policy ensures users can only delete their own bookmarks

**Confirmation**: Native `confirm()` dialog prevents accidental deletion

### UI States

| State | Description | UI |
|-------|-------------|-----|
| **Normal** | Default state | Delete button hidden (shows on hover) |
| **Hover** | Mouse over card | Delete button visible with opacity transition |
| **Deleting** | Delete in progress | Loading spinner, button disabled |
| **Deleted** | Successfully deleted | Card removed instantly (via real-time) |

## Feature 3: Search & Filter

### Component: `SearchBar.tsx` and `BookmarkList.tsx`

### How It Works

The search happens **client-side** on the already-fetched bookmarks:

```typescript
const filteredBookmarks = bookmarks.filter((bookmark) => {
  if (!searchQuery) return true
  const query = searchQuery.toLowerCase()
  return (
    bookmark.title.toLowerCase().includes(query) ||
    bookmark.url.toLowerCase().includes(query)
  )
})
```

**Search Criteria**:
- Searches both `title` and `url` fields
- Case-insensitive
- Matches partial strings
- Real-time as you type

**Examples**:
- Query: `"google"` → Matches `"Google Search"`, `"https://google.com"`
- Query: `"REACT"` → Matches `"React Documentation"`, `"learning react"`

### Why Client-Side?

For small datasets (<1000 bookmarks):
- ✅ Instant results (no network latency)
- ✅ Works offline after initial load
- ✅ Simpler implementation

For large datasets (>10,000 bookmarks), consider:
- Server-side search with pagination
- Full-text search in PostgreSQL
- Elasticsearch or similar search engine

## Feature 4: Real-Time Sync

See [06-realtime-sync.md](./06-realtime-sync.md) for detailed documentation.

## Feature 5: Bookmark Display

### Component: `BookmarkCard.tsx`

Each bookmark card shows:

1. **Favicon** - Retrieved from Google's favicon service
2. **Title** - Clickable, opens URL in new tab
3. **URL** - Displayed with external link icon
4. **Created Date** - Formatted as "Month DD, YYYY"
5. **Delete Button** - Appears on hover

### Favicon

```typescript
function getFaviconUrl(url: string): string {
  const domain = getDomainFromUrl(url)
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}
```

Google's favicon service returns a 32x32 icon for any domain. If unavailable, shows a placeholder.

### Click Behavior

```typescript
const handleOpenUrl = () => {
  window.open(bookmark.url, '_blank', 'noopener,noreferrer')
}
```

**Security**: `noopener,noreferrer` prevents:
- Opened page from accessing `window.opener`
- Referrer header from being sent

### Date Formatting

```typescript
new Date(bookmark.created_at).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
```

**Output**: "Feb 17, 2024"

## Loading States

### Skeleton Cards

While bookmarks are loading, we show 3 skeleton cards:

```typescript
if (isLoading) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
```

**Design**: Matches the height and layout of actual bookmark cards with animated pulse effect

## Empty States

### No Bookmarks

```
┌─────────────────────────┐
│                         │
│      [Bookmark Icon]    │
│   No bookmarks yet      │
│                         │
│  Start by adding your   │
│  first bookmark above   │
│                         │
└─────────────────────────┘
```

### No Search Results

```
┌─────────────────────────┐
│                         │
│      [Search Icon]      │
│  No bookmarks found     │
│                         │
│  Try adjusting your     │
│      search query       │
│                         │
└─────────────────────────┘
```

## Error Handling

### Toast Notifications

All user-facing errors show as toast notifications:

```typescript
import toast from 'react-hot-toast'

// Success
toast.success('Bookmark added successfully!')

// Error
toast.error('Failed to add bookmark. Please try again.')
```

**Position**: Top-right corner

**Duration**: 3 seconds auto-dismiss

**Styling**: Dark theme matching the app aesthetic

### Error Types

| Error | Cause | Message |
|-------|-------|---------|
| Invalid URL | URL format incorrect | "Please enter a valid URL (must start with http:// or https://)" |
| Duplicate URL | URL already saved | "This URL is already bookmarked" |
| Network Error | Supabase unreachable | "Failed to add bookmark. Please try again." |
| Auth Error | Not logged in | "You must be logged in to add bookmarks" |

## Performance Optimizations

### Debounced Title Fetch

Title fetching only happens `onBlur` (when user leaves input), not on every keystroke. This:
- Reduces API calls
- Prevents rate limiting
- Improves performance

### Optimistic UI Updates

When adding a bookmark, the form clears immediately after submission, before the database confirms. This makes the UI feel instant.

The real-time subscription will update the list once the database confirms.

### Lazy Loading

Only bookmarks are loaded initially. Other resources (favicons) are loaded on-demand as cards render.

## Related Files

- `components/bookmarks/AddBookmarkForm.tsx` - Add bookmark UI
- `components/bookmarks/BookmarkCard.tsx` - Individual bookmark display
- `components/bookmarks/BookmarkList.tsx` - List container
- `components/bookmarks/SearchBar.tsx` - Search input
- `app/api/fetch-title/route.ts` - Title fetching API
- `lib/utils.ts` - Utility functions (URL validation, favicon)
