const coachConfig = {
  brand: {
    name: 'YOUR_SITE.tw',
    tagline: '你的品牌標語（一句話說清楚你幫誰做什麼）',
    accentColor: '#FF6B9D',     // 主題色 — 改成你的品牌色
    domain: 'your-site.tw',
  },
  levels: {
    l1: {
      label: 'Level 1',
      color: '#ff2d55',
      name: 'AI 基礎',           // 改成你的 L1 課程名稱
      description: '免費入門課，零基礎開始',
    },
    l2: {
      label: 'Level 2',
      color: '#FFB11B',
      name: '進階實戰',          // 改成你的 L2 課程名稱
      description: '付費進階課，開始產出成果',
    },
    l3: {
      label: 'Level 3',
      color: '#00b388',
      name: '全面升級',          // 改成你的 L3 課程名稱
      description: '高階完整課，建立系統',
    },
  },
  cta: {
    primary: { label: '立即開始', href: '/courses' },
    secondary: { label: '了解升級路徑', href: '/pricing' },
    newsletter: { label: '訂閱電子報，第一時間收到最新課程', href: '#newsletter' },
    upgrade: '升級解鎖全部課程',
  },
} as const

export default coachConfig
