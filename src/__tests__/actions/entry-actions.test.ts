import { vi, describe, it, expect, beforeEach } from 'vitest'
import {
  createEntry,
  updateEntry,
  togglePublish,
  deleteEntry,
} from '@/app/(dashboard)/dashboard/[slug]/entries/actions'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const mockCreateClient = vi.mocked(createClient)
const mockRedirect = vi.mocked(redirect)
const mockRevalidatePath = vi.mocked(revalidatePath)

function makeFormData(data: Record<string, string>) {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => fd.set(k, v))
  return fd
}

// Builds a chainable Supabase select query mock (ends in .single())
function makeSelectChain(result: { data: any; error: any }) {
  const chain: any = {}
  const chainMethods = ['select', 'eq', 'neq', 'order', 'filter']
  chainMethods.forEach(m => { chain[m] = vi.fn().mockReturnValue(chain) })
  chain.single = vi.fn().mockResolvedValue(result)
  chain.insert = vi.fn().mockResolvedValue(result)
  chain.update = vi.fn().mockReturnValue(chain)
  chain.delete = vi.fn().mockReturnValue(chain)
  return chain
}

// Builds a chainable Supabase mutation mock (update/delete — awaited directly after .eq())
function makeMutationChain(result: { data: any; error: any }) {
  const resolved = Promise.resolve(result)
  const chain: any = {
    eq: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
  // .eq() is the last call before await
  chain.eq.mockReturnValue(resolved)
  chain.update.mockReturnValue(chain)
  chain.delete.mockReturnValue(chain)
  return chain
}

const VALID_ENTRY = {
  title: 'Nueva feature',
  content: 'Descripción de la feature',
  version: 'v1.0.0',
  type: 'feature',
}

// ─── createEntry ──────────────────────────────────────────────────────────────

describe('createEntry', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirige a /login si no hay usuario autenticado', async () => {
    mockRedirect.mockImplementationOnce(() => { throw new Error('NEXT_REDIRECT') })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as any)

    await expect(createEntry('mi-proyecto', makeFormData(VALID_ENTRY))).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('devuelve error si el título está vacío', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn(),
    } as any)

    const result = await createEntry('mi-proyecto', makeFormData({ ...VALID_ENTRY, title: '' }))
    expect(result).toEqual({ error: 'El título es obligatorio' })
  })

  it('devuelve error si el contenido está vacío', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn(),
    } as any)

    const result = await createEntry('mi-proyecto', makeFormData({ ...VALID_ENTRY, content: '' }))
    expect(result).toEqual({ error: 'El contenido es obligatorio' })
  })

  it('devuelve error si el proyecto no existe o no pertenece al usuario', async () => {
    const projectChain = makeSelectChain({ data: null, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(projectChain),
    } as any)

    const result = await createEntry('no-existe', makeFormData(VALID_ENTRY))
    expect(result).toEqual({ error: 'Proyecto no encontrado' })
  })

  it('devuelve error si Supabase falla al insertar', async () => {
    const projectChain = makeSelectChain({ data: { id: 'proj-1' }, error: null })
    const insertChain = makeSelectChain({ data: null, error: { message: 'db error' } })
    const mockFrom = vi.fn()
      .mockReturnValueOnce(projectChain)
      .mockReturnValueOnce(insertChain)

    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: mockFrom,
    } as any)

    const result = await createEntry('mi-proyecto', makeFormData(VALID_ENTRY))
    expect(result).toEqual({ error: 'Error al crear la entrada' })
  })

  it('revalida y redirige al proyecto en caso de éxito', async () => {
    const projectChain = makeSelectChain({ data: { id: 'proj-1' }, error: null })
    const insertChain = makeSelectChain({ data: {}, error: null })
    const mockFrom = vi.fn()
      .mockReturnValueOnce(projectChain)
      .mockReturnValueOnce(insertChain)

    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: mockFrom,
    } as any)

    await createEntry('mi-proyecto', makeFormData(VALID_ENTRY))

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/mi-proyecto')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/mi-proyecto')
  })

  it('inserta con published=true cuando el checkbox está marcado', async () => {
    const projectChain = makeSelectChain({ data: { id: 'proj-1' }, error: null })
    const insertChain = makeSelectChain({ data: {}, error: null })
    const mockFrom = vi.fn()
      .mockReturnValueOnce(projectChain)
      .mockReturnValueOnce(insertChain)

    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: mockFrom,
    } as any)

    const fd = makeFormData(VALID_ENTRY)
    fd.set('published', 'on')
    await createEntry('mi-proyecto', fd)

    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ published: true })
    )
  })

  it('inserta con published=false cuando el checkbox no está marcado', async () => {
    const projectChain = makeSelectChain({ data: { id: 'proj-1' }, error: null })
    const insertChain = makeSelectChain({ data: {}, error: null })
    const mockFrom = vi.fn()
      .mockReturnValueOnce(projectChain)
      .mockReturnValueOnce(insertChain)

    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: mockFrom,
    } as any)

    await createEntry('mi-proyecto', makeFormData(VALID_ENTRY))

    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ published: false })
    )
  })
})

// ─── updateEntry ──────────────────────────────────────────────────────────────

describe('updateEntry', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirige a /login si no hay usuario autenticado', async () => {
    mockRedirect.mockImplementationOnce(() => { throw new Error('NEXT_REDIRECT') })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as any)

    await expect(updateEntry('entry-1', 'mi-proyecto', makeFormData(VALID_ENTRY))).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('devuelve error si el título está vacío', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn(),
    } as any)

    const result = await updateEntry('entry-1', 'mi-proyecto', makeFormData({ ...VALID_ENTRY, title: '' }))
    expect(result).toEqual({ error: 'El título es obligatorio' })
  })

  it('devuelve error si el contenido está vacío', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn(),
    } as any)

    const result = await updateEntry('entry-1', 'mi-proyecto', makeFormData({ ...VALID_ENTRY, content: '' }))
    expect(result).toEqual({ error: 'El contenido es obligatorio' })
  })

  it('devuelve error si la entrada no existe', async () => {
    const entryChain = makeSelectChain({ data: null, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(entryChain),
    } as any)

    const result = await updateEntry('entry-1', 'mi-proyecto', makeFormData(VALID_ENTRY))
    expect(result).toEqual({ error: 'Entrada no encontrada' })
  })

  it('devuelve error si el usuario no es el dueño del proyecto', async () => {
    const entryChain = makeSelectChain({
      data: { id: 'entry-1', project_id: 'proj-1', projects: { user_id: 'otro-usuario' } },
      error: null,
    })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(entryChain),
    } as any)

    const result = await updateEntry('entry-1', 'mi-proyecto', makeFormData(VALID_ENTRY))
    expect(result).toEqual({ error: 'No tienes permiso para editar esta entrada' })
  })

  it('devuelve error si Supabase falla al actualizar', async () => {
    const entryChain = makeSelectChain({
      data: { id: 'entry-1', project_id: 'proj-1', projects: { user_id: 'u1' } },
      error: null,
    })
    const updateChain = makeMutationChain({ data: null, error: { message: 'db error' } })
    const mockFrom = vi.fn()
      .mockReturnValueOnce(entryChain)
      .mockReturnValueOnce(updateChain)

    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: mockFrom,
    } as any)

    const result = await updateEntry('entry-1', 'mi-proyecto', makeFormData(VALID_ENTRY))
    expect(result).toEqual({ error: 'Error al actualizar la entrada' })
  })

  it('revalida y redirige en caso de éxito', async () => {
    const entryChain = makeSelectChain({
      data: { id: 'entry-1', project_id: 'proj-1', projects: { user_id: 'u1' } },
      error: null,
    })
    const updateChain = makeMutationChain({ data: {}, error: null })
    const mockFrom = vi.fn()
      .mockReturnValueOnce(entryChain)
      .mockReturnValueOnce(updateChain)

    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: mockFrom,
    } as any)

    await updateEntry('entry-1', 'mi-proyecto', makeFormData(VALID_ENTRY))

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/mi-proyecto')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/mi-proyecto')
  })
})

// ─── togglePublish ────────────────────────────────────────────────────────────

describe('togglePublish', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirige a /login si no hay usuario autenticado', async () => {
    mockRedirect.mockImplementationOnce(() => { throw new Error('NEXT_REDIRECT') })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as any)

    await expect(togglePublish('entry-1', false, 'mi-proyecto')).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('devuelve error si la entrada no pertenece al usuario', async () => {
    const entryChain = makeSelectChain({ data: null, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(entryChain),
    } as any)

    const result = await togglePublish('entry-1', false, 'mi-proyecto')
    expect(result).toEqual({ error: 'No encontrado' })
  })

  it('devuelve error si el usuario no es el dueño de la entrada', async () => {
    const entryChain = makeSelectChain({ data: { id: 'entry-1', projects: { user_id: 'otro' } }, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(entryChain),
    } as any)

    const result = await togglePublish('entry-1', false, 'mi-proyecto')
    expect(result).toEqual({ error: 'No tienes permiso para modificar esta entrada' })
  })

  it('devuelve error si Supabase falla al actualizar', async () => {
    const entryChain = makeSelectChain({ data: { id: 'entry-1', projects: { user_id: 'u1' } }, error: null })
    const updateChain = makeMutationChain({ data: null, error: { message: 'db error' } })
    const mockFrom = vi.fn()
      .mockReturnValueOnce(entryChain)
      .mockReturnValueOnce(updateChain)

    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: mockFrom,
    } as any)

    const result = await togglePublish('entry-1', false, 'mi-proyecto')
    expect(result).toEqual({ error: 'Error al actualizar la entrada' })
  })

  it('actualiza published a true cuando estaba en false', async () => {
    const entryChain = makeSelectChain({ data: { id: 'entry-1', projects: { user_id: 'u1' } }, error: null })
    const updateChain = makeMutationChain({ data: {}, error: null })
    const mockFrom = vi.fn()
      .mockReturnValueOnce(entryChain)
      .mockReturnValueOnce(updateChain)

    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: mockFrom,
    } as any)

    await togglePublish('entry-1', false, 'mi-proyecto')

    expect(updateChain.update).toHaveBeenCalledWith({ published: true })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/mi-proyecto')
  })

  it('actualiza published a false cuando estaba en true', async () => {
    const entryChain = makeSelectChain({ data: { id: 'entry-1', projects: { user_id: 'u1' } }, error: null })
    const updateChain = makeMutationChain({ data: {}, error: null })
    const mockFrom = vi.fn()
      .mockReturnValueOnce(entryChain)
      .mockReturnValueOnce(updateChain)

    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: mockFrom,
    } as any)

    await togglePublish('entry-1', true, 'mi-proyecto')

    expect(updateChain.update).toHaveBeenCalledWith({ published: false })
  })
})

// ─── deleteEntry ──────────────────────────────────────────────────────────────

describe('deleteEntry', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirige a /login si no hay usuario autenticado', async () => {
    mockRedirect.mockImplementationOnce(() => { throw new Error('NEXT_REDIRECT') })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as any)

    await expect(deleteEntry('entry-1', 'mi-proyecto')).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('devuelve error si la entrada no pertenece al usuario', async () => {
    const entryChain = makeSelectChain({ data: null, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(entryChain),
    } as any)

    const result = await deleteEntry('entry-1', 'mi-proyecto')
    expect(result).toEqual({ error: 'No encontrado' })
  })

  it('devuelve error si el usuario no es el dueño de la entrada', async () => {
    const entryChain = makeSelectChain({ data: { id: 'entry-1', projects: { user_id: 'otro' } }, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(entryChain),
    } as any)

    const result = await deleteEntry('entry-1', 'mi-proyecto')
    expect(result).toEqual({ error: 'No tienes permiso para borrar esta entrada' })
  })

  it('devuelve error si Supabase falla al borrar', async () => {
    const entryChain = makeSelectChain({ data: { id: 'entry-1', projects: { user_id: 'u1' } }, error: null })
    const deleteChain = makeMutationChain({ data: null, error: { message: 'db error' } })
    const mockFrom = vi.fn()
      .mockReturnValueOnce(entryChain)
      .mockReturnValueOnce(deleteChain)

    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: mockFrom,
    } as any)

    const result = await deleteEntry('entry-1', 'mi-proyecto')
    expect(result).toEqual({ error: 'Error al borrar la entrada' })
  })

  it('revalida la lista del proyecto en caso de éxito', async () => {
    const entryChain = makeSelectChain({ data: { id: 'entry-1', projects: { user_id: 'u1' } }, error: null })
    const deleteChain = makeMutationChain({ data: {}, error: null })
    const mockFrom = vi.fn()
      .mockReturnValueOnce(entryChain)
      .mockReturnValueOnce(deleteChain)

    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: mockFrom,
    } as any)

    await deleteEntry('entry-1', 'mi-proyecto')

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/mi-proyecto')
  })
})
