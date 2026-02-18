# Database Schema Documentation

## Overview

Smart Bookmark uses **PostgreSQL** via Supabase for data storage. The database has a single table (`bookmarks`) with Row-Level Security (RLS) policies to ensure complete privacy.

## Table: `bookmarks`

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique bookmark identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → auth.users(id) ON DELETE CASCADE | Owner of the bookmark |
| `url` | TEXT | NOT NULL | Full URL of the bookmarked page |
| `title` | TEXT | NOT NULL | Display title for the bookmark |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp when bookmark was created |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp of last update |
| **UNIQUE** | | `(user_id, url)` | Prevents duplicate URLs per user |

### SQL Definition

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_url UNIQUE(user_id, url)
);
```

## Indexes

Indexes improve query performance for common operations:

### Index: `idx_bookmarks_user_id`
```sql
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
```
**Purpose**: Fast lookup of all bookmarks for a specific user

**Used in**: Dashboard bookmark list query

### Index: `idx_bookmarks_created_at`
```sql
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);
```
**Purpose**: Efficient ordering by creation date (newest first)

**Used in**: Default bookmark sorting

## Row-Level Security (RLS)

RLS ensures that users can only access their own bookmarks. Even if your application code has a bug, the database enforces access control.

### Enable RLS

```sql
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
```

### Policy: Users Can View Own Bookmarks

```sql
CREATE POLICY "Users can view own bookmarks" 
  ON bookmarks FOR SELECT 
  USING (auth.uid() = user_id);
```

**Purpose**: Users can only SELECT bookmarks where `user_id` matches their authenticated `auth.uid()`

**Effect**:
```sql
-- This query automatically adds WHERE auth.uid() = user_id
SELECT * FROM bookmarks;
```

### Policy: Users Can Insert Own Bookmarks

```sql
CREATE POLICY "Users can insert own bookmarks" 
  ON bookmarks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

**Purpose**: Users can only INSERT bookmarks if they set `user_id` to their own `auth.uid()`

**Effect**: Prevents users from creating bookmarks for other users

### Policy: Users Can Delete Own Bookmarks

```sql
CREATE POLICY "Users can delete own bookmarks" 
  ON bookmarks FOR DELETE 
  USING (auth.uid() = user_id);
```

**Purpose**: Users can only DELETE bookmarks they own

**Effect**:
```sql
-- Can only delete if WHERE auth.uid() = user_id is true
DELETE FROM bookmarks WHERE id = '...';
```

### Policy: Users Can Update Own Bookmarks

```sql
CREATE POLICY "Users can update own bookmarks"
  ON bookmarks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Purpose**: Users can only UPDATE bookmarks they own

**Effect**:
```sql
-- Can only update if auth.uid() = user_id is true for the row being updated
UPDATE bookmarks SET title = 'New title' WHERE id = '...';
```

## Foreign Key Relationship

### `user_id` → `auth.users(id)`

```sql
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
```

**Relationship**: Each bookmark belongs to exactly one user

**ON DELETE CASCADE**: When a user account is deleted, all their bookmarks are automatically deleted

**Benefits**:
- Data integrity (can't have orphaned bookmarks)
- Automatic cleanup when users are deleted
- Enforces that every bookmark has a valid owner

## Unique Constraint

### `UNIQUE(user_id, url)`

```sql
CONSTRAINT unique_user_url UNIQUE(user_id, url)
```

**Purpose**: Prevents a user from saving the same URL multiple times

**Behavior**:
- User A can save `https://example.com`
- User B can also save `https://example.com` (different user)
- User A cannot save `https://example.com` again (duplicate)

**Error Code**: `23505` when violated (used for client-side error handling)

## Realtime

Realtime is enabled for the `bookmarks` table to broadcast changes to all subscribed clients.

### Enable Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

**Also required**: Enable Realtime in Supabase Dashboard → Database → Replication

### Events Broadcast

- `INSERT` - When a new bookmark is created
- `UPDATE` - When a bookmark is modified
- `DELETE` - When a bookmark is removed

## Query Examples

### Get All Bookmarks for Current User

```sql
SELECT * FROM bookmarks
ORDER BY created_at DESC;
```

RLS automatically adds: `WHERE auth.uid() = user_id`

### Add a New Bookmark

```sql
INSERT INTO bookmarks (user_id, url, title)
VALUES (auth.uid(), 'https://example.com', 'Example Site')
RETURNING *;
```

RLS checks: `auth.uid() = user_id`

### Delete a Bookmark

```sql
DELETE FROM bookmarks
WHERE id = '123e4567-e89b-12d3-a456-426614174000';
```

RLS checks: `auth.uid() = user_id` for the row being deleted

### Check for Duplicate URL

```sql
SELECT id FROM bookmarks
WHERE user_id = auth.uid() AND url = 'https://example.com'
LIMIT 1;
```

Returns a row if the URL already exists for this user

## Data Types Explained

### UUID
- Universally Unique Identifier
- 128-bit value (e.g., `123e4567-e89b-12d3-a456-426614174000`)
- Generated automatically by `gen_random_uuid()`
- Better for distributed systems than auto-incrementing integers

### TEXT
- Variable-length string
- No maximum length limit (practical limit: ~1 GB)
- Used for URLs and titles

### TIMESTAMPTZ
- Timestamp with timezone
- Always stored in UTC
- Automatically converted to user's timezone on retrieval
- Format: `2024-02-17 18:30:00+00`

## Performance Considerations

### Indexed Queries (Fast)
```sql
-- Uses idx_bookmarks_user_id
SELECT * FROM bookmarks WHERE user_id = '...';

-- Uses idx_bookmarks_created_at
SELECT * FROM bookmarks ORDER BY created_at DESC;
```

### Non-Indexed Queries (Slower)
```sql
-- Full table scan - fine for small datasets
SELECT * FROM bookmarks WHERE url LIKE '%example%';
```

For large datasets (10,000+ bookmarks), consider adding:
- Full-text search index for title
- GIN index for URL pattern matching

## Backup & Restore

Supabase automatically backs up your database:
- Point-in-time recovery available (Pro plan)
- Manual backups via SQL dump

### Export Bookmarks (SQL)

```sql
COPY (SELECT * FROM bookmarks WHERE user_id = auth.uid())
TO '/path/to/bookmarks.csv' CSV HEADER;
```

## Migration

The database schema is defined in `supabase-schema.sql`. To apply it:

1. Open Supabase SQL Editor
2. Paste the contents of `supabase-schema.sql`
3. Click "Run"

To verify:
```sql
SELECT * FROM bookmarks LIMIT 1;
```

## Related Files

- `supabase-schema.sql` - Schema definition
- `types/database.types.ts` - TypeScript types
- `lib/supabase/client.ts` - Database client
