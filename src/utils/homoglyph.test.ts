import { describe, it, expect } from 'vitest'
import { normalizeUnicode } from './normalizeUnicode'

describe('normalizeUnicode with Homoglyphs', () => {
  it('should replace basic homoglyphs', () => {
    expect(normalizeUnicode('h3ll0')).toBe('hello')
    expect(normalizeUnicode('w0rld')).toBe('world')
    expect(normalizeUnicode('p@ssword')).toBe('password')
    expect(normalizeUnicode('1nternet')).toBe('internet')
  })

  it('should replace Cyrillic homoglyphs', () => {
    expect(normalizeUnicode('аpple')).toBe('apple') // 'а' is Cyrillic
    expect(normalizeUnicode('еlеphant')).toBe('elephant') // 'е' is Cyrillic
    expect(normalizeUnicode('оrange')).toBe('orange') // 'о' is Cyrillic
  })

  it('should handle a mix of homoglyphs and regular characters', () => {
    expect(normalizeUnicode('p@y-pаl')).toBe('pay-pal')
    expect(normalizeUnicode('g00gl3')).toBe('google')
  })

  it('should handle accented and other Unicode characters', () => {
    expect(normalizeUnicode('déjà vu')).toBe('deja vu')
    expect(normalizeUnicode('naïve')).toBe('naive')
    expect(normalizeUnicode('façade')).toBe('facade')
  })

  it('should handle complex strings with multiple homoglyph types', () => {
    const complexString = 'p@sswоrd123-еxаmple' // with Cyrillic 'о', 'а', 'е'
    const expectedString = 'passwordize-example'
    expect(normalizeUnicode(complexString)).toBe(expectedString)
  })

  it('should not affect strings with no homoglyphs', () => {
    const normalString = 'hello world'
    expect(normalizeUnicode(normalString)).toBe(normalString)
  })

  it('should handle an empty string', () => {
    expect(normalizeUnicode('')).toBe('')
  })
})