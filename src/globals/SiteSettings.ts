import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      required: true,
      defaultValue: 'YOUR_SITE.tw',
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue: '你的品牌標語（一句話說清楚你幫誰做什麼）',
    },
    {
      name: 'navigation',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
      ],
      defaultValue: [
        { label: '課程', href: '/courses' },
        { label: '定價', href: '/pricing' },
        { label: '部落格', href: '/blog' },
      ],
    },
  ],
}
