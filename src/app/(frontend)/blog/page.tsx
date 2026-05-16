import Link from 'next/link'
import { PageHeroSection } from '@/sections/PageHeroSection/component'
import { SectionShell } from '@/components/SectionShell'
import { getPosts } from '@/lib/queries'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '部落格',
}

export default async function BlogPage() {
  const posts = await getPosts(20).catch(() => [])

  return (
    <>
      <PageHeroSection
        data={{
          blockType: 'pageHeroSection',
          title: '部落格',
          intro: 'AI 藝術創作實戰筆記',
        }}
      />

      <SectionShell>
        {posts.length === 0 ? (
          <div className="nb-card p-12 text-center">
            <p className="text-xl font-black">文章即將發布</p>
            <p className="text-[var(--color-text-muted)] mt-2">敬請期待</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y-2 divide-black border-t-2 border-b-2 border-black">
            {posts.map((post: Record<string, unknown>) => (
              <Link
                key={String(post.id)}
                href={`/blog/${String(post.slug)}`}
                className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--color-highlight)] px-2 transition-colors"
              >
                <div>
                  <h2 className="text-xl font-black">{String(post.title)}</h2>
                  {post.summary ? (
                    <p className="text-[var(--color-text-muted)] mt-1 text-sm">
                      {String(post.summary)}
                    </p>
                  ) : null}
                </div>
                <span className="font-bold whitespace-nowrap">閱讀 →</span>
              </Link>
            ))}
          </div>
        )}
      </SectionShell>
    </>
  )
}
