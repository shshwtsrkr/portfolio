import AdminNav from '@/components/AdminNav'
import { isSupabaseConfigured } from '@/lib/dev-data'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const devMode = !isSupabaseConfigured()

  return (
    <div className="a-shell">
      <AdminNav devMode={devMode} />
      <main className="a-main">
        <div className="a-content">
          {devMode && <p className="a-dev-banner">Dev mode: Supabase isn&apos;t configured, so sign-in is skipped and nothing saves.</p>}
          {children}
        </div>
      </main>
    </div>
  )
}
