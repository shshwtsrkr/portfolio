import { describe, expect, it } from 'vitest'
import { bibtex, isFinalStatus, markAuthor, matches, venueAbbr, venueName } from './format'

describe('venueAbbr', () => {
  it('drops the year from short venue codes', () => {
    expect(venueAbbr('ICPR 2024')).toBe('ICPR')
  })
  it('keeps all-caps words whole when building initials', () => {
    expect(venueAbbr('SN Computer Science')).toBe('SNCS')
  })
  it('maps known full names to their code', () => {
    expect(venueAbbr('Engineering Applications of Artificial Intelligence')).toBe('EAAI')
    expect(venueAbbr('International Conference on Learning Representations')).toBe('ICLR')
  })
  it('keeps unknown short venues as-is and uses parenthesised codes', () => {
    expect(venueAbbr('ICDAR WML')).toBe('ICDAR WML')
    expect(venueAbbr('Some Long Symposium Name (SLSN)')).toBe('SLSN')
  })
})

describe('venueName', () => {
  it('expands known codes and strips the year', () => {
    expect(venueName('ICPR 2024')).toBe('International Conference on Pattern Recognition')
    expect(venueName('SN Computer Science')).toBe('SN Computer Science')
    expect(venueName('ICDAR WML')).toBe('ICDAR Workshop on Machine Learning')
  })
  it('leaves unknown venues intact apart from the year', () => {
    expect(venueName('Obscure Regional Workshop 2023')).toBe('Obscure Regional Workshop')
  })
})

describe('markAuthor', () => {
  it('marks the full name and initial forms only', () => {
    const parts = (a: string) => markAuthor(a, 'Shashwat Sarkar').filter(p => p.me).map(p => p.text)
    expect(parts('Ashis Datta, Shashwat Sarkar, Palash Ghosal')).toEqual(['Shashwat Sarkar'])
    expect(parts('S. Sarkar, U. Pal')).toEqual(['S. Sarkar'])
    expect(parts('Sarkar, S., Pal, U.')).toEqual(['Sarkar, S.'])
    expect(parts('Someone Else')).toEqual([])
  })
})

describe('matches', () => {
  const fields = ['DATR: Domain Agnostic Text Recognizer', 'Kunal Purkayastha, Shashwat Sarkar', 'ICPR 2024', 'ICPR', 'International Conference on Pattern Recognition', 2024, 'We benchmark recognisers on scene text.']
  it('matches any single field, case-insensitively', () => {
    expect(matches('icpr', ...fields)).toBe(true)
    expect(matches('pattern recognition', ...fields)).toBe(true)
    expect(matches('2024', ...fields)).toBe(true)
    expect(matches('sarkar', ...fields)).toBe(true)
    expect(matches('scene text', ...fields)).toBe(true)
    expect(matches('agnostic', ...fields)).toBe(true)
  })
  it('requires every query word, in any order and across fields', () => {
    expect(matches('recognizer 2024 sarkar', ...fields)).toBe(true)
    expect(matches('recognizer 2023', ...fields)).toBe(false)
  })
  it('ignores diacritics and blank queries', () => {
    expect(matches('recogniser', 'Recogníser')).toBe(true)
    expect(matches('   ', 'anything')).toBe(true)
  })
})

describe('bibtex', () => {
  it('builds a journal article with a lastnameYEARword key', () => {
    const out = bibtex({ title: 'Multimodal Exponential Moving Average', authors: 'Ashis Datta, Shashwat Sarkar', venue: 'EAAI', publication_year: 2026 })
    expect(out.startsWith('@article{datta2026multimodal,')).toBe(true)
    expect(out).toContain('author = {Ashis Datta and Shashwat Sarkar}')
    expect(out).toContain('journal = {Engineering Applications of Artificial Intelligence}')
  })
  it('uses inproceedings for conferences', () => {
    const out = bibtex({ title: 'DATR: Domain Agnostic Text Recognizer', authors: 'Kunal Purkayastha', venue: 'ICPR', publication_year: 2024 })
    expect(out.startsWith('@inproceedings{purkayastha2024datr,')).toBe(true)
    expect(out).toContain('booktitle = {International Conference on Pattern Recognition}')
  })
})

describe('isFinalStatus', () => {
  it('hides accepted and published, keeps in-progress states', () => {
    expect(isFinalStatus('Accepted')).toBe(true)
    expect(isFinalStatus('published')).toBe(true)
    expect(isFinalStatus('Under Review')).toBe(false)
  })
})
