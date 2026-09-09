import { describe, expect, it } from 'vitest'
import { formatDistance, formatDuration, formatEur, formatSpeed, weatherCodeInfo } from '../format'

describe('formatDuration', () => {
  it('returns an em dash for null', () => {
    expect(formatDuration(null)).toBe('—')
  })

  it('formats minutes under an hour as Xm', () => {
    expect(formatDuration(0)).toBe('0m')
    expect(formatDuration(45)).toBe('45m')
  })

  it('formats an hour or more as Xh MMm', () => {
    expect(formatDuration(60)).toBe('1h 00m')
    expect(formatDuration(65)).toBe('1h 05m')
    expect(formatDuration(125)).toBe('2h 05m')
  })
})

describe('formatDistance', () => {
  it('returns an em dash for null', () => {
    expect(formatDistance(null)).toBe('—')
  })

  it('formats sub-kilometer distances in meters', () => {
    expect(formatDistance(0)).toBe('0 m')
    expect(formatDistance(999)).toBe('999 m')
  })

  it('formats distances of a kilometer or more in km with two decimals', () => {
    expect(formatDistance(1000)).toBe('1.00 km')
    expect(formatDistance(2345)).toBe('2.35 km')
  })
})

describe('formatSpeed', () => {
  it('returns an em dash for null', () => {
    expect(formatSpeed(null)).toBe('—')
  })

  it('formats speed to one decimal with a km/h suffix', () => {
    expect(formatSpeed(15)).toBe('15.0 km/h')
    expect(formatSpeed(15.66)).toBe('15.7 km/h')
  })
})

describe('formatEur', () => {
  it('returns an em dash for null', () => {
    expect(formatEur(null)).toBe('—')
  })

  it('formats a positive amount as currency', () => {
    expect(formatEur(0.55)).toContain('0.55')
    expect(formatEur(0.55)).toMatch(/€/)
  })
})

describe('weatherCodeInfo', () => {
  it('returns Unknown for a null code', () => {
    expect(weatherCodeInfo(null)).toEqual({ label: 'Unknown', icon: '❔' })
  })

  it('returns Unknown for an unrecognized code', () => {
    expect(weatherCodeInfo(9999)).toEqual({ label: 'Unknown', icon: '❔' })
  })

  it('looks up a known WMO weather code', () => {
    expect(weatherCodeInfo(0)).toEqual({ label: 'Clear sky', icon: '☀️' })
    expect(weatherCodeInfo(95)).toEqual({ label: 'Thunderstorm', icon: '⛈️' })
  })
})
