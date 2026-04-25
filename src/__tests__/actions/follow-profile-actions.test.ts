import { vi, describe, it, expect, beforeEach } from 'vitest'
import { followProject, unfollowProject } from '@/app/[slug]/actions'
import { updateProfile } from '@/app/(dashboard)/settings/actions'

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

// Chain for: supabase.from('projects').select('id').eq('slug', slug).single()
function makeProjectsChain(projectData: { id: string } | null) {
  const chain: any = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.single = vi.fn().mockResolvedValue({ data: projectData, error: null })
  return chain
}

// Chain for: supabase.from('follows').insert({ ... })
function makeInsertChain(result: { data: any; error: any }) {
  return {
    insert: vi.fn().mockResolvedValue(result),
  }
}

// Chain for: supabase.from('follows').delete().eq('user_id', u).eq('project_id', p)
function makeDoubleEqDeleteChain(result: { data: any; error: any }) {
  const resolved = Promise.resolve(result)
  const innerEq = vi.fn().mockReturnValue(resolved)
  const outerEq = vi.fn().mockReturnValue({ eq: innerEq })
  const chain: any = {
    delete: vi.fn().mockReturnValue({ eq: outerEq }),
    _outerEq: outerEq,
    _innerEq: innerEq,
  }
  return chain
}

// Routes from() calls to the right chain by table name
function makeFrom(projectsChain: any, followsChain: any) {
  return vi.fn().mockImplementation((table: string) => {
    if (table === 'projects') return projectsChain
    return followsChain
  })
}

// Chain for: supabase.from('profiles').update({...}).eq('id', user.id)
function makeSingleEqUpdateChain(result: { data: any; error: any }) {
  const resolved = Promise.resolve(result)
  const eq = vi.fn().mockReturnValue(resolved)
  const chain: any = {
    update: vi.fn().mockReturnValue({ eq }),
    _eq: eq,
  }
  return chain
}

// ─── followProject ────────────────────────────────────────────────────────────

describe('followProject', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirige a /login?next=/slug si no hay usuario autenticado', async () => {
    mockRedirect.mockImplementationOnce(() => { throw new Error('NEXT_REDIRECT') })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as any)

    await expect(followProject('proj-1', 'mi-proyecto')).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login?next=/mi-proyecto')
  })

  it('devuelve error si el projectId no coincide con el slug del proyecto (IDOR)', async () => {
    const projectsChain = makeProjectsChain({ id: 'otro-proyecto-id' })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: makeFrom(projectsChain, {}),
    } as any)

    const result = await followProject('proj-1', 'mi-proyecto')

    expect(result).toEqual({ error: 'Proyecto no encontrado' })
  })

  it('devuelve error si el slug no existe en la BD (IDOR)', async () => {
    const projectsChain = makeProjectsChain(null)
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: makeFrom(projectsChain, {}),
    } as any)

    const result = await followProject('proj-1', 'mi-proyecto')

    expect(result).toEqual({ error: 'Proyecto no encontrado' })
  })

  it('no llama a insert cuando el IDOR check falla', async () => {
    const projectsChain = makeProjectsChain({ id: 'otro-id' })
    const insertChain = makeInsertChain({ data: {}, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: makeFrom(projectsChain, insertChain),
    } as any)

    await followProject('proj-1', 'mi-proyecto')

    expect(insertChain.insert).not.toHaveBeenCalled()
  })

  it('llama a insert con user_id y project_id correctos', async () => {
    const projectsChain = makeProjectsChain({ id: 'proj-1' })
    const insertChain = makeInsertChain({ data: {}, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: makeFrom(projectsChain, insertChain),
    } as any)

    await followProject('proj-1', 'mi-proyecto')

    expect(insertChain.insert).toHaveBeenCalledWith({ user_id: 'u1', project_id: 'proj-1' })
  })

  it('llama a revalidatePath con /slug tras insertar', async () => {
    const projectsChain = makeProjectsChain({ id: 'proj-1' })
    const insertChain = makeInsertChain({ data: {}, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: makeFrom(projectsChain, insertChain),
    } as any)

    await followProject('proj-1', 'mi-proyecto')

    expect(mockRevalidatePath).toHaveBeenCalledWith('/mi-proyecto')
  })

  it('no lanza error con unique constraint duplicado (código 23505)', async () => {
    const projectsChain = makeProjectsChain({ id: 'proj-1' })
    const insertChain = makeInsertChain({ data: null, error: { code: '23505', message: 'duplicate key' } })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: makeFrom(projectsChain, insertChain),
    } as any)

    // La acción no comprueba el error del insert, así que no debe lanzar
    await expect(followProject('proj-1', 'mi-proyecto')).resolves.toBeUndefined()
    // revalidatePath se llama igualmente porque el error se ignora
    expect(mockRevalidatePath).toHaveBeenCalledWith('/mi-proyecto')
  })
})

// ─── unfollowProject ──────────────────────────────────────────────────────────

describe('unfollowProject', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirige a /login?next=/slug si no hay usuario autenticado', async () => {
    mockRedirect.mockImplementationOnce(() => { throw new Error('NEXT_REDIRECT') })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as any)

    await expect(unfollowProject('proj-1', 'mi-proyecto')).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login?next=/mi-proyecto')
  })

  it('devuelve error si el projectId no coincide con el slug del proyecto (IDOR)', async () => {
    const projectsChain = makeProjectsChain({ id: 'otro-proyecto-id' })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: makeFrom(projectsChain, {}),
    } as any)

    const result = await unfollowProject('proj-1', 'mi-proyecto')

    expect(result).toEqual({ error: 'Proyecto no encontrado' })
  })

  it('devuelve error si el slug no existe en la BD (IDOR)', async () => {
    const projectsChain = makeProjectsChain(null)
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: makeFrom(projectsChain, {}),
    } as any)

    const result = await unfollowProject('proj-1', 'mi-proyecto')

    expect(result).toEqual({ error: 'Proyecto no encontrado' })
  })

  it('no llama a delete cuando el IDOR check falla', async () => {
    const projectsChain = makeProjectsChain({ id: 'otro-id' })
    const deleteChain = makeDoubleEqDeleteChain({ data: {}, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: makeFrom(projectsChain, deleteChain),
    } as any)

    await unfollowProject('proj-1', 'mi-proyecto')

    expect(deleteChain.delete).not.toHaveBeenCalled()
  })

  it('llama a delete().eq(user_id).eq(project_id) correctamente', async () => {
    const projectsChain = makeProjectsChain({ id: 'proj-1' })
    const chain = makeDoubleEqDeleteChain({ data: {}, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: makeFrom(projectsChain, chain),
    } as any)

    await unfollowProject('proj-1', 'mi-proyecto')

    expect(chain.delete).toHaveBeenCalled()
    expect(chain._outerEq).toHaveBeenCalledWith('user_id', 'u1')
    expect(chain._innerEq).toHaveBeenCalledWith('project_id', 'proj-1')
  })

  it('llama a revalidatePath con /slug tras borrar', async () => {
    const projectsChain = makeProjectsChain({ id: 'proj-1' })
    const chain = makeDoubleEqDeleteChain({ data: {}, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: makeFrom(projectsChain, chain),
    } as any)

    await unfollowProject('proj-1', 'mi-proyecto')

    expect(mockRevalidatePath).toHaveBeenCalledWith('/mi-proyecto')
  })

  it('usa la tabla follows para el delete', async () => {
    const projectsChain = makeProjectsChain({ id: 'proj-1' })
    const chain = makeDoubleEqDeleteChain({ data: {}, error: null })
    const from = makeFrom(projectsChain, chain)
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from,
    } as any)

    await unfollowProject('proj-1', 'mi-proyecto')

    expect(from).toHaveBeenCalledWith('follows')
  })
})

// ─── updateProfile ────────────────────────────────────────────────────────────

describe('updateProfile', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirige a /login si no hay usuario autenticado', async () => {
    mockRedirect.mockImplementationOnce(() => { throw new Error('NEXT_REDIRECT') })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as any)

    await expect(updateProfile(makeFormData({ full_name: 'Test' }))).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('devuelve error si full_name está vacío', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn(),
    } as any)

    const result = await updateProfile(makeFormData({ full_name: '' }))
    expect(result).toEqual({ error: 'El nombre no puede estar vacío' })
  })

  it('devuelve error si full_name es solo espacios en blanco', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn(),
    } as any)

    const result = await updateProfile(makeFormData({ full_name: '   ' }))
    expect(result).toEqual({ error: 'El nombre no puede estar vacío' })
  })

  it('llama a profiles.update con full_name trimmed y filtra por user id', async () => {
    const updateChain = makeSingleEqUpdateChain({ data: {}, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(updateChain),
    } as any)

    await updateProfile(makeFormData({ full_name: '  Marcos  ' }))

    expect(updateChain.update).toHaveBeenCalledWith({ full_name: 'Marcos' })
    expect(updateChain._eq).toHaveBeenCalledWith('id', 'u1')
  })

  it('llama a revalidatePath(/settings) en caso de éxito', async () => {
    const updateChain = makeSingleEqUpdateChain({ data: {}, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(updateChain),
    } as any)

    await updateProfile(makeFormData({ full_name: 'Marcos' }))

    expect(mockRevalidatePath).toHaveBeenCalledWith('/settings')
  })

  it('devuelve { success: true } en caso de éxito', async () => {
    const updateChain = makeSingleEqUpdateChain({ data: {}, error: null })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(updateChain),
    } as any)

    const result = await updateProfile(makeFormData({ full_name: 'Marcos' }))

    expect(result).toEqual({ success: true })
  })

  it('devuelve error si Supabase falla al actualizar', async () => {
    const updateChain = makeSingleEqUpdateChain({ data: null, error: { message: 'db error' } })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(updateChain),
    } as any)

    const result = await updateProfile(makeFormData({ full_name: 'Marcos' }))

    expect(result).toEqual({ error: 'Error al guardar los cambios' })
  })

  it('no llama a revalidatePath si Supabase falla', async () => {
    const updateChain = makeSingleEqUpdateChain({ data: null, error: { message: 'db error' } })
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(updateChain),
    } as any)

    await updateProfile(makeFormData({ full_name: 'Marcos' }))

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })
})
