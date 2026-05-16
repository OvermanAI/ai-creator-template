export const levelTokens = {
  /* 三欄之間用 1px canvas 色間隔，製造編輯感分割線 */
  grid:    'grid grid-cols-1 md:grid-cols-3 mt-12 gap-px bg-gray-100',
  card:    'ed-card p-8 md:p-10 flex flex-col gap-5',
  bar:     'w-8 h-[3px] mb-2',
  label:   'font-mono text-[11px] uppercase text-[var(--color-text-muted)]',
  name:    'text-2xl font-black text-[var(--color-text)] leading-tight',
  promise: 'text-[var(--color-text-muted)] text-sm flex-1 leading-relaxed',
}

export const levelColorVar: Record<string, string> = {
  l1: 'var(--color-l1)',
  l2: 'var(--color-l2)',
  l3: 'var(--color-l3)',
}
