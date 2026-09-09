export interface Weather {
  temperature_c: number | null
  apparent_temperature_c: number | null
  precipitation_mm: number | null
  rain_mm: number | null
  snowfall_cm: number | null
  cloud_cover_percent: number | null
  wind_speed_kmh: number | null
  wind_gusts_kmh: number | null
  wind_direction_degrees: number | null
  relative_humidity_percent: number | null
  weather_code: number | null
  observed_at: string | null
}

export interface Ride {
  ride_id: number
  account_id: number
  status: string
  duration: number | null
  bike_number: string | null
  origin_station_code: string | null
  origin_station: string | null
  origin_slot_id: string | null
  checkout_time: string
  destination_station_code: string | null
  destination_station: string | null
  destination_slot_id: string | null
  checkin_time: string | null
  distance_meters: number | null
  speed_kmh: number | null
  weather: Weather | null
}

export interface RideSummary {
  total_rides: number
  total_duration: number | null
  average_duration: number | null
  longest_ride_duration: number | null
  shortest_ride_duration: number | null
  total_distance_meters: number | null
  average_distance_meters: number | null
}

export interface RideCost {
  total_rides: number
  first_ride_date: string | null
  last_ride_date: string | null
  date_range_days: number | null
  subscription_price_eur: number
  prorated_subscription_price_eur: number | null
  cost_per_ride_eur: number | null
  day_pass_equivalent_eur: number | null
  week_pass_equivalent_eur: number | null
  money_saved_vs_day_passes_eur: number | null
  money_saved_vs_week_passes_eur: number | null
}
