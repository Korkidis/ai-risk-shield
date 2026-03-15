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
  title: 'AI Content Risk Score — Check AI Images for Copyright Risk in 15s',
  description: 'Validate AI-generated images for copyright risk, brand safety, and C2PA provenance. Get an instant risk score and downloadable evidence for legal review.',
  openGraph: {
    title: 'AI Content Risk Score — Know Before You Publish',
    description: 'Validate AI-generated images for copyright risk, brand safety, and provenance verification in 15 seconds.',
    type: 'website',
    siteName: 'AI Content Risk Score',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Content Risk Score — Know Before You Publish',
    description: 'Check AI images for copyright risk in 15 seconds. Free tier available.',
  },
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AI Content Risk Score",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": "AI content risk validation — IP risk scoring, C2PA provenance verification, and forensic reporting in 15 seconds.",
          "offers": [
            { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free tier — 3 scans/month" },
            { "@type": "Offer", "price": "29", "priceCurrency": "USD", "description": "One-time full forensic report" },
            { "@type": "Offer", "price": "49", "priceCurrency": "USD", "description": "Pro monthly subscription" }
          ]
        }) }} />
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
