import type { Metadata, Viewport } from 'next'
import { Google_Sans_Flex } from 'next/font/google'
import './globals.css'

// Google Sans Flex: Material 3's typeface. ROND (roundness) is used lightly on headings, as in M3 Expressive.
const sans = Google_Sans_Flex({
  subsets: ['latin'],
  variable: '--font-sans',
  axes: ['opsz', 'ROND', 'GRAD'],
  display: 'swap',
  // Next.js has no metrics for this font, so it can't build a size-adjusted fallback; use system fonts instead.
  adjustFontFallback: false,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
})

export const metadata: Metadata = {
  title: 'Shashwat Sarkar',
  description: 'Researcher in medical imaging and computer vision — multimodal learning, domain generalization, and scene text recognition.',
}

// Browser toolbar colour: the head script below keeps it in step with the active theme.
export const viewport: Viewport = { themeColor: '#FAF9F5' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={sans.variable}>
      <head>
        {/* Set the theme before first paint: a saved choice wins, otherwise follow the device, live (see
            lib/theme.ts for the toggle side). Also keeps the browser toolbar colour matched to the theme. */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var root = document.documentElement, mq = matchMedia('(prefers-color-scheme: dark)');
            function saved(){ try { var t = localStorage.getItem('theme'); return t === 'light' || t === 'dark' ? t : null; } catch(e){ return null; } }
            function apply(){ root.setAttribute('data-theme', saved() || (mq.matches ? 'dark' : 'light')); }
            function sync(){
              var m = document.querySelector('meta[name="theme-color"]');
              if (m) m.setAttribute('content', root.getAttribute('data-theme') === 'dark' ? '#151514' : '#FAF9F5');
            }
            apply();
            mq.addEventListener('change', function(){ if (!saved()) apply(); });
            document.addEventListener('DOMContentLoaded', sync);
            new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
