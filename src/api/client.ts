import type { Ride, RideCost, RideSummary, Station } from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function fetchRides(): Promise<Ride[]> {
  const data = await getJson<{ results: Ride[] }>('/rides/')
  return data.results
}

export function fetchSummary(): Promise<RideSummary> {
  return getJson<RideSummary>('/rides/summary')
}

export function fetchCost(): Promise<RideCost> {
  return getJson<RideCost>('/rides/cost')
}

export async function fetchStations(): Promise<Station[]> {
  const data = await getJson<{ results: Station[] }>('/stations/')
  return data.results
}
