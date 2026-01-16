import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  // Ensure no variable/display issues block rendering
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Risk Shield',
  description: 'Forensic AI Audit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.className} antialiased bg-[#020617] text-white`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
