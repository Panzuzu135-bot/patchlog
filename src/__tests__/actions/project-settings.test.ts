import { vi, describe, it, expect, beforeEach } from 'vitest'
import { updateProject, deleteProject } from '@/app/(dashboard)/dashboard/[slug]/settings/actions'

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
  const methods = ['from', 'insert', 'select', 'order', 'neq']
  methods.forEach(m => { chain[m] = vi.fn().mockReturnValue(chain) })
  // update y delete terminan la cadena con eq encadenado que es awaitable
  chain.update = vi.fn().mockReturnValue(chain)
  chain.delete = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.single = vi.fn().mockResolvedValue({ data: null, error: result.error })
  // La cadena en sí es awaitable
  chain.then = (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject)
  return chain
}

function makeFormData(data: Record<string, string>) {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => fd.set(k, v))
  return fd
}

const TEST_SLUG = 'mi-slug'

const validUpdateData = {
  name: 'Nombre Actualizado',
  description: 'Nueva descripción',
  brand_color: '#123456',
}

describe('updateProject', () => {
  beforeEach(() => vi.clearAllMocks())

  it('llama redirect("/login") cuando el usuario no está autenticado', async () => {
    // En producción, redirect() lanza internamente. Lo simulamos para que el action
    // se detenga y no intente acceder a user.id siendo null.
    mockRedirect.mockImplementationOnce(() => { throw new Error('NEXT_REDIRECT') })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as any)

    await expect(updateProject(TEST_SLUG, makeFormData(validUpdateData))).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('devuelve error cuando el nombre está vacío', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const result = await updateProject(TEST_SLUG, makeFormData({ name: '', brand_color: '#6366f1' }))

    expect(result).toEqual({ error: 'El nombre es obligatorio' })
  })

  it('devuelve error cuando Supabase falla en el update', async () => {
    const chain = makeChain({ error: { code: '42501', message: 'permission denied' } })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const result = await updateProject(TEST_SLUG, makeFormData(validUpdateData))

    expect(result).toEqual({ error: 'Error al guardar los cambios' })
  })

  it('devuelve { success: true } en caso de éxito', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const result = await updateProject(TEST_SLUG, makeFormData(validUpdateData))

    expect(result).toEqual({ success: true })
  })

  it('llama revalidatePath con la ruta de settings del proyecto en caso de éxito', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    await updateProject(TEST_SLUG, makeFormData(validUpdateData))

    expect(mockRevalidatePath).toHaveBeenCalledWith(`/dashboard/${TEST_SLUG}/settings`)
  })

  it('llama revalidatePath("/dashboard") en caso de éxito', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    await updateProject(TEST_SLUG, makeFormData(validUpdateData))

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('no incluye el slug en los datos pasados a update()', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    await updateProject(TEST_SLUG, makeFormData(validUpdateData))

    expect(chain.update).toHaveBeenCalledWith(
      expect.not.objectContaining({ slug: expect.anything() })
    )
  })

  it('guarda description como null cuando viene vacía', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    await updateProject(TEST_SLUG, makeFormData({ name: 'Nombre', description: '', brand_color: '#6366f1' }))

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ description: null })
    )
  })
})

describe('deleteProject', () => {
  beforeEach(() => vi.clearAllMocks())

  it('llama redirect("/login") cuando el usuario no está autenticado', async () => {
    // En producción, redirect() lanza internamente. Lo simulamos para que el action
    // se detenga y no intente acceder a user.id siendo null.
    mockRedirect.mockImplementationOnce(() => { throw new Error('NEXT_REDIRECT') })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as any)

    await expect(deleteProject(TEST_SLUG)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('devuelve error cuando Supabase falla en el delete', async () => {
    const chain = makeChain({ error: { code: '42501', message: 'permission denied' } })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    const result = await deleteProject(TEST_SLUG)

    expect(result).toEqual({ error: 'Error al borrar el proyecto' })
  })

  it('llama redirect("/dashboard") en caso de éxito', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    await deleteProject(TEST_SLUG)

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('llama revalidatePath("/dashboard") en caso de éxito', async () => {
    const chain = makeChain({ error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: vi.fn().mockReturnValue(chain),
    } as any)

    await deleteProject(TEST_SLUG)

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('filtra por slug y user_id al borrar (no solo por slug)', async () => {
    const chain = makeChain({ error: null })
    const mockFrom = vi.fn().mockReturnValue(chain)
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: mockFrom,
    } as any)

    await deleteProject(TEST_SLUG)

    // Verifica que delete se encadena con dos filtros eq
    expect(chain.delete).toHaveBeenCalled()
    const eqCalls = chain.eq.mock.calls
    expect(eqCalls).toContainEqual(['slug', TEST_SLUG])
    expect(eqCalls).toContainEqual(['user_id', 'user-123'])
  })
})
