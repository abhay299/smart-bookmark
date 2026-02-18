'use client'

import { Input } from '@/components/ui/Input'
import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  count: number
}

export function SearchBar({ value, onChange, count }: SearchBarProps) {
  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Search bookmarks by title or URL..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        icon={<Search className="w-4 h-4" />}
        className="max-w-md"
      />
      {value && (
        <p className="text-sm text-gray-400">
          Found {count} bookmark{count !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
