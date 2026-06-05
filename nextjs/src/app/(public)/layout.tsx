import Navigation from '@/components/Navigation'
import CursorFollower from '@/components/CursorFollower'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <Navigation />
      {children}
      <CursorFollower />
    </div>
  )
}
