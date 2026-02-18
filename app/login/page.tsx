'use client'

import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { Bolt, Chrome, Lock, Target } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Failed to login. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
 
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Smart Bookmark</h1>
          <p className="text-gray-400">
            Save and organize your favorite links
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Sign in to continue
          </h2>

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full gap-3"
            size="lg"
          >
            <Chrome className="w-5 h-5" />
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 mb-2 mx-auto">
              <Lock className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-gray-400">Private</p>
          </div>
          <div>
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 mb-2 mx-auto">
              <Bolt className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-xs text-gray-400">Real-time</p>
          </div>
          <div>
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 mb-2 mx-auto">
              <Target className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xs text-gray-400">Simple</p>
          </div>
        </div>
      </div>
    </div>
  )
}
