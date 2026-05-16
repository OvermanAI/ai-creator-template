'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [glitch, setGlitch] = useState(false)
  const hasGoogle = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 150)
    }, 4200)
    return () => clearInterval(interval)
  }, [])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, callbackURL: '/dashboard' }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          94% { opacity: 1; }
          95% { opacity: 0.4; }
          96% { opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes glitch-1 {
          0% { clip-path: inset(20% 0 60% 0); transform: translate(-4px, 0); }
          50% { clip-path: inset(70% 0 5% 0); transform: translate(4px, 0); }
          100% { clip-path: inset(20% 0 60% 0); transform: translate(0, 0); }
        }
        @keyframes glitch-2 {
          0% { clip-path: inset(60% 0 10% 0); transform: translate(4px, 0); color: #00ffff; }
          50% { clip-path: inset(20% 0 60% 0); transform: translate(-4px, 0); color: #FF6B9D; }
          100% { clip-path: inset(60% 0 10% 0); transform: translate(0, 0); }
        }
        .glitch-wrap { position: relative; display: inline-block; }
        .glitch-wrap.active::before,
        .glitch-wrap.active::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          font: inherit;
          font-weight: inherit;
        }
        .glitch-wrap.active::before { animation: glitch-1 0.15s steps(1) forwards; color: #00ffff; }
        .glitch-wrap.active::after  { animation: glitch-2 0.15s steps(1) forwards; color: #FF6B9D; }
        .input-game:focus {
          border-color: #FF6B9D !important;
          box-shadow: 0 0 0 1px #FF6B9D, 0 0 20px rgba(255,107,157,0.15);
          outline: none;
        }
        .btn-google:hover { border-color: rgba(255,255,255,0.4) !important; background: rgba(255,255,255,0.05) !important; }
        .btn-primary:hover { background: #ff85b3 !important; }
        .cursor-blink { animation: blink 1s step-end infinite; }
      `}</style>

      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#050508' }}>

        {/* 格線背景 */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(255,107,157,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,157,0.04) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />

        {/* 掃描線 */}
        <div className="absolute left-0 right-0 h-[2px] pointer-events-none" style={{
          background: 'linear-gradient(transparent, rgba(255,107,157,0.08), transparent)',
          animation: 'scanline 7s linear infinite',
          zIndex: 1,
        }} />

        {/* 光暈 */}
        <div className="absolute top-0 left-0 w-96 h-96 pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(255,107,157,0.07) 0%, transparent 70%)',
        }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(0,200,255,0.05) 0%, transparent 70%)',
        }} />

        {/* 頂部導覽 */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4"
          style={{ borderBottom: '1px solid rgba(255,107,157,0.15)' }}>
          <Link href="/"
            className="font-mono text-[11px] uppercase tracking-widest transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            <span style={{ color: '#FF6B9D' }}>◀</span> YOUR_SITE.TW
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: '#FF6B9D', boxShadow: '0 0 6px #FF6B9D' }} />
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
              NEW PLAYER
            </span>
          </div>
        </nav>

        {/* 主體 */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">

            {/* HUD 標籤 */}
            <div className="flex items-center gap-3 mb-8">
              <div className="px-3 py-1 font-mono text-[9px] uppercase tracking-widest" style={{
                background: 'rgba(255,107,157,0.15)',
                border: '1px solid rgba(255,107,157,0.3)',
                color: '#FF6B9D',
              }}>
                CREATE_ACCOUNT
              </div>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,107,157,0.2)' }} />
              <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.15)' }}>FREE</span>
            </div>

            {/* 大標題 */}
            <div className="mb-10">
              <h1
                className={`font-black leading-[0.85] mb-2 glitch-wrap ${glitch ? 'active' : ''}`}
                data-text="加入"
                style={{ fontSize: 'clamp(4rem, 12vw, 7rem)', color: '#ffffff', animation: 'flicker 9s infinite' }}
              >
                加入
              </h1>
              <p className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                <span style={{ color: '#FF6B9D' }}>▶</span> 免費取得課程存取，無需密碼
                <span className="cursor-blink ml-1">_</span>
              </p>
            </div>

            {status === 'sent' ? (
              /* 成功狀態 */
              <div className="px-8 py-10 text-center" style={{
                border: '1px solid rgba(0,255,136,0.3)',
                background: 'rgba(0,255,136,0.04)',
              }}>
                <div className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: '#00ff88' }}>
                  ✓ ACCOUNT CREATED
                </div>
                <p className="font-black text-white text-lg mb-2">連結已寄出</p>
                <p className="font-mono text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  查看你的 Email<br />點擊連結完成註冊
                </p>
              </div>
            ) : (
              <>
                {/* Google 快速註冊 */}
                {hasGoogle && (
                  <>
                    <a
                      href="/api/auth/sign-in/social?provider=google&callbackURL=/dashboard"
                      className="btn-google flex items-center justify-center gap-3 w-full py-3.5 mb-2 font-bold text-[13px] text-white transition-all duration-200"
                      style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      用 Google 繼續
                    </a>
                    <p className="font-mono text-[9px] text-center mb-6" style={{ color: 'rgba(255,255,255,0.15)' }}>
                      — 或用 EMAIL —
                    </p>
                  </>
                )}

                {/* 表單 */}
                <form onSubmit={handleRegister} className="flex flex-col gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px]" style={{ color: 'rgba(255,107,157,0.4)' }}>
                      ID
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="你的名字（選填）"
                      disabled={status === 'loading'}
                      className="input-game w-full pl-10 pr-4 py-3 font-mono text-[13px] text-white bg-transparent transition-all duration-200 disabled:opacity-40"
                      style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' }}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px]" style={{ color: 'rgba(255,107,157,0.5)' }}>
                      &gt;
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={status === 'loading'}
                      className="input-game w-full pl-8 pr-4 py-3 font-mono text-[13px] text-white bg-transparent transition-all duration-200 disabled:opacity-40"
                      style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-primary w-full py-3 font-black text-[13px] tracking-wider transition-all duration-200 disabled:opacity-40"
                    style={{ background: '#FF6B9D', color: '#000', letterSpacing: '0.08em' }}
                  >
                    {status === 'loading' ? '[ INITIALIZING... ]' : '[ 免費加入 ]'}
                  </button>
                </form>

                {status === 'error' && (
                  <p className="mt-3 font-mono text-[11px] text-center" style={{ color: '#ff4444' }}>
                    ✕ ERROR — 請稍後再試
                  </p>
                )}

                {/* 底部 */}
                <div className="mt-8 pt-6 flex items-center justify-between"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                    繼續即同意{' '}
                    <Link href="/terms" className="underline hover:text-white/40 transition-colors" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      服務條款
                    </Link>
                  </p>
                  <Link href="/auth/login"
                    className="font-mono text-[10px] transition-colors hover:text-white/60"
                    style={{ color: '#FF6B9D' }}>
                    已有帳號 →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
