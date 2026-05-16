import { betterAuth } from 'better-auth'
import { magicLink } from 'better-auth/plugins'
import { DatabaseSync } from 'node:sqlite'

const dbPath = process.env.PAYLOAD_DATABASE_PATH || './dev.db'

const googleProviderConfig =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || 'dev-secret-change-me',
  database: new DatabaseSync(dbPath),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const { sendMagicLink } = await import('@/lib/email/index')
        await sendMagicLink({ email, url })
        // 本機 none 模式也印出 URL，方便開發測試
        if (!process.env.EMAIL_PROVIDER || process.env.EMAIL_PROVIDER === 'none') {
          console.log(`[Magic Link DEV] ${email} → ${url}`)
        }
      },
    }),
  ],
  socialProviders: googleProviderConfig,
  user: {
    additionalFields: {
      level: {
        type: 'string',
        defaultValue: 'guest',
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const { getPayload } = await import('payload')
            const configPromise = await import('@payload-config')
            const payload = await getPayload({ config: configPromise.default })

            // 檢查是否已存在（避免重複建立）
            const existing = await payload.find({
              collection: 'students',
              where: { email: { equals: user.email } },
              limit: 1,
            })

            if (existing.docs.length === 0) {
              await payload.create({
                collection: 'students',
                data: {
                  email: user.email,
                  name: user.name || '',
                  level: 'guest',
                },
              })
              console.log(`[Auto Student] 建立學員記錄: ${user.email}`)
            }
          } catch (err) {
            // 不阻斷登入流程，只記錄錯誤
            console.error('[Auto Student] 建立失敗:', err)
          }
        },
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
