/**
 * Payment Router — 自動根據 PAYMENT_PROVIDER 環境變數切換
 * none         → 顯示「即將開放」
 * lemonsqueezy → LemonSqueezy Checkout
 */

export interface CreateCheckoutOpts {
  variantId?: string       // LemonSqueezy variant ID（指定商品用）
  courseSlug: string       // 用於 fallback 顯示用
  studentEmail: string
  name?: string
  callbackUrl?: string     // 付款成功後跳轉
}

export interface CheckoutResult {
  url: string              // 跳轉到付款頁的 URL
}

async function getAdapter() {
  const provider = process.env.PAYMENT_PROVIDER || 'none'
  switch (provider) {
    case 'lemonsqueezy':
      return import('./adapters/lemonsqueezy')
    default:
      return import('./adapters/none')
  }
}

export function isPaymentEnabled() {
  return (process.env.PAYMENT_PROVIDER || 'none') !== 'none'
}

export async function createCheckout(opts: CreateCheckoutOpts): Promise<CheckoutResult> {
  const adapter = await getAdapter()
  return adapter.createCheckout(opts)
}
