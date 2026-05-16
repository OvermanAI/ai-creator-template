import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    const existing = await payload.find({
      collection: 'newsletter-subscribers',
      where: { email: { equals: email.toLowerCase() } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json({ message: 'Already subscribed' }, { status: 200 })
    }

    await payload.create({
      collection: 'newsletter-subscribers',
      data: {
        email: email.toLowerCase(),
        name: name ?? undefined,
        subscribedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 200 })
  } catch (err) {
    console.error('[Newsletter API]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
