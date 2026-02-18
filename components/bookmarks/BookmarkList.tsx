'use client'

import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { createClient } from '@/lib/supabase/client'
import type { Bookmark } from '@/types/database.types'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { BookmarkX } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { BookmarkCard } from './BookmarkCard'

interface BookmarkListProps {
  searchQuery: string
  onCountChange?: (count: number) => void
}

export function BookmarkList({ searchQuery, onCountChange }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchBookmarks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setBookmarks(data || [])
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      toast.error('Failed to load bookmarks')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchBookmarks()

    // Set up real-time subscription
    const channel: RealtimeChannel = supabase
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookmarks',
        },
        (payload) => {
          const updated = payload.new as Bookmark
          setBookmarks((current) =>
            current.map((b) => (b.id === updated.id ? updated : b))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchBookmarks, supabase])

  const handleBookmarkDeleted = (id: string) => {
    setBookmarks((current) => current.filter((b) => b.id !== id))
  }

  const handleBookmarkUpdated = (bookmark: Bookmark) => {
    setBookmarks((current) =>
      current.map((b) => (b.id === bookmark.id ? bookmark : b))
    )
  }

  // Filter bookmarks based on search query
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((bookmark) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query)
      )
    })
  }, [bookmarks, searchQuery])

  useEffect(() => {
    onCountChange?.(filteredBookmarks.length)
  }, [filteredBookmarks.length, onCountChange])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (filteredBookmarks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
          <BookmarkX className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          {searchQuery ? 'No bookmarks found' : 'No bookmarks yet'}
        </h3>
        <p className="text-gray-500">
          {searchQuery
            ? 'Try adjusting your search query'
            : 'Start by adding your first bookmark above'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredBookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onDelete={handleBookmarkDeleted}
          onUpdated={handleBookmarkUpdated}
        />
      ))}
    </div>
  )
}
