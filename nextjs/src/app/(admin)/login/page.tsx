'use client'

import { createClient } from '@/lib/supabase'
import { FaGithub } from 'react-icons/fa'

export default function LoginPage() {
  const signInWithGitHub = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="card-glass max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
        <p className="text-gray-400 text-sm mb-8">Sign in with your GitHub account to access the admin dashboard.</p>
        <button
          onClick={signInWithGitHub}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors"
        >
          <FaGithub className="w-5 h-5" />
          Continue with GitHub
        </button>
      </div>
    </div>
  )
}
