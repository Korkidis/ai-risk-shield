import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from '@/components/PostHogProvider'
import { ThemeProvider } from '@/components/ThemeProvider'


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Risk Shield',
  description: 'Forensic AI Audit',
}

// Inline script to prevent flash of wrong theme on page load
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('rs-theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch(e) {}
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased bg-[var(--rs-bg-surface)] text-[var(--rs-text-primary)] min-h-screen flex flex-col" suppressHydrationWarning>
        <PostHogProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
