import type { Ride, Weather } from '../../api/types'

let nextId = 1

export function makeWeather(overrides: Partial<Weather> = {}): Weather {
  return {
    temperature_c: 18,
    apparent_temperature_c: 17,
    precipitation_mm: 0,
    rain_mm: 0,
    snowfall_cm: 0,
    cloud_cover_percent: 20,
    wind_speed_kmh: 10,
    wind_gusts_kmh: 15,
    wind_direction_degrees: 180,
    relative_humidity_percent: 60,
    weather_code: 1,
    observed_at: '2026-06-01T12:00:00Z',
    ...overrides,
  }
}

export function makeRide(overrides: Partial<Ride> = {}): Ride {
  const id = nextId++
  return {
    ride_id: id,
    account_id: 1,
    status: 'Completed',
    duration: 10,
    bike_number: `${1000 + id}`,
    origin_station_code: '041',
    origin_station: '041- Van Eyck',
    origin_slot_id: '1',
    checkout_time: '2026-06-01T12:00:00Z',
    destination_station_code: '173',
    destination_station: '173 - Franklin Roosevelt',
    destination_slot_id: '2',
    checkin_time: '2026-06-01T12:10:00Z',
    distance_meters: 2000,
    speed_kmh: 12,
    weather: makeWeather(),
    ...overrides,
  }
}
