import { ImageResponse } from 'next/og'

/* The favicon is the full stop from "ss." blown up: one big, bright amber disc. Nothing else in a tab strip
   is this colour, so it's findable at a glance. Shared by icon.tsx and apple-icon.tsx. */
export function brandIcon(size: number) {
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
        <div style={{ width: size * 0.92, height: size * 0.92, borderRadius: '50%', background: 'radial-gradient(circle at 35% 32%, #FFC24A 0%, #FFA318 55%, #F28C0A 100%)' }} />
      </div>
    ),
    { width: size, height: size },
  )
}
