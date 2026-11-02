import MaterialRuntime from '@/components/Material'
import './admin.css'

// Shared by /admin and /login: Material 3 styles plus the ripple + snackbar runtime.
export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="a-root">
      {children}
      <MaterialRuntime />
    </div>
  )
}
