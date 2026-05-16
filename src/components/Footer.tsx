import Link from 'next/link'
import coachConfig from '../../coach.config'

const NAV_LINKS = [
  { href: '/build',   label: '建造課程' },
  { href: '/sell',    label: '銷售課程' },
  { href: '/pricing', label: '定價' },
  { href: '/blog',    label: '文章' },
]

const QUOTE = '"我負責夢想，AI 負責工作。"'
const QUOTE_ATTR = '— I DREAM. AI WORKS.'

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-black">
      <div className="px-8 md:px-16 py-8 flex items-end justify-between gap-8 relative overflow-hidden">

        {/* Left — horizontal nav links */}
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-bold text-[13px] text-black underline underline-offset-4 hover:text-[#CC1F1F] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Centre — rotated red quote */}
        <div
          className="hidden md:block absolute left-1/2 bottom-6 -translate-x-1/2 text-right select-none pointer-events-none"
          style={{ transform: 'translateX(-50%) rotate(-8deg)', transformOrigin: 'right bottom' }}
        >
          <p
            className="font-black italic leading-tight"
            style={{ color: '#CC1F1F', fontSize: 'clamp(0.75rem, 1.1vw, 1rem)' }}
          >
            {QUOTE}
          </p>
          <p className="font-mono text-[9px] uppercase text-[#CC1F1F]/60 mt-0.5">
            {QUOTE_ATTR}
          </p>
        </div>

        {/* Right — copyright */}
        <span className="font-mono text-[10px] uppercase text-[#aaa] whitespace-nowrap shrink-0">
          ©{new Date().getFullYear()} {coachConfig.brand.name}
        </span>

      </div>
    </footer>
  )
}
