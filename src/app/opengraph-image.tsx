import { ImageResponse } from 'next/og'
import coachConfig from '../../coach.config'

export const runtime = 'edge'
export const alt = `${coachConfig.brand.name} — ${coachConfig.brand.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#000000',
        padding: '80px',
      }}
    >
      <div
        style={{
          fontSize: '72px',
          fontWeight: 900,
          color: coachConfig.brand.accentColor,
          lineHeight: 1.1,
        }}
      >
        {coachConfig.brand.name}
      </div>
      <div
        style={{
          fontSize: '32px',
          color: '#ffffff',
          opacity: 0.9,
          marginTop: '24px',
          lineHeight: 1.4,
        }}
      >
        {coachConfig.brand.tagline}
      </div>
    </div>,
    { ...size },
  )
}
