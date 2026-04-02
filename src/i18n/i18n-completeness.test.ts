import { describe, it, expect } from 'vitest'
import en from './en.json'
import de from './de.json'

/**
 * Recursively collect all leaf-node key paths from a nested object.
 * Arrays are treated as leaf values (not recursed into).
 */
function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      keys.push(...collectKeys(value as Record<string, unknown>, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

describe('i18n completeness', () => {
  const enKeys = collectKeys(en).sort()
  const deKeys = collectKeys(de).sort()

  it('every English key exists in German', () => {
    const missingInDe = enKeys.filter((k) => !deKeys.includes(k))
    expect(missingInDe, `Missing in de.json:\n${missingInDe.join('\n')}`).toEqual([])
  })

  it('every German key exists in English', () => {
    const missingInEn = deKeys.filter((k) => !enKeys.includes(k))
    expect(missingInEn, `Missing in en.json:\n${missingInEn.join('\n')}`).toEqual([])
  })

  it('has the same number of keys', () => {
    expect(enKeys.length).toBe(deKeys.length)
  })
})
