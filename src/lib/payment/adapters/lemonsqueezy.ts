/**
 * LemonSqueezy Payment Adapter
 *
 * 必要環境變數:
 *   LEMONSQUEEZY_API_KEY     — API 金鑰（從 LemonSqueezy Settings → API 取得）
 *   LEMONSQUEEZY_STORE_ID    — 商店 ID
 *   LEMONSQUEEZY_L2_VARIANT_ID — L2 課程的 variant ID
 *   LEMONSQUEEZY_L3_VARIANT_ID — L3 課程的 variant ID
 *   LEMONSQUEEZY_WEBHOOK_SECRET — Webhook 簽名驗證密鑰
 *
 * 升級邏輯（由 webhook handler 執行）:
 *   variant = L2_VARIANT_ID → 設 level=l2
 *   variant = L3_VARIANT_ID → 設 level=l3
 */

const API_KEY = process.env.LEMONSQUEEZY_API_KEY || ''
const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID || ''

export async function createCheckout(opts: {
  variantId?: string
  courseSlug: string
  studentEmail: string
  name?: string
  callbackUrl?: string
}) {
  if (!API_KEY || !STORE_ID) {
    throw new Error('LemonSqueezy 尚未設定 API_KEY 或 STORE_ID')
  }

  // 根據 courseSlug 決定 variantId
  const variantId = opts.variantId || resolveVariantId(opts.courseSlug)
  if (!variantId) {
    throw new Error(`找不到對應的 LemonSqueezy variant: ${opts.courseSlug}`)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://your-site.tw'
  const successUrl = opts.callbackUrl || `${siteUrl}/dashboard?payment=success`

  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email: opts.studentEmail,
          name: opts.name || '',
          custom: { student_email: opts.studentEmail },
        },
        checkout_options: {
          button_color: '#FF6B9D',
        },
        product_options: {
          redirect_url: successUrl,
        },
      },
      relationships: {
        store: { data: { type: 'stores', id: STORE_ID } },
        variant: { data: { type: 'variants', id: variantId } },
      },
    },
  }

  const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LemonSqueezy checkout 建立失敗: ${err}`)
  }

  const data = await res.json()
  const checkoutUrl: string = data.data?.attributes?.url
  if (!checkoutUrl) throw new Error('LemonSqueezy 未回傳 checkout URL')

  return { url: checkoutUrl }
}

/**
 * 根據 courseSlug 的 upgrade level 自動對應 variant ID
 * 也可以直接傳 variantId 覆蓋
 */
function resolveVariantId(courseSlug: string): string | null {
  // 先讀 env var 對應
  const l2 = process.env.LEMONSQUEEZY_L2_VARIANT_ID
  const l3 = process.env.LEMONSQUEEZY_L3_VARIANT_ID

  // slug 中含 l3 關鍵字 → L3
  if (l3 && courseSlug.includes('l3')) return l3
  // 預設給 L2
  if (l2) return l2

  return null
}
