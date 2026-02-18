'use client'

import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { Bookmark, LogOut, Plus, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface SidebarProps {
  user: any
  activeSection: 'add' | 'bookmarks'
  onSectionChange: (section: 'add' | 'bookmarks') => void
}

export function Sidebar({ user, activeSection, onSectionChange }: SidebarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  const menuItems = [
    {
      id: 'add' as const,
      label: 'Add Bookmark',
      icon: Plus,
      description: 'Save a new link',
    },
    {
      id: 'bookmarks' as const,
      label: 'Your Bookmarks',
      icon: Bookmark,
      description: 'View all saved',
    },
  ]

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col fixed left-0 top-0">

      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <img
              src="/bookmark-logo.svg"
              alt="Smart Bookmark"
              className="w-6 h-6"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Smart Bookmark</h1>
            <p className="text-xs text-gray-400">Organize your links</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? 'bg-blue-500/10 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
                }
              `}
            >
              <Icon
                className={`w-5 h-5 mt-0.5 ${
                  isActive ? 'text-blue-400' : 'text-gray-400'
                }`}
              />
              <div className="flex-1 text-left">
                <p
                  className={`text-sm font-medium ${
                    isActive ? 'text-blue-400' : 'text-gray-200'
                  }`}
                >
                  {item.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.description}
                </p>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
