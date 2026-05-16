/**
 * sync-lessons.ts — 課程同步腳本
 *
 * 讀取 content/courses/l2/ 和 content/courses/l3/ 的 Markdown 筆記
 * → AI 自動補全缺少的欄位
 * → 透過 Payload REST API upsert 到 CMS
 *
 * 前置條件：dev server 必須在 localhost:3000 執行中（npm run dev）
 *
 * 使用方式：
 *   npm run sync-lessons
 *   npm run sync-lessons -- --level=l2    （只同步 L2）
 *   npm run sync-lessons -- --level=l3    （只同步 L3）
 *   npm run sync-lessons -- --dry-run     （預覽，不寫入）
 */

import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'

// ── 設定 ──────────────────────────────────────────────────────

// 載入 .env.local（同步，避免 top-level await）
try {
  const envPath = path.resolve(process.cwd(), '.env.local')
  const envContent = fsSync.readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx <= 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
} catch { /* .env.local 不存在時不報錯 */ }

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const ADMIN_EMAIL = process.env.PAYLOAD_ADMIN_EMAIL || ''
const ADMIN_PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD || ''

// ── 型別 ──────────────────────────────────────────────────────

interface CourseFrontmatter {
  title: string
  category: 'build' | 'sell'
  upgradeLevel: '2' | '3'
  level: 'beginner' | 'easy' | 'medium'
  tools?: string[]
  durationMinutes?: number
  videoUrl?: string
  slug?: string
  summary?: string
  missionLabel?: string
  outcome?: string
  order?: number
}

interface ParsedLesson {
  frontmatter: CourseFrontmatter
  body: string
  filename: string
}

// ── YAML Frontmatter 解析（不依賴外部套件）────────────────────

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { frontmatter: {}, body: content }

  const yamlStr = match[1]
  const body = match[2].trim()
  const frontmatter: Record<string, unknown> = {}
  let currentKey = ''
  let inArray = false
  const arrayValues: string[] = []

  for (const line of yamlStr.split('\n')) {
    if (line.trim().startsWith('#')) continue
    if (line.match(/^\s+-\s+/) && inArray) {
      arrayValues.push(line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, ''))
      continue
    }
    if (inArray && !line.match(/^\s+-\s+/)) {
      frontmatter[currentKey] = [...arrayValues]
      arrayValues.length = 0
      inArray = false
    }
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (!kv) continue
    const [, key, val] = kv
    currentKey = key
    const cleaned = val.trim().replace(/^["']|["']$/g, '')
    if (cleaned === '' || cleaned === '[]') { inArray = true; continue }
    frontmatter[key] = /^\d+$/.test(cleaned) ? parseInt(cleaned, 10) : cleaned
  }
  if (inArray && arrayValues.length > 0) frontmatter[currentKey] = [...arrayValues]

  return { frontmatter, body }
}

// ── Slug 生成 ─────────────────────────────────────────────────

function slugFromFilename(filename: string, upgradeLevel: string): string {
  const base = filename.replace(/^\d+-/, '').replace(/\.md$/, '')
  return `l${upgradeLevel}-${base}`
}

// ── 章節解析（從 markdown body 解析 # ## 結構）────────────────
// 格式：
//   # 章節名稱
//   ## 單元名稱 | 22:56
//   videoUrl: https://...
//   ## 另一個單元 | 10:40
//   videoUrl: https://...

interface ParsedUnit {
  title: string
  type: 'video' | 'practice'
  videoUrl: string
  durationMinutes: number
  isFreePreview: boolean
  practiceContent: string
}
interface ParsedChapter {
  title: string
  units: ParsedUnit[]
}

function parseDuration(str: string): number {
  // 支援 "22:56" → 22.93 分、"1:22:56" → 82.93 分、"22.5" → 22.5 分
  const parts = str.trim().split(':').map(Number)
  if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60
  if (parts.length === 2) return parts[0] + parts[1] / 60
  return parseFloat(str) || 0
}

function parseChapters(body: string): ParsedChapter[] {
  const chapters: ParsedChapter[] = []
  let currentChapter: ParsedChapter | null = null
  let currentUnit: ParsedUnit | null = null
  const practiceLines: string[] = []

  function saveUnit() {
    if (currentUnit && currentChapter) {
      if (currentUnit.type === 'practice' && practiceLines.length > 0) {
        currentUnit.practiceContent = practiceLines.join('\n').trim()
      }
      practiceLines.length = 0
      currentChapter.units.push({ ...currentUnit })
      currentUnit = null
    }
  }

  for (const line of body.split('\n')) {
    const trimmed = line.trim()

    // # 一級標題 → 新章節
    if (/^#\s+/.test(line) && !/^##/.test(line)) {
      saveUnit()
      if (currentChapter) chapters.push(currentChapter)
      currentChapter = { title: trimmed.replace(/^#\s+/, ''), units: [] }
      continue
    }

    // ### 三級標題 → 實做單元（practice unit）
    if (/^###\s+/.test(line)) {
      saveUnit()
      if (!currentChapter) {
        currentChapter = { title: '前言', units: [] }
      }
      const unitTitle = trimmed.replace(/^###\s+/, '').trim()
      currentUnit = { title: unitTitle, type: 'practice', videoUrl: '', durationMinutes: 0, isFreePreview: false, practiceContent: '' }
      continue
    }

    // ## 二級標題 → 新單元（格式：## 標題 | MM:SS 或 ## 標題）
    if (/^##\s+/.test(line)) {
      saveUnit()
      if (!currentChapter) {
        currentChapter = { title: '前言', units: [] }
      }
      const raw = trimmed.replace(/^##\s+/, '')
      const pipeIdx = raw.lastIndexOf('|')
      let unitTitle = raw
      let durationMinutes = 0
      if (pipeIdx >= 0) {
        unitTitle = raw.slice(0, pipeIdx).trim()
        durationMinutes = parseDuration(raw.slice(pipeIdx + 1).trim())
      }
      // (試看) 標記
      const isFreePreview = /\(試看\)/.test(unitTitle)
      unitTitle = unitTitle.replace(/\(試看\)\s*/, '').trim()

      currentUnit = { title: unitTitle, type: 'video', videoUrl: '', durationMinutes, isFreePreview, practiceContent: '' }
      continue
    }

    // videoUrl: ... → 設定當前 video 單元的影片
    if (trimmed.startsWith('videoUrl:') && currentUnit && currentUnit.type === 'video') {
      currentUnit.videoUrl = trimmed.replace(/^videoUrl:\s*/, '').trim()
      continue
    }

    // 實做單元的內容行（非 #/##/### 開頭）
    if (currentUnit && currentUnit.type === 'practice' && trimmed && !trimmed.startsWith('#')) {
      practiceLines.push(line)
    }
  }

  // 收尾
  saveUnit()
  if (currentChapter && (currentChapter.units.length > 0 || chapters.length === 0)) {
    chapters.push(currentChapter)
  }

  return chapters
}

function totalChapterMinutes(chapters: ParsedChapter[]): number {
  return chapters.reduce((sum, ch) =>
    sum + ch.units.reduce((s, u) => u.type === 'video' ? s + (u.durationMinutes ?? 0) : s, 0), 0)
}

// ── AI 補全（Claude Haiku API）───────────────────────────────

async function aiGenerate(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return ''

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) return ''
    const data = await res.json() as { content: Array<{ text: string }> }
    return data.content?.[0]?.text?.trim() || ''
  } catch {
    return ''
  }
}

async function generateSummary(title: string, body: string): Promise<string> {
  const r = await aiGenerate(
    `你是這個課程平台的課程編輯，請幫忙寫課程摘要。\n` +
    `課程：${title}\n筆記：${body.slice(0, 600)}\n\n` +
    `用繁體中文寫 2 句摘要，語氣直接清晰，不要用「本課程」開頭，40-60字。只輸出摘要。`
  )
  return r || `學習 ${title} 的核心技巧，實作出真實可用的成果。`
}

async function generateMissionLabel(category: string, tools: string[]): Promise<string> {
  const toolStr = tools.slice(0, 2).join('、') || 'AI 工具'
  return `${toolStr} ${category === 'build' ? '創作' : '銷售'}任務`
}

async function generateOutcome(title: string, body: string): Promise<string> {
  const match = body.match(/##\s*學完你能做什麼\n+([\s\S]*?)(?:\n##|$)/)
  if (match?.[1] && match[1].trim().length > 10) return match[1].trim().slice(0, 100)

  const r = await aiGenerate(
    `用一句話（20-40字）描述學完這個課程能做到的具體事情：${title}\n內容：${body.slice(0, 400)}\n只輸出那句話。`
  )
  return r || `完成 ${title} 的實戰練習`
}

// ── Payload REST API 操作 ─────────────────────────────────────

let authToken = ''

async function payloadLogin(): Promise<boolean> {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(`
❌ 缺少 Payload 管理員帳號。請在 .env.local 加入：
   PAYLOAD_ADMIN_EMAIL=你的管理員email
   PAYLOAD_ADMIN_PASSWORD=你的管理員密碼
（npm run bootstrap 時設定的帳密）`)
    return false
  }

  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })

  if (!res.ok) {
    console.error(`❌ Payload 登入失敗 (${res.status})。請確認管理員帳密正確，且 dev server 在 ${BASE_URL} 執行中。`)
    return false
  }

  const data = await res.json() as { token?: string }
  authToken = data.token || ''
  return !!authToken
}

async function findLesson(slug: string): Promise<{ id: string } | null> {
  const res = await fetch(
    `${BASE_URL}/api/lessons?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
    { headers: { Authorization: `JWT ${authToken}` } }
  )
  if (!res.ok) return null
  const data = await res.json() as { docs: Array<{ id: string }> }
  return data.docs?.[0] || null
}

async function upsertLesson(slug: string, data: Record<string, unknown>): Promise<'created' | 'updated' | 'error'> {
  const existing = await findLesson(slug)

  const method = existing ? 'PATCH' : 'POST'
  const url = existing
    ? `${BASE_URL}/api/lessons/${existing.id}`
    : `${BASE_URL}/api/lessons`

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${authToken}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`   REST 錯誤 (${res.status}): ${err.slice(0, 200)}`)
    return 'error'
  }

  return existing ? 'updated' : 'created'
}

// ── 主程式 ────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const levelFilter = args.find(a => a.startsWith('--level='))?.split('=')[1]
  const dryRun = args.includes('--dry-run')

  const repoRoot = path.resolve(process.cwd())
  const contentRoot = path.join(repoRoot, 'content', 'courses')
  const levels = levelFilter ? [levelFilter] : ['l2', 'l3']

  console.log(`\n🔄 課程同步 ${dryRun ? '(DRY RUN)' : ''}`)
  console.log(`   Level: ${levels.join(', ')}`)
  console.log(`   來源: content/courses/\n`)

  // 讀取課程筆記
  const lessons: ParsedLesson[] = []
  for (const level of levels) {
    const dir = path.join(contentRoot, level)
    let files: string[]
    try {
      files = (await fs.readdir(dir)).filter(f => f.endsWith('.md') && !f.startsWith('_')).sort()
    } catch {
      console.log(`  ℹ️  content/courses/${level}/ 不存在，跳過`)
      continue
    }

    for (const filename of files) {
      const content = await fs.readFile(path.join(dir, filename), 'utf-8')
      const { frontmatter, body } = parseFrontmatter(content)

      if (!frontmatter.title) {
        console.warn(`  ⚠️  ${filename} 缺少 title，跳過`)
        continue
      }

      lessons.push({ frontmatter: frontmatter as unknown as CourseFrontmatter, body, filename })
    }
  }

  if (lessons.length === 0) {
    console.log('沒有找到課程筆記。請在 content/courses/l2/ 或 content/courses/l3/ 建立 .md 檔案。')
    process.exit(0)
  }

  console.log(`找到 ${lessons.length} 堂課程筆記\n`)

  // Dry run 模式：只預覽不寫入
  if (dryRun) {
    for (const lesson of lessons) {
      const { frontmatter: fm, filename } = lesson
      const slug = fm.slug || slugFromFilename(filename, String(fm.upgradeLevel || '2'))
      const chapters = parseChapters(lesson.body)
      const hasChapters = chapters.length > 0 && chapters.some(c => c.units.length > 0)
      const totalMinutes = hasChapters ? Math.round(totalChapterMinutes(chapters)) : (fm.durationMinutes || 0)
      const totalUnits = chapters.reduce((s, c) => s + c.units.length, 0)
      console.log(`  📝 ${fm.title}`)
      console.log(`     slug: ${slug} | level: L${fm.upgradeLevel} | videoUrl: ${fm.videoUrl ? '✅' : '❌ 未填'}`)
      if (hasChapters) {
        console.log(`     📚 章節結構: ${chapters.length} 章 / ${totalUnits} 單元 / 總計 ${totalMinutes} 分鐘`)
        for (const ch of chapters) {
          console.log(`        [${ch.title}] ${ch.units.length} 單元`)
          for (const u of ch.units) {
            if (u.type === 'practice') {
              console.log(`          🛠 ${u.title.replace(/^🛠\s*/, '')}`)
            } else {
              const dur = u.durationMinutes ? ` (${u.durationMinutes.toFixed(0)}分)` : ''
              const preview = u.isFreePreview ? ' 🔓試看' : ''
              console.log(`          ▶ ${u.title}${dur}${preview}`)
            }
          }
        }
      }
    }
    console.log('\n（Dry run 完成，未寫入任何資料）')
    process.exit(0)
  }

  // 登入 Payload
  const loggedIn = await payloadLogin()
  if (!loggedIn) process.exit(1)
  console.log(`✓ Payload 登入成功 (${BASE_URL})\n`)

  // 同步每堂課
  const orderCounters: Record<string, number> = { '2': 200, '3': 300 }
  let created = 0, updated = 0, failed = 0

  for (const lesson of lessons) {
    const fm = lesson.frontmatter
    const upgradeLevel = String(fm.upgradeLevel || '2')
    const slug = fm.slug || slugFromFilename(lesson.filename, upgradeLevel)
    const order = fm.order ?? ++orderCounters[upgradeLevel]

    process.stdout.write(`  📝 ${fm.title} `)

    const summary = fm.summary || await generateSummary(fm.title, lesson.body)
    const missionLabel = fm.missionLabel || await generateMissionLabel(
      fm.category || 'build',
      Array.isArray(fm.tools) ? fm.tools : []
    )
    const outcome = fm.outcome || await generateOutcome(fm.title, lesson.body)

    // 解析章節結構
    const parsedChapters = parseChapters(lesson.body)
    const hasChapters = parsedChapters.length > 0 && parsedChapters.some(c => c.units.length > 0)

    // 計算總時長：有章節就從章節算，否則用 frontmatter
    const computedDuration = hasChapters
      ? Math.round(totalChapterMinutes(parsedChapters))
      : (fm.durationMinutes || 30)

    const data = {
      title: fm.title,
      slug,
      summary,
      missionLabel,
      outcome,
      category: fm.category || 'build',
      upgradeLevel,
      level: fm.level || 'beginner',
      tools: (Array.isArray(fm.tools) ? fm.tools : []).map((t: string) => ({ tool: t })),
      durationMinutes: computedDuration,
      videoUrl: hasChapters ? '' : (fm.videoUrl || ''),
      accessLevel: 'paid',
      price: 0,
      order,
      coverImage: `/images/lessons/${slug}.webp`,
      // 章節資料
      chapters: hasChapters ? parsedChapters.map(ch => ({
        ...ch,
        units: ch.units.map(u => ({
          title: u.title,
          type: u.type,
          videoUrl: u.videoUrl,
          durationMinutes: u.durationMinutes,
          isFreePreview: u.isFreePreview,
          practiceContent: u.practiceContent,
        })),
      })) : [],
    }

    const result = await upsertLesson(slug, data)
    if (result === 'created') { console.log('✅ 建立'); created++ }
    else if (result === 'updated') { console.log('✏️  更新'); updated++ }
    else { console.log('❌ 失敗'); failed++ }
  }

  // 摘要
  console.log(`\n完成！建立 ${created} 堂，更新 ${updated} 堂，失敗 ${failed} 堂。`)

  const noVideo = lessons.filter(l => !l.frontmatter.videoUrl)
  if (noVideo.length > 0) {
    console.log(`\n🎬 以下課程尚未填入影片 URL（顯示「影片準備中」）：`)
    noVideo.forEach(l => console.log(`   - ${l.frontmatter.title}`))
    console.log(`\n   → 錄完影片後在 Obsidian 筆記貼上 YouTube embed URL`)
    console.log(`   → 格式：https://www.youtube.com/embed/VIDEO_ID`)
    console.log(`   → 再執行 npm run sync-lessons 即可更新`)
  }

  process.exit(0)
}

main().catch(err => {
  console.error('同步失敗:', err)
  process.exit(1)
})
