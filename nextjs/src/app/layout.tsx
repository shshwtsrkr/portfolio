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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF9F5' },
    { media: '(prefers-color-scheme: dark)', color: '#151514' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={sans.variable}>
      <head>
        {/* Set the theme before first paint: a saved choice wins, otherwise follow the OS. */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('theme');
              if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              document.documentElement.setAttribute('data-theme', t);
            } catch(e){ document.documentElement.setAttribute('data-theme', 'light'); }
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
