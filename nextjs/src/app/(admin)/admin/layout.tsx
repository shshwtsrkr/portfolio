import AdminNav from '@/components/AdminNav'
import { isSupabaseConfigured } from '@/lib/dev-data'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const devMode = !isSupabaseConfigured()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {devMode && (
        <div className="bg-amber-500 text-black text-xs font-bold text-center py-1 tracking-widest uppercase">
          ⚠ Dev bypass active — auth disabled — revert before deploying
        </div>
      )}
      <AdminNav userEmail={devMode ? 'dev@local' : 'you'} devMode={devMode} />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
