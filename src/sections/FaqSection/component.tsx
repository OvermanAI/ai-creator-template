'use client'

import { useState } from 'react'
import { SectionShell } from '@/components/SectionShell'
import { faqTokens } from './tokens'
import type { FaqSectionData } from './schema'

export function FaqSection({ data }: { data: FaqSectionData }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <SectionShell>
      <h2 className="text-4xl font-black">{data.title}</h2>
      <div className={faqTokens.list}>
        {data.items.map((item, i) => (
          <div key={i} className={faqTokens.item}>
            <button
              className={faqTokens.question}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span>{item.question}</span>
              <span className="text-2xl font-black">{openIndex === i ? '−' : '+'}</span>
            </button>
            {openIndex === i && (
              <p className={faqTokens.answer}>{item.answer}</p>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  )
}
