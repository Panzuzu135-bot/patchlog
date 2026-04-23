import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { updateSession } from '@/lib/supabase/middleware'
import { proxy, config } from '@/proxy'

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(),
}))

const mockUpdateSession = vi.mocked(updateSession)

const passThrough = { supabaseResponse: new Response() as any, user: null }

describe('proxy — matcher', () => {
  it('incluye rutas de la app', () => {
    expect(unstable_doesMiddlewareMatch({ config, url: '/' })).toBe(true)
    expect(unstable_doesMiddlewareMatch({ config, url: '/login' })).toBe(true)
    expect(unstable_doesMiddlewareMatch({ config, url: '/dashboard' })).toBe(true)
    expect(unstable_doesMiddlewareMatch({ config, url: '/dashboard/new' })).toBe(true)
  })

  it('excluye assets estáticos', () => {
    expect(unstable_doesMiddlewareMatch({ config, url: '/_next/static/chunk.js' })).toBe(false)
    expect(unstable_doesMiddlewareMatch({ config, url: '/_next/image?url=foo' })).toBe(false)
    expect(unstable_doesMiddlewareMatch({ config, url: '/favicon.ico' })).toBe(false)
    expect(unstable_doesMiddlewareMatch({ config, url: '/logo.svg' })).toBe(false)
    expect(unstable_doesMiddlewareMatch({ config, url: '/foto.png' })).toBe(false)
    expect(unstable_doesMiddlewareMatch({ config, url: '/banner.webp' })).toBe(false)
  })
})

describe('proxy — usuario no autenticado', () => {
  beforeEach(() => {
    mockUpdateSession.mockResolvedValue({ ...passThrough, user: null })
  })

  it('redirige /dashboard a /login', async () => {
    const req = new NextRequest('http://localhost:3000/dashboard')
    const res = await proxy(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/login')
  })

  it('redirige /dashboard/new a /login', async () => {
    const req = new NextRequest('http://localhost:3000/dashboard/new')
    const res = await proxy(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/login')
  })

  it('permite acceso a /login', async () => {
    const req = new NextRequest('http://localhost:3000/login')
    const res = await proxy(req)
    expect(res.status).not.toBe(307)
  })

  it('permite acceso a /', async () => {
    const req = new NextRequest('http://localhost:3000/')
    const res = await proxy(req)
    expect(res.status).not.toBe(307)
  })
})

describe('proxy — usuario autenticado', () => {
  beforeEach(() => {
    mockUpdateSession.mockResolvedValue({
      ...passThrough,
      user: { id: 'user-1', email: 'test@example.com' } as any,
    })
  })

  it('redirige /login a /dashboard', async () => {
    const req = new NextRequest('http://localhost:3000/login')
    const res = await proxy(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard')
  })

  it('permite acceso a /dashboard', async () => {
    const req = new NextRequest('http://localhost:3000/dashboard')
    const res = await proxy(req)
    expect(res.status).not.toBe(307)
  })

  it('permite acceso a /', async () => {
    const req = new NextRequest('http://localhost:3000/')
    const res = await proxy(req)
    expect(res.status).not.toBe(307)
  })
})
