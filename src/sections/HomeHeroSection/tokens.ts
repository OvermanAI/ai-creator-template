export const heroTokens = {
  section: 'w-full',
  grid:    'grid grid-cols-1 md:grid-cols-2',

  /* Left — white editorial column */
  leftCol:   'bg-[var(--color-card)] px-8 md:px-14 py-16 md:py-24 flex flex-col justify-between min-h-[88vh]',
  issueTag:  'font-mono text-[11px] text-[var(--color-text-muted)] uppercase mb-10',
  headline:  'text-[clamp(2.8rem,5.5vw,5.2rem)] font-black leading-[1.0] mb-6 text-[var(--color-text)]',
  tagline:   'text-base text-[var(--color-text-muted)] mb-10 max-w-sm leading-relaxed',
  ctaRow:    'flex flex-wrap gap-3',
  leftFooter:'mt-auto pt-12',
  idaw:      'font-mono text-[11px] text-[var(--color-text-muted)] uppercase',

  /* Right — dark brand column (desktop only) */
  rightCol:     'bg-[var(--color-canvas)] hidden md:flex flex-col justify-between px-10 py-16 min-h-[88vh] overflow-hidden relative',
  rightTag:     'font-mono text-[11px] text-[var(--color-text-muted-inv)] uppercase',
  rightBrand:   'font-black leading-none text-[var(--color-accent)] select-none',
  rightSub:     'font-black leading-none text-[var(--color-text-muted-inv)] select-none',
  rightDivider: 'w-12 h-px bg-[var(--color-canvas-raised)] my-8',
  rightCaption: 'text-sm text-[var(--color-text-muted-inv)] leading-relaxed max-w-[220px]',
  rightCredit:  'font-mono text-[11px] text-[var(--color-text-muted-inv)] uppercase',
}
