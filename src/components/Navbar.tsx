// src/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import coachConfig from '../../coach.config'
import siteConfig from '../../site.config.json'

const TICKER_TEXT =
  'AI 時代，人類要有新的活法  ✦  I Dream. AI Works.  ✦  用 AI 開創你的一人事業  ✦  新課程即將上架  ✦  '

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full bg-white">
      {/* Ticker strip */}
      <div className="w-full overflow-hidden border-b border-black py-1.5 select-none">
        <div className="ticker-track text-[10px] text-black font-mono uppercase">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="px-4">{TICKER_TEXT}</span>
          ))}
        </div>
      </div>

      {/* Row 1: Logo + desktop nav + auth buttons */}
      <div className="border-b border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-12 md:h-14">
          {/* Logo */}
          <Link
            href="/"
            className="text-base font-black uppercase text-[var(--color-accent)]"
            style={{ fontFamily: 'var(--font-display, inherit)' }}
          >
            {coachConfig.brand.name}
          </Link>

          {/* Desktop nav links (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-8">
            {siteConfig.nav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`link-sweep text-sm font-bold uppercase transition-colors duration-150 ${
                    isActive ? 'active text-black' : 'text-[#888] hover:text-black'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Auth buttons (always visible) */}
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="ed-btn ed-btn-outline-black text-[11px] px-4 py-2 md:px-5 md:py-2.5"
            >
              登入
            </Link>
            <Link
              href="/auth/register"
              className="ed-btn ed-btn-black text-[11px] px-4 py-2 md:px-5 md:py-2.5"
            >
              註冊
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: Mobile nav strip (visible on mobile only) */}
      <div className="md:hidden border-b border-black overflow-x-auto scrollbar-none">
        <div className="flex items-stretch min-w-max">
          {siteConfig.nav.map((item, idx) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-5 py-2.5 text-[10px] font-black uppercase whitespace-nowrap
                  transition-colors duration-150 flex items-center
                  ${idx < siteConfig.nav.length - 1 ? 'border-r border-black' : ''}
                  ${isActive ? 'bg-black text-white' : 'text-[#555] hover:text-black hover:bg-[#f2f2f2]'}
                `}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
