import { SectionShell } from '@/components/SectionShell'
import { getPostBySlug } from '@/lib/queries'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug).catch(() => null)
  return { title: (post as Record<string, unknown> | null)?.title ? String((post as Record<string, unknown>).title) : slug }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug).catch(() => null) as Record<string, unknown> | null

  if (!post) notFound()

  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h1 className="text-[clamp(2rem,5vw,4rem)] font-black leading-[1.1] mb-6">
          {String(post.title)}
        </h1>
        {post.summary ? (
          <p className="text-xl text-[var(--color-text-muted)] mb-8">
            {String(post.summary)}
          </p>
        ) : null}
        <div className="prose prose-lg max-w-none">
          <p className="text-[var(--color-text-muted)]">文章內容載入中...</p>
        </div>
      </div>
    </SectionShell>
  )
}
