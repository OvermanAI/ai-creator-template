import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { createCheckout, isPaymentEnabled } from '@/lib/payment/index'
import { getLessonBySlug } from '@/lib/queries'
import { seedLessons, seedHomePage } from '@/payload/seed-data'
import { SectionShell } from '@/components/SectionShell'
import { NewsletterSignupSection } from '@/sections/NewsletterSignupSection/component'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ courseSlug: string }> }

export const metadata: Metadata = {
  title: '結帳',
}

export default async function CheckoutPage({ params }: Props) {
  const { courseSlug } = await params

  // 取課程資料
  const dbCourse = await getLessonBySlug(courseSlug).catch(() => null)
  const course = (dbCourse as Record<string, unknown> | null)
    ?? (seedLessons.find((c) => c.slug === courseSlug) as Record<string, unknown> | undefined)
    ?? null

  // 取 session
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList }).catch(() => null)

  // 付款系統已啟用 + 已登入 → 自動建立 checkout 並跳轉
  if (isPaymentEnabled() && session) {
    try {
      const result = await createCheckout({
        courseSlug,
        studentEmail: session.user.email ?? '',
        name: session.user.name ?? '',
        callbackUrl: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://your-site.tw'}/dashboard?payment=success`,
      })
      redirect(result.url)
    } catch (err) {
      console.error('[Checkout] 建立結帳失敗:', err)
      // 繼續顯示佔位頁
    }
  }

  // 付款系統已啟用但未登入 → 跳轉登入後回來
  if (isPaymentEnabled() && !session) {
    redirect(`/auth/login?callbackURL=/checkout/${courseSlug}`)
  }

  // 付款系統未啟用 → 顯示佔位頁
  const newsletterData = seedHomePage.blocks[2] as Parameters<typeof NewsletterSignupSection>[0]['data']

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
        style={{ background: '#080808', color: '#f0f0f0' }}>

        <div className="w-full max-w-md text-center">
          {/* HUD 標籤 */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 font-mono text-[9px] uppercase tracking-widest"
            style={{ border: '1px solid rgba(255,107,157,0.3)', color: '#FF6B9D', background: 'rgba(255,107,157,0.08)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B9D] animate-pulse" />
            PAYMENT_COMING_SOON
          </div>

          <h1 className="font-black text-white mb-4" style={{ fontSize: 'clamp(2rem,6vw,3.5rem)' }}>
            付款系統
            <br />
            <span style={{ color: '#FF6B9D' }}>即將開放</span>
          </h1>

          {course && (
            <p className="font-mono text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              課程：{String(course.title)}
            </p>
          )}

          <p className="font-mono text-[12px] leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
            訂閱電子報，<br />成為付款系統開放的第一批通知對象。
          </p>

          <Link href="/#newsletter"
            className="inline-block px-8 py-3 font-black text-[13px] tracking-wider"
            style={{ background: '#FF6B9D', color: '#000' }}>
            搶先通知我 →
          </Link>

          <p className="mt-8 font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
            <Link href="/dashboard" style={{ color: 'rgba(255,107,157,0.5)' }}>← 返回後台</Link>
          </p>
        </div>
      </div>

      <NewsletterSignupSection data={newsletterData} />
    </>
  )
}
