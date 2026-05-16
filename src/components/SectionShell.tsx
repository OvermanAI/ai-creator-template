import React from 'react'

interface SectionShellProps {
  id?: string
  className?: string
  children: React.ReactNode
  dark?: boolean
}

export function SectionShell({ id, className = '', children, dark = false }: SectionShellProps) {
  const bg = dark
    ? 'grain bg-[var(--color-canvas)] text-[var(--color-text-inv)]'
    : 'bg-[var(--color-card)] text-[var(--color-text)]'

  return (
    <section
      id={id}
      className={`w-full px-4 md:px-8 py-16 md:py-24 ${bg} ${className}`}
    >
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  )
}
