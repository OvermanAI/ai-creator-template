export function isPaymentEnabled() {
  return false
}

export async function createCheckout(_opts: {
  variantId?: string
  courseSlug: string
  studentEmail: string
  name?: string
  callbackUrl?: string
}) {
  // 回傳佔位頁，不丟例外
  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://your-site.tw'
  return { url: `${siteUrl}/checkout/${_opts.courseSlug}?mode=coming-soon` }
}
