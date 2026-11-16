import type { Metadata, Viewport } from 'next'
import { Anton, Inter } from 'next/font/google'
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#D8D9DA',
}

export const metadata: Metadata = {
  title: 'THE DIET COKE INDEX | Fridge Cig Arbitrage',
  description:
    'Real-time retail arbitrage for the discerning aspartame enthusiast. Live pricing for the 2:15 PM silver-can ritual.',
  authors: [{ name: 'Rob Youshock', url: 'https://robertyoushock.com' }],
  icons: {
    icon: '/fridgecig/icon.svg',
  },
  openGraph: {
    title: 'THE DIET COKE INDEX (Fridge Cig)',
    description:
      'Treating a 12oz aluminum can with the same cold, ruthless financial precision as the Bloomberg Terminal.',
    url: 'https://robertyoushock.com/fridgecig',
    siteName: 'The Diet Coke Index',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'THE DIET COKE INDEX (Fridge Cig)',
    description:
      'Real-time retail arbitrage for the 2:15 PM silver-can ritual. Designed & engineered by Rob Youshock.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${anton.variable} ${inter.variable} font-body`}>
        {children}
      </body>
    </html>
  )
}
