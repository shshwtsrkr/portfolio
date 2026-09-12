import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/* iOS squares the icon and disallows transparency, so the home-screen version is the disc on a dark tile. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#15171C' }}>
        <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle at 35% 32%, #FFC24A 0%, #FFA318 55%, #F28C0A 100%)' }} />
      </div>
    ),
    { ...size },
  )
}
