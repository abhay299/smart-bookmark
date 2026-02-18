'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { isValidUrl } from '@/lib/utils'
import type { Bookmark } from '@/types/database.types'
import { Link2, Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface AddBookmarkFormProps {
  onBookmarkAdded: (bookmark: Bookmark) => void
}

export function AddBookmarkForm({ onBookmarkAdded }: AddBookmarkFormProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [isLoadingTitle, setIsLoadingTitle] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [urlError, setUrlError] = useState('')
  const supabase = createClient()

  const fetchTitle = async (urlToFetch: string) => {
    setIsLoadingTitle(true)
    setUrlError('')

    if (!isValidUrl(urlToFetch)) {
      setUrlError('Please enter a valid URL (must start with http:// or https://)')
      setIsLoadingTitle(false)
      return
    }

    try {
      const response = await fetch(`/api/fetch-title?url=${encodeURIComponent(urlToFetch)}`)
      const data = await response.json()

      if (response.ok && data.title) {
        setTitle(data.title)
      } else {
        setTitle(new URL(urlToFetch).hostname)
      }
    } catch (error) {
        console.error('Error fetching title:', error)
        toast.error('Error fetching title. Please enter a title manually.')
    } finally {
      setIsLoadingTitle(false)
    }
  }

  const handleUrlBlur = () => {
    if (url && !title) {
      fetchTitle(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url || !title) {
      toast.error('Please fill in all fields')
      return
    }

    if (!isValidUrl(url)) {
      setUrlError('Please enter a valid URL')
      return
    }

    setIsSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to add bookmarks')
        return
      }

      // Check for duplicates first
      const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('url', url)
        .single()

      if (existing) {
        toast.error('This URL is already bookmarked')
        setIsSaving(false)
        return
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          url,
          title,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('This URL is already bookmarked')
        } else {
          throw error
        }
        return
      }

      toast.success('Bookmark added successfully!')
      setUrl('')
      setTitle('')
      onBookmarkAdded(data)
    } catch (error) {
      console.error('Error adding bookmark:', error)
      toast.error('Failed to add bookmark. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-xl">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-400" />
        Add New Bookmark
      </h2>
      
      <div className="space-y-4">
        <div className="relative">
          <Input
            type="url"
            label="URL"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleUrlBlur}
            error={urlError}
            icon={<Link2 className="w-4 h-4" />}
            required
          />
        </div>

        <div className="relative">
          <Input
            type="text"
            label="Title"
            placeholder="Page title (auto-fetched)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            icon={
              isLoadingTitle ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )
            }
            required
          />
          {isLoadingTitle && (
            <p className="text-xs text-blue-400 mt-1">Fetching title...</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSaving || isLoadingTitle || !url || !title}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Add Bookmark'
          )}
        </Button>
      </div>
    </form>
  )
}
