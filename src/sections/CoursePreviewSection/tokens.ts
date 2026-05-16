export const coursePreviewTokens = {
  grid:    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px mt-12 bg-gray-100',
  card:    'ed-card p-7 flex flex-col gap-3 group',
  levelBar:'w-6 h-[3px] mb-1',
  level:   'font-mono text-[11px] uppercase',
  title:   'text-lg font-black leading-tight text-[var(--color-text)]',
  summary: 'text-[var(--color-text-muted)] text-sm flex-1 leading-relaxed',
  link:    'font-bold text-sm mt-auto text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors duration-150',
}

export const levelColor: Record<string, string> = {
  '1': 'var(--color-l1)',
  '2': 'var(--color-l2)',
  '3': 'var(--color-l3)',
}
