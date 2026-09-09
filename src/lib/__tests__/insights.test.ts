import { describe, expect, it } from 'vitest'
import {
  allStationUsage,
  bestMonth,
  bikeStats,
  commuteSignature,
  computeRideBadges,
  expectedTimeComparison,
  expectedTimeStats,
  hardcoreStats,
  isColdRide,
  isHotRide,
  isRainRide,
  isRoundTrip,
  monthlyDistance,
  rideHardcoreTags,
  roundTripStats,
  topStationFlows,
  topStationPairs,
  topStations,
  winterStats,
} from '../insights'
import { makeRide, makeWeather } from './testFixtures'

describe('commuteSignature', () => {
  it('buckets rides by day-of-week and hour, and finds the busiest slot', () => {
    // 2026-06-02 is a Tuesday; 08:15 UTC.
    const tuesdayMorning = makeRide({ checkout_time: '2026-06-02T08:15:00Z' })
    const anotherTuesdayMorning = makeRide({ checkout_time: '2026-06-09T08:40:00Z' })
    const saturdayAfternoon = makeRide({ checkout_time: '2026-06-06T15:00:00Z' })

    const signature = commuteSignature([tuesdayMorning, anotherTuesdayMorning, saturdayAfternoon])

    expect(signature.peak).toEqual({ day: 2, hour: 8, count: 2 })
    expect(signature.weekdayRides).toBe(2)
    expect(signature.weekendRides).toBe(1)
    expect(signature.cells).toHaveLength(7 * 24)
  })

  it('returns a null peak and zero counts for no rides', () => {
    const signature = commuteSignature([])
    expect(signature.peak).toBeNull()
    expect(signature.maxCount).toBe(0)
    expect(signature.weekdayRides).toBe(0)
    expect(signature.weekendRides).toBe(0)
  })
})

describe('allStationUsage / topStations', () => {
  it('counts both origin and destination visits per station, sorted descending', () => {
    const rides = [
      makeRide({ origin_station_code: '041', origin_station: 'Van Eyck', destination_station_code: '173', destination_station: 'Roosevelt' }),
      makeRide({ origin_station_code: '173', origin_station: 'Roosevelt', destination_station_code: '041', destination_station: 'Van Eyck' }),
      makeRide({ origin_station_code: '041', origin_station: 'Van Eyck', destination_station_code: '003', destination_station: 'Centraal' }),
    ]

    const usage = allStationUsage(rides)

    expect(usage[0]).toEqual({ code: '041', name: 'Van Eyck', count: 3 })
    expect(usage.find((u) => u.code === '173')?.count).toBe(2)
    expect(usage.find((u) => u.code === '003')?.count).toBe(1)
  })

  it('ignores rides with no station code', () => {
    const rides = [makeRide({ origin_station_code: null, destination_station_code: null })]
    expect(allStationUsage(rides)).toEqual([])
  })

  it('topStations limits results', () => {
    const rides = [
      makeRide({ origin_station_code: 'A', destination_station_code: 'B' }),
      makeRide({ origin_station_code: 'A', destination_station_code: 'C' }),
      makeRide({ origin_station_code: 'A', destination_station_code: 'D' }),
    ]
    expect(topStations(rides, 2)).toHaveLength(2)
  })
})

describe('topStationPairs', () => {
  it('counts repeated origin/destination name pairs', () => {
    const rides = [
      makeRide({ origin_station: 'A', destination_station: 'B' }),
      makeRide({ origin_station: 'A', destination_station: 'B' }),
      makeRide({ origin_station: 'B', destination_station: 'A' }),
    ]

    const pairs = topStationPairs(rides)

    expect(pairs[0]).toEqual({ origin: 'A', destination: 'B', count: 2 })
    expect(pairs[1]).toEqual({ origin: 'B', destination: 'A', count: 1 })
  })
})

describe('topStationFlows', () => {
  it('excludes round trips and counts by station code', () => {
    const rides = [
      makeRide({ origin_station_code: 'A', destination_station_code: 'B' }),
      makeRide({ origin_station_code: 'A', destination_station_code: 'B' }),
      makeRide({ origin_station_code: 'A', destination_station_code: 'A' }),
    ]

    const flows = topStationFlows(rides)

    expect(flows).toHaveLength(1)
    expect(flows[0]).toMatchObject({ originCode: 'A', destinationCode: 'B', count: 2 })
  })
})

describe('isRoundTrip / roundTripStats', () => {
  it('identifies a ride as a round trip only when origin and destination codes match and are non-null', () => {
    expect(isRoundTrip(makeRide({ origin_station_code: '041', destination_station_code: '041' }))).toBe(true)
    expect(isRoundTrip(makeRide({ origin_station_code: '041', destination_station_code: '173' }))).toBe(false)
    expect(isRoundTrip(makeRide({ origin_station_code: null, destination_station_code: null }))).toBe(false)
  })

  it('computes count, percentage, and top round-trip stations', () => {
    const rides = [
      makeRide({ origin_station_code: '041', origin_station: 'Van Eyck', destination_station_code: '041' }),
      makeRide({ origin_station_code: '041', origin_station: 'Van Eyck', destination_station_code: '041' }),
      makeRide({ origin_station_code: '173', destination_station_code: '041' }),
    ]

    const stats = roundTripStats(rides)

    expect(stats.count).toBe(2)
    expect(stats.percentage).toBeCloseTo((2 / 3) * 100)
    expect(stats.topStations[0]).toEqual({ code: '041', name: 'Van Eyck', count: 2 })
  })

  it('returns zero percentage for an empty ride list', () => {
    expect(roundTripStats([]).percentage).toBe(0)
  })
})

describe('monthlyDistance / bestMonth', () => {
  it('aggregates distance and ride count per calendar month', () => {
    const rides = [
      makeRide({ checkout_time: '2026-01-05T10:00:00Z', distance_meters: 1000 }),
      makeRide({ checkout_time: '2026-01-20T10:00:00Z', distance_meters: 500 }),
      makeRide({ checkout_time: '2026-02-01T10:00:00Z', distance_meters: 4000 }),
    ]

    const months = monthlyDistance(rides)

    expect(months).toEqual([
      { key: '2026-01', label: 'Jan 2026', totalMeters: 1500, rideCount: 2 },
      { key: '2026-02', label: 'Feb 2026', totalMeters: 4000, rideCount: 1 },
    ])
    expect(bestMonth(months)).toEqual(months[1])
  })

  it('treats a null distance as zero', () => {
    const rides = [makeRide({ checkout_time: '2026-03-01T10:00:00Z', distance_meters: null })]
    expect(monthlyDistance(rides)[0].totalMeters).toBe(0)
  })

  it('returns null best month for an empty list', () => {
    expect(bestMonth([])).toBeNull()
  })
})

describe('winterStats', () => {
  it('only counts December, January, and February rides as winter', () => {
    const rides = [
      makeRide({ checkout_time: '2026-12-15T10:00:00Z', distance_meters: 1000, duration: 10 }),
      makeRide({ checkout_time: '2026-01-15T10:00:00Z', distance_meters: 2000, duration: 20 }),
      makeRide({ checkout_time: '2026-06-15T10:00:00Z', distance_meters: 5000, duration: 50 }),
    ]

    const stats = winterStats(rides)

    expect(stats.rideCount).toBe(2)
    expect(stats.totalMeters).toBe(3000)
    expect(stats.totalDuration).toBe(30)
    expect(stats.percentageOfRides).toBeCloseTo((2 / 3) * 100)
  })
})

describe('hardcore ride detection', () => {
  it('flags rain, cold, and hot rides independently', () => {
    expect(isRainRide(makeRide({ weather: makeWeather({ rain_mm: 0.5 }) }))).toBe(true)
    expect(isRainRide(makeRide({ weather: makeWeather({ rain_mm: 0 }) }))).toBe(false)

    expect(isColdRide(makeRide({ weather: makeWeather({ temperature_c: 4.9 }) }))).toBe(true)
    expect(isColdRide(makeRide({ weather: makeWeather({ temperature_c: 5 }) }))).toBe(false)

    expect(isHotRide(makeRide({ weather: makeWeather({ temperature_c: 30.1 }) }))).toBe(true)
    expect(isHotRide(makeRide({ weather: makeWeather({ temperature_c: 30 }) }))).toBe(false)
  })

  it('treats a ride with no weather data as neither cold nor hot nor rainy', () => {
    const ride = makeRide({ weather: null })
    expect(rideHardcoreTags(ride)).toEqual({ rain: false, cold: false, hot: false, isHardcore: false })
  })

  it('combines rain, cold, and hot into a single isHardcore flag', () => {
    expect(rideHardcoreTags(makeRide({ weather: makeWeather({ rain_mm: 1 }) })).isHardcore).toBe(true)
    expect(rideHardcoreTags(makeRide({ weather: makeWeather({ temperature_c: 2 }) })).isHardcore).toBe(true)
    expect(rideHardcoreTags(makeRide({ weather: makeWeather({ temperature_c: 35 }) })).isHardcore).toBe(true)
    expect(rideHardcoreTags(makeRide({ weather: makeWeather({ temperature_c: 18, rain_mm: 0 }) })).isHardcore).toBe(false)
  })

  it('aggregates hardcore stats only over rides with weather data', () => {
    const rides = [
      makeRide({ weather: makeWeather({ rain_mm: 1, temperature_c: 18 }) }),
      makeRide({ weather: makeWeather({ temperature_c: 2, rain_mm: 0 }) }),
      makeRide({ weather: makeWeather({ temperature_c: 35, rain_mm: 0 }) }),
      makeRide({ weather: makeWeather({ temperature_c: 18, rain_mm: 0 }) }),
      makeRide({ weather: null }),
    ]

    const stats = hardcoreStats(rides)

    expect(stats.totalWithWeather).toBe(4)
    expect(stats.rainRides).toBe(1)
    expect(stats.coldRides).toBe(1)
    expect(stats.hotRides).toBe(1)
    expect(stats.hardcoreRides).toBe(3)
    expect(stats.hardcorePercentage).toBeCloseTo((3 / 4) * 100)
  })
})

describe('bikeStats', () => {
  it('counts unique bikes and finds the most-ridden one', () => {
    const rides = [
      makeRide({ bike_number: '100' }),
      makeRide({ bike_number: '100' }),
      makeRide({ bike_number: '200' }),
      makeRide({ bike_number: null }),
    ]

    const stats = bikeStats(rides)

    expect(stats.uniqueBikes).toBe(2)
    expect(stats.repeatedBikes).toBe(1)
    expect(stats.mostRidden).toEqual({ bike: '100', count: 2 })
  })

  it('returns a null mostRidden for no bikes', () => {
    expect(bikeStats([]).mostRidden).toBeNull()
  })
})

describe('computeRideBadges', () => {
  it('tags the fastest, slowest, longest, and shortest rides', () => {
    const fastRide = makeRide({ speed_kmh: 30, distance_meters: 2000 })
    const slowRide = makeRide({ speed_kmh: 3, distance_meters: 2000 })
    const longRide = makeRide({ speed_kmh: 15, distance_meters: 9000 })
    const shortRide = makeRide({ speed_kmh: 15, distance_meters: 200 })

    const badges = computeRideBadges([fastRide, slowRide, longRide, shortRide])

    expect(badges.get(fastRide.ride_id)?.key).toBe('fastest')
    expect(badges.get(slowRide.ride_id)?.key).toBe('slowest')
    expect(badges.get(longRide.ride_id)?.key).toBe('longest')
    expect(badges.get(shortRide.ride_id)?.key).toBe('shortest')
  })

  it('ignores zero or null speed/distance when picking extremes', () => {
    const zeroSpeedRide = makeRide({ speed_kmh: 0, distance_meters: 0 })
    const normalRide = makeRide({ speed_kmh: 10, distance_meters: 1000 })

    const badges = computeRideBadges([zeroSpeedRide, normalRide])

    expect(badges.get(zeroSpeedRide.ride_id)).toBeUndefined()
    expect(badges.get(normalRide.ride_id)?.key).toBe('fastest')
  })

  it('prioritizes superlatives over hardcore and round-trip tags', () => {
    const fastAndHardcore = makeRide({
      speed_kmh: 30,
      distance_meters: 2000,
      weather: makeWeather({ rain_mm: 5 }),
    })
    const other = makeRide({ speed_kmh: 10, distance_meters: 1000 })

    const badges = computeRideBadges([fastAndHardcore, other])

    expect(badges.get(fastAndHardcore.ride_id)?.key).toBe('fastest')
  })

  it('falls back to hardcore, then round-trip, when no superlative applies', () => {
    // Sentinel rides own the actual speed/distance extremes so the three
    // rides under test all sit in the middle and never qualify as superlatives.
    const fastestSentinel = makeRide({ speed_kmh: 100, distance_meters: 1000 })
    const slowestSentinel = makeRide({ speed_kmh: 1, distance_meters: 1000 })
    const longestSentinel = makeRide({ speed_kmh: 10, distance_meters: 100000 })
    const shortestSentinel = makeRide({ speed_kmh: 10, distance_meters: 1 })

    const hardcoreRide = makeRide({
      speed_kmh: 10,
      distance_meters: 1000,
      weather: makeWeather({ rain_mm: 5 }),
    })
    const roundTripRide = makeRide({
      speed_kmh: 10,
      distance_meters: 1000,
      origin_station_code: '041',
      destination_station_code: '041',
      weather: makeWeather({ rain_mm: 0, temperature_c: 18 }),
    })
    const plainRide = makeRide({
      speed_kmh: 10,
      distance_meters: 1000,
      weather: makeWeather({ rain_mm: 0, temperature_c: 18 }),
    })

    const badges = computeRideBadges([
      fastestSentinel,
      slowestSentinel,
      longestSentinel,
      shortestSentinel,
      hardcoreRide,
      roundTripRide,
      plainRide,
    ])

    expect(badges.get(hardcoreRide.ride_id)?.key).toBe('hardcore')
    expect(badges.get(roundTripRide.ride_id)?.key).toBe('round-trip')
    expect(badges.get(plainRide.ride_id)).toBeUndefined()
  })
})

describe('expectedTimeComparison', () => {
  it('reports a ride that beat the expected time as faster', () => {
    const comparison = expectedTimeComparison(
      makeRide({
        expected_duration_seconds: 400,
        actual_duration_seconds: 300,
        duration_vs_expected_seconds: -100,
      }),
    )

    expect(comparison).not.toBeNull()
    expect(comparison!.faster).toBe(true)
    expect(comparison!.deltaSeconds).toBe(-100)
    expect(comparison!.percentage).toBeCloseTo(-25)
  })

  it('reports a ride that took longer as slower', () => {
    const comparison = expectedTimeComparison(
      makeRide({
        expected_duration_seconds: 400,
        actual_duration_seconds: 500,
        duration_vs_expected_seconds: 100,
      }),
    )

    expect(comparison!.faster).toBe(false)
    expect(comparison!.percentage).toBeCloseTo(25)
  })

  it('returns null when no route is cached for the ride', () => {
    const comparison = expectedTimeComparison(
      makeRide({
        expected_duration_seconds: null,
        actual_duration_seconds: 300,
        duration_vs_expected_seconds: null,
      }),
    )

    expect(comparison).toBeNull()
  })

  it('returns null when the expected time is zero, to avoid dividing by it', () => {
    const comparison = expectedTimeComparison(
      makeRide({
        expected_duration_seconds: 0,
        actual_duration_seconds: 300,
        duration_vs_expected_seconds: 300,
      }),
    )

    expect(comparison).toBeNull()
  })
})

describe('expectedTimeStats', () => {
  it('counts faster and slower rides and averages the delta', () => {
    const stats = expectedTimeStats([
      makeRide({
        expected_duration_seconds: 400,
        actual_duration_seconds: 300,
        duration_vs_expected_seconds: -100,
      }),
      makeRide({
        expected_duration_seconds: 400,
        actual_duration_seconds: 700,
        duration_vs_expected_seconds: 300,
      }),
      makeRide({
        expected_duration_seconds: null,
        actual_duration_seconds: 300,
        duration_vs_expected_seconds: null,
      }),
    ])

    expect(stats.ridesCompared).toBe(2)
    expect(stats.fasterRides).toBe(1)
    expect(stats.slowerRides).toBe(1)
    expect(stats.fasterPercentage).toBe(50)
    expect(stats.averageDeltaSeconds).toBe(100)
  })

  it('returns zeroed stats when nothing can be compared', () => {
    const stats = expectedTimeStats([])

    expect(stats.ridesCompared).toBe(0)
    expect(stats.fasterPercentage).toBe(0)
    expect(stats.averageDeltaSeconds).toBe(0)
  })
})
