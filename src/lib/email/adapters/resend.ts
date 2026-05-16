/**
 * Resend Email Adapter
 * 需要設定: RESEND_API_KEY, EMAIL_FROM (預設 noreply@your-site.tw)
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FROM = process.env.EMAIL_FROM || 'YOUR_SITE.TW <noreply@your-site.tw>'
const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://your-site.tw'

async function send(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.error('[Resend] 缺少 RESEND_API_KEY，改用 console 模式')
    console.log(`[Email fallback] to=${to} subject=${subject}`)
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[Resend] 寄信失敗:', err)
  }
}

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  await send(opts.to, opts.subject, opts.html)
}

export async function sendMagicLink(opts: { email: string; url: string; name?: string }) {
  const html = `
<!DOCTYPE html>
<html lang="zh-Hant">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:monospace;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid rgba(255,107,157,0.3);">
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#FF6B9D;">YOUR_SITE.TW</p>
          <h1 style="margin:0 0 32px;font-size:28px;font-weight:900;color:#ffffff;">登入連結</h1>
          <p style="margin:0 0 24px;font-size:13px;line-height:1.8;color:rgba(255,255,255,0.5);">
            點擊下方按鈕完成登入。此連結 10 分鐘後失效。
          </p>
          <a href="${opts.url}"
            style="display:inline-block;padding:14px 32px;background:#FF6B9D;color:#000;font-weight:900;font-size:13px;text-decoration:none;letter-spacing:0.08em;">
            [ 進入系統 ]
          </a>
          <p style="margin:32px 0 0;font-size:11px;color:rgba(255,255,255,0.2);">
            若非你本人操作，請忽略此郵件。<br>
            <a href="${SITE_URL}" style="color:rgba(255,107,157,0.5);text-decoration:none;">${SITE_URL}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await send(opts.email, '【YOUR_SITE.TW】登入連結', html)
}
