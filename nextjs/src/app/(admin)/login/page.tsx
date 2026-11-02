'use client'

import { FaGithub } from 'react-icons/fa'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const signInWithGitHub = async () => {
    await createClient().auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  return (
    <main className="a-login">
      <div className="a-login-card">
        <span className="a-rail-brand" aria-hidden="true">SS</span>
        <h1>Sign in</h1>
        <p>Use your GitHub account to manage the portfolio.</p>
        <button type="button" onClick={signInWithGitHub} className="a-btn filled ripple">
          <FaGithub size={20} aria-hidden="true" />
          Continue with GitHub
        </button>
      </div>
    </main>
  )
}
