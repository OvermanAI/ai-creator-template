#!/usr/bin/env node
/**
 * process-images.mjs
 * 把 public/images/lessons-raw/ 的圖片
 * → 轉 webp + resize → 輸出到 public/images/lessons/
 * → 自動更新 src/payload/seed-data.ts 的 coverImage
 *
 * 使用方式：npm run images
 */

import { select } from '@inquirer/prompts'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const RAW_DIR = path.join(ROOT, 'public/images/lessons-raw')
const OUT_DIR = path.join(ROOT, 'public/images/lessons')
const SEED_FILE = path.join(ROOT, 'src/payload/seed-data.ts')

// ── 全部課程 slug + 標題 ────────────────────────────────
const LESSONS = [
  // BUILD
  { slug: 'chatgpt-image-brand-visual',  title: '[BUILD L1] ChatGPT Image 2.0 品牌視覺入門',   w: 1200, h: 800  },
  { slug: 'prompt-engineering-basics',   title: '[BUILD L1] Prompt 工程：讓 AI 每次都聽話',    w: 1200, h: 800  },
  { slug: 'canva-ai-commercial-assets',  title: '[BUILD L1] Canva × AI 商業素材速成',           w: 1200, h: 800  },
  { slug: 'claude-design-intro',         title: '[BUILD L1] Claude Design 介面設計入門',        w: 1200, h: 800  },
  { slug: 'seedance-ai-video-creation',  title: '[BUILD L2] Seedance 2 AI 影片創作',            w: 1200, h: 800  },
  { slug: 'suno-ai-music-creation',      title: '[BUILD L2] Suno AI 音樂創作',                  w: 1200, h: 800  },
  { slug: 'capcut-ai-short-video',       title: '[BUILD L2] Capcut 短影音剪輯 × AI 素材整合',   w: 1200, h: 800  },
  { slug: 'claude-code-creative-workflow', title: '[BUILD L3] Claude Code 打造 AI 創作工作流', w: 1920, h: 823  },
  { slug: 'brand-system-opc-structure',  title: '[BUILD L3] 品牌系統 × OPC 架構',               w: 1920, h: 823  },
  // SELL
  { slug: 'instagram-portfolio-setup',   title: '[SELL L1] IG 作品集建立攻略',                  w: 1200, h: 800  },
  { slug: 'personal-brand-positioning',  title: '[SELL L1] 個人品牌定位 × AI 協作',             w: 1200, h: 800  },
  { slug: 'ai-copywriting-for-creatives',title: '[SELL L1] AI 文案生成：讓作品自己說話',        w: 1200, h: 800  },
  { slug: 'canva-portfolio-website',     title: '[SELL L1] Canva 作品集網站建立',               w: 1200, h: 800  },
  { slug: 'gumroad-digital-product-launch', title: '[SELL L2] Gumroad 數位商品上架實戰',       w: 1200, h: 800  },
  { slug: 'ai-art-pricing-strategy',     title: '[SELL L2] AI 藝術品定價與銷售策略',            w: 1200, h: 800  },
  { slug: 'sales-page-design',           title: '[SELL L2] 銷售頁設計：讓作品秒變商品',         w: 1200, h: 800  },
  { slug: 'social-media-automation',     title: '[SELL L3] 社群自動化：讓 AI 幫你持續發文',     w: 1920, h: 823  },
  { slug: 'passive-income-opc-system',   title: '[SELL L3] 被動收入系統：OPC 銷售架構',         w: 1920, h: 823  },
]

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']

// ── 掃描 raw 資料夾 ──────────────────────────────────────
function getRawFiles() {
  if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true })
  return fs.readdirSync(RAW_DIR)
    .filter(f => IMAGE_EXTS.includes(path.extname(f).toLowerCase()))
    .sort()
}

// ── 更新 seed-data.ts 的 coverImage ─────────────────────
function updateSeedData(slug, webpPath) {
  let src = fs.readFileSync(SEED_FILE, 'utf8')
  // 找到 slug 對應的 lesson 區塊，插入或更新 coverImage
  const slugPattern = new RegExp(
    `(slug:\\s*'${slug}',[\\s\\S]*?)(coverImage:\\s*'[^']*'\\s*,\\n?)?(\\s*(?:missionLabel|category|upgradeLevel|level|tools))`,
    'm'
  )
  if (slugPattern.test(src)) {
    src = src.replace(slugPattern, (_, before, _existing, after) => {
      return `${before}coverImage: '${webpPath}',\n    ${after.trimStart()}`
    })
    // 避免重複寫入：如果已存在則直接替換
    const existingPattern = new RegExp(`(slug:\\s*'${slug}',[\\s\\S]*?)coverImage:\\s*'[^']*'`, 'm')
    if ((src.match(new RegExp(`slug:\\s*'${slug}'`, 'g')) || []).length > 0) {
      src = src.replace(
        new RegExp(`(slug:\\s*'${slug}'[\\s\\S]*?)coverImage:\\s*'[^']*'`, 'm'),
        `$1coverImage: '${webpPath}'`
      )
    }
    fs.writeFileSync(SEED_FILE, src)
    console.log(`  ✅ seed-data.ts 已更新：${slug} → ${webpPath}`)
  } else {
    console.log(`  ⚠️  找不到 slug "${slug}"，請手動更新 seed-data.ts`)
  }
}

// ── 主流程 ───────────────────────────────────────────────
async function main() {
  const files = getRawFiles()

  if (files.length === 0) {
    console.log('\n📂 lessons-raw/ 沒有圖片。請把圖片丟進去再執行。\n')
    process.exit(0)
  }

  console.log(`\n🖼  找到 ${files.length} 張圖片待處理\n`)

  for (const file of files) {
    const srcPath = path.join(RAW_DIR, file)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📄 ${file}`)

    const lesson = await select({
      message: '這張圖是哪堂課？',
      choices: [
        ...LESSONS.map(l => ({ name: l.title, value: l })),
        { name: '⏭  跳過這張', value: null },
      ],
    })

    if (!lesson) {
      console.log('  ⏭  跳過\n')
      continue
    }

    // resize + 轉 webp
    const outFile = `${lesson.slug}.webp`
    const outPath = path.join(OUT_DIR, outFile)
    const webpRelPath = `/images/lessons/${outFile}`

    try {
      await sharp(srcPath)
        .resize(lesson.w, lesson.h, { fit: 'cover', position: 'centre' })
        .webp({ quality: 85 })
        .toFile(outPath)

      const stat = fs.statSync(outPath)
      const kb = Math.round(stat.size / 1024)
      console.log(`  ✅ 輸出 ${outFile} (${lesson.w}×${lesson.h}, ${kb} KB)`)

      // 更新 seed-data
      updateSeedData(lesson.slug, webpRelPath)

      // 移除原始檔
      fs.unlinkSync(srcPath)
      console.log(`  🗑  已移除原始檔 ${file}`)
    } catch (err) {
      console.error(`  ❌ 處理失敗：${err.message}`)
    }

    console.log()
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✨ 全部完成！記得重新部署：vercel deploy --prod\n')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
