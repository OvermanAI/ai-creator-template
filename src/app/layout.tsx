import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, Noto_Serif_TC, Noto_Sans_TC } from 'next/font/google'
import './globals.css'
import coachConfig from '../../coach.config'

// Cormorant Garamond — 英文展示大字，奢侈品 / 藝術雜誌標準字
const cormorant = Cormorant_Garamond({
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

// DM Sans — 英文 UI 字，簡潔輕盈，Z 世代設計師系統字
const dmSans = DM_Sans({
  weight: ['200', '300', '400'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

// Noto Serif TC — 繁中標題，極細宋體，文化深度
const notoSerifTC = Noto_Serif_TC({
  weight: ['200', '300', '400'],
  subsets: ['latin'],
  variable: '--font-zh-serif',
  display: 'swap',
  preload: false,
})

// Noto Sans TC — 繁中內文，輕量無襯線
const notoSansTC = Noto_Sans_TC({
  weight: ['200', '300'],
  subsets: ['latin'],
  variable: '--font-zh-sans',
  display: 'swap',
  preload: false,
})

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || `https://${coachConfig.brand.domain}`
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: coachConfig.brand.name,
    template: `%s | ${coachConfig.brand.name}`,
  },
  description: coachConfig.brand.tagline,
  ...(googleVerification && {
    verification: { google: googleVerification },
  }),
  openGraph: {
    title: coachConfig.brand.name,
    description: coachConfig.brand.tagline,
    url: baseUrl,
    siteName: coachConfig.brand.name,
    locale: 'zh_TW',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: coachConfig.brand.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: coachConfig.brand.name,
    description: coachConfig.brand.tagline,
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-Hant"
      className={`${cormorant.variable} ${dmSans.variable} ${notoSerifTC.variable} ${notoSansTC.variable} antialiased`}
      style={{ '--color-accent': coachConfig.brand.accentColor } as React.CSSProperties}
    >
      <body>{children}</body>
    </html>
  )
}
