/**
 * LemonSqueezy Webhook Handler
 *
 * 事件: order_created（付款成功）
 * 自動邏輯:
 *   variantId === LEMONSQUEEZY_L3_VARIANT_ID → level = l3
 *   variantId === LEMONSQUEEZY_L2_VARIANT_ID → level = l2
 *   fallback: 金額 > NT$5000（50000 分）      → level = l3，否則 → l2
 *
 * Vercel 設定: LEMONSQUEEZY_WEBHOOK_SECRET
 * LemonSqueezy 設定: Webhooks → URL = https://your-site.tw/api/webhooks/lemonsqueezy
 *                    Events: order_created
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'

// 阻止靜態優化，webhook 必須動態
export const dynamic = 'force-dynamic'

// ── 簽名驗證 ──────────────────────────────────────────────────
async function verifySignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[Webhook] 未設定 LEMONSQUEEZY_WEBHOOK_SECRET，略過簽名驗證（僅開發用）')
    return true
  }

  const signature = req.headers.get('x-signature')
  if (!signature) return false

  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(rawBody)
  const digest = hmac.digest('hex')

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

// ── 決定升級 level ────────────────────────────────────────────
function resolveLevel(variantId: string, totalCents: number): 'l2' | 'l3' {
  const l3Variant = process.env.LEMONSQUEEZY_L3_VARIANT_ID
  const l2Variant = process.env.LEMONSQUEEZY_L2_VARIANT_ID

  // Variant ID 優先比對
  if (l3Variant && variantId === l3Variant) return 'l3'
  if (l2Variant && variantId === l2Variant) return 'l2'

  // Fallback：金額判斷（threshold: NT$5000 = 500000 分）
  const threshold = Number(process.env.LEVEL_UPGRADE_THRESHOLD_CENTS || 500000)
  return totalCents > threshold ? 'l3' : 'l2'
}

// ── 更新 Payload Student level ────────────────────────────────
async function upgradeStudentLevel(email: string, level: 'l2' | 'l3') {
  const { getPayload } = await import('payload')
  const configPromise = await import('@payload-config')
  const payload = await getPayload({ config: configPromise.default })

  // 找到學員
  const result = await payload.find({
    collection: 'students',
    where: { email: { equals: email } },
    limit: 1,
  })

  if (result.docs.length === 0) {
    // 學員不存在（理論上 databaseHooks 已自動建立，這裡做保護）
    await payload.create({
      collection: 'students',
      data: { email, name: '', level },
    })
    console.log(`[Webhook] 建立新學員並設 level=${level}: ${email}`)
  } else {
    const student = result.docs[0]
    const currentLevel = String((student as Record<string, unknown>).level || 'guest')

    // 只升不降（l3 不會被 l2 覆蓋）
    const RANK: Record<string, number> = { guest: 0, l1: 1, l2: 2, l3: 3, coach: 4 }
    if ((RANK[level] ?? 0) > (RANK[currentLevel] ?? 0)) {
      await payload.update({
        collection: 'students',
        id: student.id,
        data: { level },
      })
      console.log(`[Webhook] 升級 ${email}: ${currentLevel} → ${level}`)
    } else {
      console.log(`[Webhook] 略過降級 ${email}: 已是 ${currentLevel}，付款為 ${level}`)
    }
  }
}

// ── 寄送升級通知信 ────────────────────────────────────────────
async function sendUpgradeEmail(email: string, level: 'l2' | 'l3') {
  try {
    const { sendEmail } = await import('@/lib/email/index')
    const levelLabel = level === 'l3' ? 'Level 3 — 升級 OPC' : 'Level 2 — 開課賺錢'
    const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://your-site.tw'

    await sendEmail({
      to: email,
      subject: `【YOUR_SITE.TW】🎉 你已解鎖 ${levelLabel}`,
      html: `
<!DOCTYPE html>
<html lang="zh-Hant">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050508;font-family:monospace;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid rgba(0,255,136,0.3);">
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#00ff88;">✓ LEVEL UNLOCKED</p>
          <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#ffffff;">${levelLabel}</h1>
          <p style="margin:0 0 24px;font-size:13px;line-height:1.8;color:rgba(255,255,255,0.5);">
            付款已確認，你的帳號已自動升級。<br>
            立即進入學員後台查看解鎖的課程。
          </p>
          <a href="${siteUrl}/dashboard"
            style="display:inline-block;padding:14px 32px;background:#FF6B9D;color:#000;font-weight:900;font-size:13px;text-decoration:none;letter-spacing:0.08em;">
            [ 進入後台 ]
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })
  } catch (err) {
    // 通知信失敗不影響主流程
    console.error('[Webhook] 升級通知信失敗:', err)
  }
}

// ── Route Handler ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // 1. 驗證簽名
  const valid = await verifySignature(req, rawBody)
  if (!valid) {
    console.error('[Webhook] 簽名驗證失敗')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const meta = payload?.meta as Record<string, unknown> | undefined
  const eventName = req.headers.get('x-event-name') || String(meta?.event_name ?? '')

  // 2. 只處理 order_created
  if (eventName !== 'order_created') {
    return NextResponse.json({ ok: true, skipped: eventName })
  }

  // 3. 取出關鍵欄位
  const data = payload?.data as Record<string, unknown> | undefined
  const attributes = data?.attributes as Record<string, unknown> | undefined
  const relationships = data?.relationships as Record<string, unknown> | undefined

  const email = String(
    (attributes?.user_email as string) ||
    ((attributes?.checkout_data as Record<string, unknown>)?.email as string) ||
    '',
  )

  const totalCents = Number(attributes?.total ?? 0)
  const variantId = String(
    ((relationships?.variant as Record<string, unknown>)?.data as Record<string, unknown>)?.id ?? '',
  )
  const orderStatus = String(attributes?.status ?? '')

  // 4. 只處理 paid 狀態
  if (orderStatus !== 'paid') {
    console.log(`[Webhook] 略過非 paid 訂單: status=${orderStatus}`)
    return NextResponse.json({ ok: true, skipped: `status=${orderStatus}` })
  }

  if (!email) {
    console.error('[Webhook] 找不到學員 email')
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  // 5. 決定 level 並升級
  const level = resolveLevel(variantId, totalCents)

  try {
    await upgradeStudentLevel(email, level)
    await sendUpgradeEmail(email, level)

    console.log(`[Webhook] ✅ 完成: ${email} → ${level} (variant=${variantId}, total=${totalCents})`)
    return NextResponse.json({ ok: true, email, level })
  } catch (err) {
    console.error('[Webhook] 升級失敗:', err)
    return NextResponse.json({ error: 'Upgrade failed' }, { status: 500 })
  }
}
