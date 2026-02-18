'use client'

import { AddBookmarkForm } from '@/components/bookmarks/AddBookmarkForm'
import { BookmarkList } from '@/components/bookmarks/BookmarkList'
import { SearchBar } from '@/components/bookmarks/SearchBar'
import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Bookmark, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCount, setFilteredCount] = useState(0)
  const [activeSection, setActiveSection] = useState<'add' | 'bookmarks'>('bookmarks')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let cancelled = false

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
    })

    return () => {
      cancelled = true
    }
  }, [router, supabase])

  const handleBookmarkAdded = () => {
    // Switch to bookmarks view after adding
    setActiveSection('bookmarks')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">

      <Sidebar
        user={user}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="flex-1 ml-64 h-screen overflow-hidden">
        {activeSection === 'add' && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Save New Bookmark
                </h1>
                <p className="text-gray-400">
                  Add a URL and we will fetch the title automatically
                </p>
              </div>
              <AddBookmarkForm onBookmarkAdded={handleBookmarkAdded} />
            </div>
          </div>
        )}

        {activeSection === 'bookmarks' && (
          <div className="h-full flex flex-col p-8">
            
            <div className="shrink-0 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Bookmark className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Your Bookmarks
                    </h1>
                    <p className="text-sm text-gray-400">
                      All your saved links in one place
                    </p>
                  </div>
                </div>
              </div>

              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                count={filteredCount}
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <BookmarkList
                searchQuery={searchQuery}
                onCountChange={setFilteredCount}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
