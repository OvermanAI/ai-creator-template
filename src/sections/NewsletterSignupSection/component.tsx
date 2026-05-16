'use client'

import { useState } from 'react'
import { SectionShell } from '@/components/SectionShell'
import { newsletterTokens } from './tokens'
import type { NewsletterSignupSectionData } from './schema'

export function NewsletterSignupSection({ data }: { data: NewsletterSignupSectionData }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <SectionShell id="newsletter" dark>
      <div className={newsletterTokens.wrapper}>
        {status === 'success' ? (
          <div className={newsletterTokens.success}>
            <p className="text-2xl font-black">{data.successMessage}</p>
          </div>
        ) : (
          <>
            <h2 className={newsletterTokens.title}>{data.title}</h2>
            {data.subtitle && (
              <p className={newsletterTokens.subtitle}>{data.subtitle}</p>
            )}
            <form onSubmit={handleSubmit} className={newsletterTokens.form}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={data.placeholder}
                required
                className={newsletterTokens.input}
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                className={newsletterTokens.button}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? '處理中...' : data.buttonLabel}
              </button>
            </form>
            {status === 'error' && (
              <p className="mt-4 text-red-600 font-bold">發生錯誤，請稍後再試</p>
            )}
          </>
        )}
      </div>
    </SectionShell>
  )
}
