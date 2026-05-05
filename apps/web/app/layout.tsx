import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Knitwise',
  description: 'Pattern library, project tracker, and yarn wishlist for makers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  )
}
