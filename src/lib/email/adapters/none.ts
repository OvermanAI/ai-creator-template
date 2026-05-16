export async function sendEmail(_opts: { to: string; subject: string; html: string }) {
  console.log('[Email Provider: none] Email not sent')
}

export async function sendMagicLink(_opts: { email: string; url: string }) {
  console.log('[Email Provider: none] Magic link not sent')
}
