import { describe, it, expect } from 'vitest'
import { toSlug } from '@/lib/slug'

describe('toSlug', () => {
  it('convierte espacios en guiones y pone en minúsculas', () => {
    expect(toSlug('Mi Proyecto')).toBe('mi-proyecto')
  })

  it('elimina acentos y diacríticos', () => {
    expect(toSlug('café')).toBe('cafe')
  })

  it('convierte mayúsculas a minúsculas', () => {
    expect(toSlug('UPPERCASE')).toBe('uppercase')
  })

  it('elimina caracteres especiales', () => {
    expect(toSlug('Hello World!')).toBe('hello-world')
  })

  it('no modifica un slug ya válido', () => {
    expect(toSlug('mi-app-v1')).toBe('mi-app-v1')
  })

  it('elimina espacios al inicio y al final', () => {
    expect(toSlug('  espacios  ')).toBe('espacios')
  })

  it('normaliza múltiples espacios consecutivos en un solo guion', () => {
    expect(toSlug('múltiples  espacios')).toBe('multiples-espacios')
  })

  it('devuelve cadena vacía para input vacío', () => {
    expect(toSlug('')).toBe('')
  })
})
