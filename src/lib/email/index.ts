/**
 * Email Router — 自動根據 EMAIL_PROVIDER 環境變數切換
 * none   → console.log（本機開發）
 * resend → Resend API（生產）
 */

export interface SendEmailOpts {
  to: string
  subject: string
  html: string
}

export interface SendMagicLinkOpts {
  email: string
  url: string
  name?: string
}

async function getAdapter() {
  const provider = process.env.EMAIL_PROVIDER || 'none'
  switch (provider) {
    case 'resend':
      return import('./adapters/resend')
    default:
      return import('./adapters/none')
  }
}

export async function sendEmail(opts: SendEmailOpts) {
  const adapter = await getAdapter()
  return adapter.sendEmail(opts)
}

export async function sendMagicLink(opts: SendMagicLinkOpts) {
  const adapter = await getAdapter()
  return adapter.sendMagicLink(opts)
}
