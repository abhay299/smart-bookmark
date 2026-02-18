# Real-Time Sync Documentation

## Overview

Real-time synchronization allows changes made in one browser tab to instantly appear in all other open tabs of the same user. This is powered by **Supabase Realtime**, which uses WebSockets to broadcast database changes.

## How It Works

### Architecture

```
Browser Tab 1            Supabase Cloud           Browser Tab 2
     │                         │                        │
     │  1. Insert bookmark     │                        │
     ├────────────────────────>│                        │
     │                         │                        │
     │  2. Broadcast INSERT    │                        │
     │                         ├───────────────────────>│
     │                         │                        │
     │  3. Update UI           │  4. Update UI          │
     │  (via subscription)     │  (via subscription)    │
     │                         │                        │
```

### Technology Stack

- **WebSockets** - Persistent bidirectional connection
- **PostgreSQL LISTEN/NOTIFY** - Database-level pub/sub
- **Supabase Realtime** - Bridge between database and clients
- **React State** - Local state updates on events

## Implementation

### Step 1: Enable Realtime on Table

In the database:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

This tells PostgreSQL to publish changes to the `bookmarks` table.

**Also required**: Enable in Supabase Dashboard → Database → Replication → Toggle "Realtime" for `bookmarks` table

### Step 2: Subscribe to Changes

In `BookmarkList.tsx`:

```typescript
useEffect(() => {
  // Fetch initial bookmarks
  fetchBookmarks()
  
  // Set up real-time subscription
  const channel = supabase
    .channel('bookmarks-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bookmarks',
      },
      (payload) => {
        const newBookmark = payload.new as Bookmark
        setBookmarks((current) => [newBookmark, ...current])
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'bookmarks',
      },
      (payload) => {
        const deletedId = payload.old.id
        setBookmarks((current) => current.filter((b) => b.id !== deletedId))
      }
    )
    .subscribe()

  // Cleanup on unmount
  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### Step 3: Handle Events

#### INSERT Event

When a bookmark is created:

```typescript
.on('postgres_changes', { event: 'INSERT', ... }, (payload) => {
  const newBookmark = payload.new as Bookmark
  setBookmarks((current) => [newBookmark, ...current])
})
```

**Payload Structure**:
```json
{
  "schema": "public",
  "table": "bookmarks",
  "commit_timestamp": "2024-02-17T18:30:00Z",
  "eventType": "INSERT",
  "new": {
    "id": "123e4567-...",
    "user_id": "987fcdeb-...",
    "url": "https://example.com",
    "title": "Example Site",
    "created_at": "2024-02-17T18:30:00Z",
    "updated_at": "2024-02-17T18:30:00Z"
  },
  "old": {}
}
```

**Action**: Prepend new bookmark to the list (`[newBookmark, ...current]`)

#### DELETE Event

When a bookmark is removed:

```typescript
.on('postgres_changes', { event: 'DELETE', ... }, (payload) => {
  const deletedId = payload.old.id
  setBookmarks((current) => current.filter((b) => b.id !== deletedId))
})
```

**Payload Structure**:
```json
{
  "schema": "public",
  "table": "bookmarks",
  "commit_timestamp": "2024-02-17T18:31:00Z",
  "eventType": "DELETE",
  "new": {},
  "old": {
    "id": "123e4567-...",
    "user_id": "987fcdeb-...",
    "url": "https://example.com",
    "title": "Example Site",
    "created_at": "2024-02-17T18:30:00Z",
    "updated_at": "2024-02-17T18:30:00Z"
  }
}
```

**Action**: Remove from list by filtering out the deleted ID

## Row-Level Security with Realtime

### The Challenge

By default, Realtime broadcasts ALL changes to ALL connected clients. But we only want users to see their own bookmarks.

### The Solution

Supabase Realtime **respects Row-Level Security (RLS) policies**. When a change occurs:

1. Database publishes the event
2. Supabase checks RLS policies for each subscriber
3. Only authorized clients receive the event

**Example**:
- User A adds a bookmark
- Event is broadcast to all subscribers
- User A receives the event (passes RLS: `auth.uid() = user_id`)
- User B does NOT receive the event (fails RLS: different user)

**Configuration**: No additional setup needed beyond RLS policies

## Connection Lifecycle

### Establishing Connection

When `BookmarkList` mounts:

```
Component renders
     ↓
Create channel ('bookmarks-changes')
     ↓
Register event listeners
     ↓
Call .subscribe()
     ↓
WebSocket connection established
     ↓
Listening for events...
```

### Cleanup

When component unmounts (user navigates away):

```typescript
return () => {
  supabase.removeChannel(channel)
}
```

This:
- Closes WebSocket connection
- Removes event listeners
- Prevents memory leaks

## Channel Naming

```typescript
const channel = supabase.channel('bookmarks-changes')
```

**Name**: `'bookmarks-changes'` is arbitrary but descriptive

**Scope**: Per-client connection (each tab has its own channel instance)

**Reuse**: Calling `channel('same-name')` multiple times creates separate channels

## Event Filtering

### Server-Side Filtering

Events are filtered by:
- **schema**: `'public'` (database schema)
- **table**: `'bookmarks'` (specific table)
- **event**: `'INSERT'`, `'DELETE'`, or `'UPDATE'`

```typescript
.on('postgres_changes', {
  event: 'INSERT',      // Only INSERT events
  schema: 'public',
  table: 'bookmarks',
}, handler)
```

### Client-Side Filtering (Not Used)

We could further filter on the client:

```typescript
.on('postgres_changes', { ... }, (payload) => {
  // Only handle if URL contains "github"
  if (payload.new.url.includes('github')) {
    // handle
  }
})
```

But we don't because RLS already ensures we only receive our own bookmarks.

## Cross-Tab Synchronization

### Scenario: User Opens Two Tabs

**Tab 1**: Dashboard open, viewing bookmarks

**Tab 2**: Dashboard open, viewing same bookmarks

**Action**: User adds bookmark in Tab 1

**Result**:
1. Tab 1 submits INSERT to database
2. Database confirms INSERT
3. Database publishes event to Realtime
4. Realtime broadcasts to all subscribed clients
5. **Tab 1** receives event → updates UI
6. **Tab 2** receives event → updates UI

**Timing**: Usually <100ms latency

### Same User, Different Devices

Works across:
- Multiple browser tabs
- Different browsers (Chrome + Firefox)
- Different computers
- Mobile + desktop

As long as they're logged in as the same user.

## Presence Features (Not Used)

Supabase Realtime also supports **Presence** to track who's online. We don't use it, but here's how it could work:

```typescript
const channel = supabase.channel('online-users')

// Track this user
channel.track({ user_id: user.id, online_at: new Date() })

// Listen for others
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  console.log('Online users:', state)
})
```

**Use Case**: Show "3 other users viewing this page"

## Error Handling

### Connection Failures

If WebSocket connection fails:

```typescript
channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    console.log('Connected to real-time updates')
  }
  if (status === 'CHANNEL_ERROR') {
    console.error('Real-time connection error')
    toast.error('Real-time updates disconnected')
  }
})
```

**Automatic Reconnection**: Supabase client automatically retries

### Event Processing Errors

If handling an event throws an error:

```typescript
.on('postgres_changes', { ... }, (payload) => {
  try {
    const newBookmark = payload.new as Bookmark
    setBookmarks((current) => [newBookmark, ...current])
  } catch (error) {
    console.error('Error processing real-time event:', error)
  }
})
```

**Impact**: Individual event fails, but subscription continues

## Performance Considerations

### Bandwidth

Each event is ~500 bytes. For 100 events/hour:
- Total bandwidth: ~50 KB/hour
- Negligible for modern connections

### Battery (Mobile)

WebSocket keeps connection alive, which uses battery. For mobile apps, consider:
- Closing subscription when app is backgrounded
- Only subscribe when user is actively viewing

### Scaling

Supabase Realtime can handle:
- **Free tier**: ~200 concurrent connections
- **Pro tier**: ~500 concurrent connections
- **Enterprise**: Custom limits

For Smart Bookmark with private data:
- Each user has 1-5 tabs open
- 1000 users = ~1000-5000 connections
- Well within limits for Pro tier

## Alternatives to Realtime

If Realtime isn't available, alternatives:

### 1. Polling

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchBookmarks()
  }, 5000) // Every 5 seconds
  
  return () => clearInterval(interval)
}, [])
```

**Pros**: Simple, works everywhere

**Cons**: Higher latency, more database queries, higher costs

### 2. Server-Sent Events (SSE)

One-way streaming from server to client.

**Pros**: Simpler than WebSockets

**Cons**: One-way only (Realtime is bidirectional)

### 3. No Sync

Users must manually refresh to see updates.

**Pros**: No infrastructure needed

**Cons**: Poor UX

## Testing Real-Time

### Manual Test

1. Open dashboard in two browser tabs
2. In Tab 1, add a bookmark
3. Verify it appears in Tab 2 within 1 second
4. In Tab 2, delete that bookmark
5. Verify it disappears in Tab 1

### Automated Test (Future)

```typescript
describe('Real-time sync', () => {
  it('syncs bookmark creation across clients', async () => {
    const client1 = createClient()
    const client2 = createClient()
    
    // Set up listener on client2
    const promise = new Promise(resolve => {
      client2.channel('test').on('INSERT', resolve).subscribe()
    })
    
    // Insert on client1
    await client1.from('bookmarks').insert({ ... })
    
    // Wait for client2 to receive event
    await expect(promise).resolves.toBeTruthy()
  })
})
```

## Debugging

### Check Connection Status

In browser console:

```javascript
const channel = supabase.channel('bookmarks-changes')
  .subscribe((status) => {
    console.log('Status:', status)
    // "SUBSCRIBED" = connected
    // "CHANNEL_ERROR" = error
    // "TIMED_OUT" = timeout
    // "CLOSED" = disconnected
  })
```

### View WebSocket Traffic

Chrome DevTools → Network → WS tab

Shows:
- Connection requests
- Ping/pong heartbeats
- Event payloads

### Enable Realtime Logs

In Supabase Dashboard → Settings → API → Realtime → Enable Logs

Shows server-side event processing.

## Related Files

- `components/bookmarks/BookmarkList.tsx` - Real-time subscription setup
- `docs/04-database-schema.md` - RLS policies that filter events
- Supabase Dashboard → Database → Replication - Enable Realtime

## Further Reading

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [PostgreSQL LISTEN/NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html)
