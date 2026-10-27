import { describe, expect, it } from 'vitest'
import { applications, categories, getApplication, populatedCategories, readStatus } from '../config/applications'

describe('application catalog', () => {
  it('contains the three launch targets with unique ids', () => {
    const ids = applications.map((a) => a.id)
    expect(ids).toEqual(expect.arrayContaining(['user-management', 'asset-management', 'tisa-assistant']))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every application references a declared category', () => {
    const known = new Set(categories.map((c) => c.id))
    for (const app of applications) expect(known.has(app.category)).toBe(true)
  })

  it('every application has the fields the UI relies on', () => {
    for (const app of applications) {
      expect(app.name).toBeTruthy()
      expect(app.summary).toBeTruthy()
      expect(app.launchLabel).toBeTruthy()
      expect(app.capabilities.length).toBeGreaterThan(0)
    }
  })

  it('looks up by slug', () => {
    expect(getApplication('asset-management')?.name).toBe('Asset Management')
    expect(getApplication('nope')).toBeUndefined()
  })

  it('only reports categories that have applications', () => {
    for (const cat of populatedCategories()) {
      expect(applications.some((a) => a.category === cat.id)).toBe(true)
    }
  })

  it('parses configured status labels and ignores anything else', () => {
    expect(readStatus('available')).toBe('available')
    expect(readStatus(' Coming-Soon ')).toBe('coming-soon')
    expect(readStatus('online')).toBeUndefined()
    expect(readStatus(undefined)).toBeUndefined()
  })
})
