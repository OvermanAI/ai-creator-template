import Image from 'next/image'
import Link from 'next/link'

// ── 升級路徑資料 ─────────────────────────────────────────
const UPGRADE_PATH = [
  {
    level: 'L1',
    label: 'AI 初學者',
    desc: '掌握 AI 工具，做出真實作品',
    color: '#CC1F1F',
  },
  {
    level: 'L2',
    label: 'AI 創作者',
    desc: 'Build + Sell 雙技能，開始變現',
    color: '#FFB11B',
  },
  {
    level: 'L3',
    label: 'Level 3 全面升級',
    desc: '系統化，讓作品自動為你賺錢',
    color: '#00b388',
  },
]

const PAIN_POINTS = [
  '做了很多 AI 作品，卻不知道怎麼開始賺錢',
  '看了很多教學，還是沒有走到第一筆成交',
  '覺得自己還沒準備好，一直在等「對的時機」',
  '不知道要賣什麼、賣給誰、用什麼系統',
]

const FAQ = [
  {
    q: '我的作品還不夠好，可以學嗎？',
    a: '每個人都是從零開始的。這堂課教的是系統，不是要求你先有完美作品。',
  },
  {
    q: '要有多少粉絲才能開始變現？',
    a: '不需要大量粉絲。課程教你如何從小受眾開始精準成交，100 個精準粉絲比 10000 個路人更有價值。',
  },
  {
    q: '這和 L1 免費課有什麼不同？',
    a: 'L1 教你做出作品，L2 教你把作品變成收入系統。兩者是升級關係，不是重複。',
  },
  {
    q: '購買後可以使用多久？',
    a: '終身使用，包含未來更新。AI 工具快速進化，課程內容會跟著更新。',
  },
]

type LessonLPProps = {
  title: string
  summary: string
  missionLabel: string
  outcome: string
  upgradeLevel: string
  category: string
  price: number
  tools: string[]
  coverImage?: string
  curriculum?: string[]
  isLoggedIn?: boolean
}

// ── 預設課綱（待 Payload CMS 接管前的佔位） ───────────────
const DEFAULT_CURRICULUM = [
  '第 1 週 — 找到你的第一個可賣商品',
  '第 2 週 — 定價邏輯與市場定位',
  '第 3 週 — 上架流程全實戰（含範本）',
  '第 4 週 — 銷售頁設計 × 自動化推廣',
]

const LEVEL_BADGE_COLOR: Record<string, string> = {
  '2': '#FFB11B',
  '3': '#00b388',
}

export function LessonLP({
  title,
  summary,
  missionLabel,
  outcome,
  upgradeLevel,
  category,
  price,
  tools,
  coverImage,
  curriculum = DEFAULT_CURRICULUM,
  isLoggedIn = false,
}: LessonLPProps) {
  const accentColor = LEVEL_BADGE_COLOR[upgradeLevel] ?? '#FFB11B'
  const categoryPath = category === 'build' ? '/build' : '/sell'
  const categoryLabel = category === 'build' ? 'BUILD' : 'SELL'
  const currentLevelIdx = upgradeLevel === '3' ? 2 : 1

  return (
    <div className="bg-[#080808] text-white min-h-screen">

      {/* ══ 1. HERO ══════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '90vh' }}>
        {/* Background image */}
        {coverImage ? (
          <div className="absolute inset-0">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,8,8,0.35) 0%, rgba(8,8,8,0.75) 60%, rgba(8,8,8,1) 100%)' }} />
          </div>
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${accentColor}22 0%, #080808 70%)` }} />
        )}

        {/* Hero content */}
        <div className="relative z-10 flex flex-col justify-end min-h-[90vh] px-8 md:px-16 pb-16 md:pb-24">

          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href={categoryPath}
              className="font-mono text-[10px] uppercase text-white/40 hover:text-white/80 transition-colors"
            >
              ← {categoryLabel} 課程列表
            </Link>
          </div>

          {/* Eyebrow */}
          <p className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: accentColor }}>
            {missionLabel || `LEVEL ${upgradeLevel} — 升級課程`}
          </p>

          {/* Main headline */}
          <h1
            className="font-black text-white leading-[0.92] mb-6 max-w-4xl"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}
          >
            {title}
          </h1>

          {/* Subheadline */}
          <p className="text-[18px] text-white/65 leading-relaxed max-w-2xl mb-10">
            {summary}
          </p>

          {/* Dual CTA */}
          <div className="flex flex-wrap gap-4 items-center">
            <a
              href="#pricing"
              className="ed-btn ed-btn-accent px-10 py-4 text-[13px]"
            >
              立即升級 →
            </a>
            <a
              href="#curriculum"
              className="ed-btn ed-btn-outline px-10 py-4 text-[13px]"
            >
              先看課程內容 ↓
            </a>
          </div>

          {/* Tool tags */}
          {tools.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="font-mono text-[9px] uppercase px-3 py-1 border border-white/20 text-white/50"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ 2. 升級路徑 ══════════════════════════════════════ */}
      <section className="border-t border-white/10 px-8 md:px-16 py-16">
        <p className="font-mono text-[10px] uppercase text-white/30 mb-10 tracking-widest">
          // 你在哪，你要去哪
        </p>
        <div className="grid grid-cols-3 gap-px bg-white/10">
          {UPGRADE_PATH.map((step, i) => {
            const isCurrent = i === currentLevelIdx
            const isPast = i < currentLevelIdx
            return (
              <div
                key={step.level}
                className="relative bg-[#080808] px-6 py-8"
                style={{ opacity: isPast ? 0.4 : 1 }}
              >
                {isCurrent && (
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: accentColor }}
                  />
                )}
                <p
                  className="font-mono text-[10px] uppercase mb-3"
                  style={{ color: isCurrent ? accentColor : 'rgba(255,255,255,0.3)' }}
                >
                  {step.level} {isCurrent && '← 你在這'}
                </p>
                <p className="font-black text-white text-lg mb-2">{step.label}</p>
                <p className="text-[13px] text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ══ 3. 痛點 ═══════════════════════════════════════════ */}
      <section className="border-t border-white/10 px-8 md:px-16 py-16">
        <h2
          className="font-black text-white leading-tight mb-12 max-w-2xl"
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
        >
          你是不是也有這些困擾：
        </h2>
        <div className="grid md:grid-cols-2 gap-px bg-white/10">
          {PAIN_POINTS.map((point, i) => (
            <div key={i} className="bg-[#080808] px-8 py-6 flex items-start gap-4">
              <span className="font-black text-[#CC1F1F] text-lg leading-none mt-0.5 shrink-0">✗</span>
              <p className="text-[15px] text-white/70 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
        {/* Bridge */}
        <div className="mt-12 border-l-2 pl-8 py-2" style={{ borderColor: accentColor }}>
          <p
            className="font-black text-white leading-tight"
            style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)' }}
          >
            {outcome || '這堂課就是為了讓你跨越這道門檻而設計的。'}
          </p>
        </div>
      </section>

      {/* ══ 4. 課程大綱 ═══════════════════════════════════════ */}
      <section id="curriculum" className="border-t border-white/10 px-8 md:px-16 py-16">
        <p className="font-mono text-[10px] uppercase text-white/30 mb-6 tracking-widest">
          // 課程大綱
        </p>
        <h2
          className="font-black text-white leading-tight mb-12"
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
        >
          你會學到什麼
        </h2>
        <div className="space-y-px">
          {curriculum.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-6 bg-[#111] px-8 py-5 border-l-2"
              style={{ borderColor: accentColor }}
            >
              <span
                className="font-mono text-[11px] shrink-0 mt-0.5"
                style={{ color: accentColor }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-[15px] text-white/80 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 5. 主理人 ═══════════════════════════════════════ */}
      <section className="border-t border-white/10">
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative overflow-hidden" style={{ minHeight: '480px' }}>
            <Image
              src="/images/pixel.png"
              alt="課程主理人"
              fill
              className="object-cover object-top"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, #080808 100%)' }} />
          </div>

          {/* Bio */}
          <div className="flex flex-col justify-center px-8 md:px-16 py-16">
            <p className="font-mono text-[10px] uppercase tracking-widest mb-6" style={{ color: accentColor }}>
              // 最佳社會證明
            </p>
            <h2
              className="font-black text-white leading-tight mb-2"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              [你的名字]
            </h2>
            <p className="font-mono text-[11px] uppercase text-white/40 mb-8 tracking-wider">
              [你的身份定位 — 簡短一行]
            </p>
            <div className="space-y-4 text-[15px] text-white/65 leading-relaxed">
              <p>
                [你的故事第一段：為什麼你開始這件事]
              </p>
              <p>
                [你的故事第二段：你用 AI 完成了什麼]
              </p>
              <p>
                [這門課為什麼值得信任：你的親身經歷]
              </p>
            </div>
            <div className="mt-10 border-l-2 pl-6 py-2" style={{ borderColor: accentColor }}>
              <p className="font-black text-white text-[16px] leading-snug italic">
                "[你的品牌金句]"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 6. 定價 + 主 CTA ═════════════════════════════════ */}
      <section id="pricing" className="border-t border-white/10 px-8 md:px-16 py-20">
        <div className="max-w-xl mx-auto text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-6">
            // 開始升級
          </p>
          <h2
            className="font-black text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            一堂課的距離，
            <br />
            就是下一個身份。
          </h2>
          <p className="text-[15px] text-white/50 leading-relaxed mb-12">
            從 AI 創作者升級到真正的變現系統。
          </p>

          {/* Price card */}
          <div className="border border-white/20 px-8 py-10 mb-6">
            <p className="font-mono text-[10px] uppercase text-white/30 mb-4">課程定價</p>
            {price > 0 ? (
              <p className="font-black text-white mb-6" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
                NT${price.toLocaleString()}
              </p>
            ) : (
              <p className="font-black text-white/40 mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                即將公布
              </p>
            )}

            <div className="flex flex-col gap-3 text-[12px] text-white/40 font-mono uppercase mb-8">
              <span>✓ 終身使用 + 未來更新</span>
              <span>✓ 附完整課程範本</span>
              <span>✓ 不滿意 7 天退款</span>
            </div>

            <Link
              href={isLoggedIn ? '/pricing' : '#newsletter'}
              className="ed-btn ed-btn-accent w-full justify-center py-4 text-[13px]"
            >
              {isLoggedIn
                ? '升級方案，解鎖課程 →'
                : price > 0
                  ? '加入候補，開放時優先通知 →'
                  : '加入候補，開放時優先通知 →'}
            </Link>
          </div>

          {!isLoggedIn && (
            <p className="text-[11px] text-white/25 font-mono uppercase">
              已有帳號？{' '}
              <Link href="/auth/login" className="text-white/40 hover:text-white transition-colors underline">
                登入查看已購課程
              </Link>
            </p>
          )}
          {isLoggedIn && (
            <p className="text-[11px] text-white/25 font-mono uppercase">
              已登入。升級後即可解鎖完整影片課程。
            </p>
          )}
        </div>
      </section>

      {/* ══ 7. FAQ ═══════════════════════════════════════════ */}
      <section className="border-t border-white/10 px-8 md:px-16 py-16">
        <p className="font-mono text-[10px] uppercase text-white/30 mb-10 tracking-widest">
          // 常見問題
        </p>
        <div className="space-y-px max-w-3xl">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-[#111] px-8 py-6">
              <p className="font-black text-white mb-2 text-[15px]">{item.q}</p>
              <p className="text-[14px] text-white/55 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 8. 最終 CTA ══════════════════════════════════════ */}
      <section className="border-t border-white/10 px-8 md:px-16 py-20 text-center">
        <p
          className="font-black text-white leading-tight mb-6 mx-auto max-w-2xl"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
        >
          你已經在創作了。
          <br />
          <span style={{ color: accentColor }}>差的只是一個系統。</span>
        </p>
        <a
          href="#pricing"
          className="ed-btn ed-btn-accent px-12 py-4 text-[13px]"
        >
          現在加入升級 →
        </a>
      </section>

    </div>
  )
}
