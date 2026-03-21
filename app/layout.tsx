import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from '@/components/PostHogProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { RSToastProvider } from '@/components/rs/RSToast'
import { getSiteUrl } from '@/lib/site'


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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'AI Content Risk Score',
    template: '%s | AI Content Risk Score',
  },
  description: 'AI content risk validation with IP risk scoring, C2PA provenance verification, and forensic reporting for legal and brand teams.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AI Content Risk Score',
    description: 'AI content risk validation with IP risk scoring, C2PA provenance verification, and forensic reporting for legal and brand teams.',
    url: '/',
    siteName: 'AI Content Risk Score',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Content Risk Score',
    description: 'AI content risk validation with IP risk scoring, C2PA provenance verification, and forensic reporting for legal and brand teams.',
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
            <RSToastProvider>
              {children}
            </RSToastProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
