import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createProject } from '@/app/(dashboard)/dashboard/new/actions'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const mockCreateClient = vi.mocked(createClient)
const mockRedirect = vi.mocked(redirect)
const mockRevalidatePath = vi.mocked(revalidatePath)

function makeChain(result: { error: any }) {
  const chain: any = {}
  const methods = ['from', 'update', 'delete', 'eq', 'neq', 'order', 'select']
  methods.forEach(m => { chain[m] = vi.fn().mockReturnValue(chain) })
  chain.insert = vi.fn().mockResolvedValue(result)
  chain.single = vi.fn().mockResolvedValue({ data: null, error: result.error })
  chain.then = (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject)
  return chain
}

function makeFormData(data: Record<string, string>) {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => fd.set(k, v))
  return fd
}

const validFormData = {
  name: 'Mi Proyecto',
  slug: 'mi-proyecto',
  description: 'Una descripción',
  brand_color: '#ff0000',
}

describe('createProject', () => {
  beforeEach(() => vi.clearAllMocks())

  it('llama redirect("/login") cuando el usuario no está autenticado', async () => {
    // En producción, redirect() lanza internamente. Lo simulamos para que el action
    // se detenga y no intente acceder a user.id siendo null.
    mockRedirect.mockImplementationOnce(() => { throw new Error('NEXT_REDIRECT') })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as any)

    await expect(createProject({}, makeFormData(validFormData))).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('devuelve error cuando el nombre está vacío', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const result = await createProject({}, makeFormData({ name: '', slug: 'mi-slug', brand_color: '#6366f1' }))

    expect(result).toEqual({ error: 'Nombre y slug son obligatorios' })
  })

  it('devuelve error cuando el slug está vacío', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const result = await createProject({}, makeFormData({ name: 'Mi Proyecto', slug: '', brand_color: '#6366f1' }))

    expect(result).toEqual({ error: 'Nombre y slug son obligatorios' })
  })

  it('devuelve error de formato cuando el slug tiene mayúsculas', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const result = await createProject({}, makeFormData({ name: 'Mi Proyecto', slug: 'MiSlug', brand_color: '#6366f1' }))

    expect(result).toEqual({ error: 'El slug solo puede contener letras minúsculas, números y guiones' })
  })

  it('devuelve error de formato cuando el slug tiene espacios', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const result = await createProject({}, makeFormData({ name: 'Mi Proyecto', slug: 'mi slug', brand_color: '#6366f1' }))

    expect(result).toEqual({ error: 'El slug solo puede contener letras minúsculas, números y guiones' })
  })

  it('devuelve error de formato cuando el slug tiene caracteres especiales', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const result = await createProject({}, makeFormData({ name: 'Mi Proyecto', slug: 'mi@slug!', brand_color: '#6366f1' }))

    expect(result).toEqual({ error: 'El slug solo puede contener letras minúsculas, números y guiones' })
  })

  it('devuelve error de slug duplicado cuando Supabase devuelve código 23505', async () => {
    const chain = makeChain({ error: { code: '23505', message: 'duplicate key' } })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const result = await createProject({}, makeFormData(validFormData))

    expect(result).toEqual({ error: 'Este slug ya está en uso. Elige otro.' })
  })

  it('devuelve error genérico cuando Supabase devuelve un error desconocido', async () => {
    const chain = makeChain({ error: { code: '42501', message: 'permission denied' } })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const result = await createProject({}, makeFormData(validFormData))

    expect(result).toEqual({ error: 'Error al crear el proyecto. Inténtalo de nuevo.' })
  })

  it('llama revalidatePath("/dashboard") en caso de éxito', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    await createProject({}, makeFormData(validFormData))

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('llama redirect con la ruta del proyecto en caso de éxito', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    await createProject({}, makeFormData(validFormData))

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/mi-proyecto')
  })

  it('llama insert con los datos correctos', async () => {
    const chain = makeChain({ error: null })
    const mockFrom = vi.fn().mockReturnValue(chain)
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: mockFrom,
    } as any)

    await createProject({}, makeFormData(validFormData))

    expect(mockFrom).toHaveBeenCalledWith('projects')
    expect(chain.insert).toHaveBeenCalledWith({
      name: 'Mi Proyecto',
      slug: 'mi-proyecto',
      description: 'Una descripción',
      brand_color: '#ff0000',
      user_id: 'user-123',
    })
  })

  it('usa #6366f1 como brand_color por defecto cuando no se pasa', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const fd = makeFormData({ name: 'Mi Proyecto', slug: 'mi-proyecto' })
    await createProject({}, fd)

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ brand_color: '#6366f1' })
    )
  })

  it('devuelve error cuando brand_color contiene una inyección CSS', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const result = await createProject({}, makeFormData({
      name: 'Mi Proyecto',
      slug: 'mi-proyecto',
      brand_color: 'url(https://evil.com/track)',
    }))

    expect(result).toEqual({ error: 'Color de marca inválido' })
  })

  it('devuelve error cuando brand_color es un nombre de color CSS (no hex)', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const result = await createProject({}, makeFormData({
      name: 'Mi Proyecto',
      slug: 'mi-proyecto',
      brand_color: 'red',
    }))

    expect(result).toEqual({ error: 'Color de marca inválido' })
  })

  it('no llama a insert cuando brand_color es inválido', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    await createProject({}, makeFormData({
      name: 'Mi Proyecto',
      slug: 'mi-proyecto',
      brand_color: 'javascript:alert(1)',
    }))

    expect(chain.insert).not.toHaveBeenCalled()
  })

  it('acepta un color hex de 3 dígitos como brand_color válido', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    await createProject({}, makeFormData({
      name: 'Mi Proyecto',
      slug: 'mi-proyecto',
      brand_color: '#fff',
    }))

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ brand_color: '#fff' })
    )
  })
})
