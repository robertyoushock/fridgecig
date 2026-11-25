import type { Metadata, Viewport } from 'next'
import { Anton, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#D8D9DA',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.robertyoushock.com'),
  title: 'THE DIET COKE INDEX | Fridge Cig Arbitrage',
  description:
    'Real-time retail arbitrage for the discerning aspartame enthusiast. Live pricing for the 2:15 PM silver-can ritual.',
  authors: [{ name: 'Rob Youshock', url: 'https://www.robertyoushock.com' }],
  icons: {
    icon: [
      { url: '/fridgecig/favicon.ico', sizes: 'any' },
      { url: '/fridgecig/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/fridgecig/favicon.ico',
    apple: [
      { url: '/fridgecig/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'THE DIET COKE INDEX (Fridge Cig)',
    description:
      'Treating a 12oz aluminum can with the same cold, ruthless financial precision as the Bloomberg Terminal.',
    url: 'https://www.robertyoushock.com/fridgecig/',
    siteName: 'The Diet Coke Index',
    type: 'website',
    images: [
      {
        url: '/fridgecig/og-image.png',
        width: 1200,
        height: 630,
        alt: 'THE DIET COKE INDEX — Live retail arbitrage for the 2:15 PM silver-can ritual',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'THE DIET COKE INDEX (Fridge Cig)',
    description:
      'Real-time retail arbitrage for the 2:15 PM silver-can ritual. Designed & engineered by Rob Youshock.',
    images: ['/fridgecig/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${anton.variable} ${inter.variable} ${jetbrainsMono.variable} font-body`}>
        {children}
      </body>
    </html>
  )
}
