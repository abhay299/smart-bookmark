'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { getDomainFromUrl, getFaviconUrl, isValidUrl } from '@/lib/utils'
import type { Bookmark } from '@/types/database.types'
import { Calendar, ExternalLink, Globe, Loader2, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete: (id: string) => void
  onUpdated?: (bookmark: Bookmark) => void
}

export function BookmarkCard({ bookmark, onDelete, onUpdated }: BookmarkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editUrl, setEditUrl] = useState(bookmark.url)
  const [editTitle, setEditTitle] = useState(bookmark.title)
  const [editUrlError, setEditUrlError] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!isEditOpen) return
    setEditUrl(bookmark.url)
    setEditTitle(bookmark.title)
    setEditUrlError('')
  }, [isEditOpen, bookmark.title, bookmark.url])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bookmark?')) {
      return
    }

    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmark.id)

      if (error) throw error

      toast.success('Bookmark deleted')
      onDelete(bookmark.id)
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      toast.error('Failed to delete bookmark')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenUrl = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer')
  }

  const domain = useMemo(() => getDomainFromUrl(bookmark.url), [bookmark.url])
  const createdDate = new Date(bookmark.created_at)
  const timeAgo = getTimeAgo(createdDate)

  const handleOpenEdit = () => setIsEditOpen(true)
  const handleCloseEdit = () => {
    setIsEditOpen(false)
    setEditUrlError('')
  }

  const handleSaveEdit = async () => {
    const url = editUrl.trim()
    const title = editTitle.trim()

    if (!url || !title) {
      toast.error('Please fill in all fields')
      return
    }

    if (!isValidUrl(url)) {
      setEditUrlError('Please enter a valid URL (must start with http:// or https://)')
      return
    }

    setIsSavingEdit(true)
    setEditUrlError('')

    try {
      const res = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 409) {
          toast.error('This URL is already bookmarked')
          return
        }
        toast.error(data?.error || 'Failed to update bookmark')
        return
      }

      toast.success('Bookmark updated')
      const updated = (data as any)?.bookmark as Bookmark | undefined
      if (updated) {
        onUpdated?.(updated)
      }
      setIsEditOpen(false)
    } catch (error) {
      console.error('Error updating bookmark:', error)
      toast.error('Failed to update bookmark')
    } finally {
      setIsSavingEdit(false)
    }
  }

  return (
    <>
      <div
        className="group relative bg-linear-to-br from-gray-800/80 to-gray-800/40 border border-gray-700 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleOpenUrl}
      >

      <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

      <div className="relative flex gap-4">
        <div className="shrink-0">
          <div className="w-14 h-14 bg-linear-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden flex items-center justify-center border border-gray-600 group-hover:border-blue-500/50 transition-all duration-300 shadow-lg">
            <img
              src={getFaviconUrl(bookmark.url)}
              alt=""
              className="w-8 h-8"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = `<div class="text-gray-400"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg></div>`
                }
              }}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
            {bookmark.title}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <p className="text-sm text-gray-400 group-hover:text-blue-400 transition-colors truncate flex-1">
              {domain}
            </p>
            <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 transition-colors shrink-0" />
          </div>

          <div
            className={`text-xs text-gray-500 truncate mb-3 transition-all duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-60'
            }`}
          >
            {bookmark.url}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {createdDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">{timeAgo}</span>
            </div>

            <div
              className={`flex items-center gap-2 transition-all duration-200 ${
                isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenEdit()
                }}
                className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200 cursor-pointer"
                aria-label="Edit bookmark"
              >
                <Pencil className="w-4 h-4 text-blue-300 hover:text-blue-200" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                disabled={isDeleting}
                className={`
                  p-2 rounded-lg transition-all duration-200 cursor-pointer
                  ${
                    isDeleting
                      ? 'bg-red-500/20 cursor-not-allowed'
                      : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40'
                  }
                `}
                aria-label="Delete bookmark"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {isEditOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleCloseEdit}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg bg-linear-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Edit bookmark</h3>
                <p className="text-sm text-gray-400">
                  Update the title and/or URL for this bookmark.
                </p>
              </div>
              <button
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors cursor-pointer"
                onClick={handleCloseEdit}
                aria-label="Close edit dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                type="url"
                label="URL"
                placeholder="https://example.com"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                error={editUrlError}
                icon={<Globe className="w-4 h-4" />}
                disabled={isSavingEdit}
                required
              />
              <Input
                type="text"
                label="Title"
                placeholder="Page title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={isSavingEdit}
                required
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseEdit}
                  disabled={isSavingEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || !editUrl.trim() || !editTitle.trim()}
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}
