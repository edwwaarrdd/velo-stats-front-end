import type { Ride } from '../api/types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAY_LABELS = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WINTER_MONTHS = new Set([12, 1, 2]);

export interface HeatmapCell {
  day: number;
  hour: number;
  count: number;
}

export interface CommuteSignature {
  cells: HeatmapCell[];
  maxCount: number;
  weekdayRides: number;
  weekendRides: number;
  peak: { day: number; hour: number; count: number } | null;
}

export function commuteSignature(rides: Ride[]): CommuteSignature {
  const cells: HeatmapCell[] = [];
  const countByKey = new Map<string, number>();

  for (const ride of rides) {
    const date = new Date(ride.checkout_time);
    const day = date.getDay();
    const hour = date.getHours();
    const key = `${day}-${hour}`;
    countByKey.set(key, (countByKey.get(key) ?? 0) + 1);
  }

  let maxCount = 0;
  let peak: CommuteSignature['peak'] = null;
  let weekdayRides = 0;
  let weekendRides = 0;

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const count = countByKey.get(`${day}-${hour}`) ?? 0;
      cells.push({ day, hour, count });
      if (count > maxCount) {
        maxCount = count;
        peak = { day, hour, count };
      }
      if (day === 0 || day === 6) {
        weekendRides += count;
      } else {
        weekdayRides += count;
      }
    }
  }

  return { cells, maxCount, weekdayRides, weekendRides, peak };
}

export function dayLabel(day: number): string {
  return DAY_LABELS[day];
}

export function fullDayLabel(day: number): string {
  return FULL_DAY_LABELS[day];
}

export interface StationUsage {
  code: string;
  name: string;
  count: number;
}

export function allStationUsage(rides: Ride[]): StationUsage[] {
  const usage = new Map<string, StationUsage>();

  const visit = (code: string | null, name: string | null) => {
    if (!code) return;
    const existing = usage.get(code);
    if (existing) {
      existing.count += 1;
    } else {
      usage.set(code, { code, name: name ?? code, count: 1 });
    }
  };

  for (const ride of rides) {
    visit(ride.origin_station_code, ride.origin_station);
    visit(ride.destination_station_code, ride.destination_station);
  }

  return [...usage.values()].sort((a, b) => b.count - a.count);
}

export function topStations(rides: Ride[], limit = 5): StationUsage[] {
  return allStationUsage(rides).slice(0, limit);
}

export interface StationPair {
  origin: string;
  destination: string;
  count: number;
}

export function topStationPairs(rides: Ride[], limit = 5): StationPair[] {
  const pairs = new Map<string, StationPair>();

  for (const ride of rides) {
    if (!ride.origin_station || !ride.destination_station) continue;
    const key = `${ride.origin_station}→${ride.destination_station}`;
    const existing = pairs.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      pairs.set(key, { origin: ride.origin_station, destination: ride.destination_station, count: 1 });
    }
  }

  return [...pairs.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

export interface StationFlow {
  originCode: string;
  destinationCode: string;
  originName: string;
  destinationName: string;
  count: number;
}

export function topStationFlows(rides: Ride[], limit = 15): StationFlow[] {
  const flows = new Map<string, StationFlow>();

  for (const ride of rides) {
    if (!ride.origin_station_code || !ride.destination_station_code) continue;
    if (ride.origin_station_code === ride.destination_station_code) continue;
    const key = `${ride.origin_station_code}→${ride.destination_station_code}`;
    const existing = flows.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      flows.set(key, {
        originCode: ride.origin_station_code,
        destinationCode: ride.destination_station_code,
        originName: ride.origin_station ?? ride.origin_station_code,
        destinationName: ride.destination_station ?? ride.destination_station_code,
        count: 1,
      });
    }
  }

  return [...flows.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

export interface RoundTripStats {
  count: number;
  percentage: number;
  topStations: StationUsage[];
}

export function isRoundTrip(ride: Ride): boolean {
  return ride.origin_station_code !== null && ride.origin_station_code === ride.destination_station_code;
}

export function roundTripStats(rides: Ride[]): RoundTripStats {
  const roundTrips = rides.filter(isRoundTrip);

  const usage = new Map<string, StationUsage>();
  for (const ride of roundTrips) {
    if (!ride.origin_station_code) continue;
    const existing = usage.get(ride.origin_station_code);
    if (existing) {
      existing.count += 1;
    } else {
      usage.set(ride.origin_station_code, {
        code: ride.origin_station_code,
        name: ride.origin_station ?? ride.origin_station_code,
        count: 1,
      });
    }
  }

  return {
    count: roundTrips.length,
    percentage: rides.length > 0 ? (roundTrips.length / rides.length) * 100 : 0,
    topStations: [...usage.values()].sort((a, b) => b.count - a.count).slice(0, 3),
  };
}

export interface MonthlyDistance {
  key: string;
  label: string;
  totalMeters: number;
  rideCount: number;
}

export function monthlyDistance(rides: Ride[]): MonthlyDistance[] {
  const months = new Map<string, MonthlyDistance>();

  for (const ride of rides) {
    const date = new Date(ride.checkout_time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const label = `${MONTH_LABELS[month - 1]} ${year}`;

    const existing = months.get(key);
    const meters = ride.distance_meters ?? 0;
    if (existing) {
      existing.totalMeters += meters;
      existing.rideCount += 1;
    } else {
      months.set(key, { key, label, totalMeters: meters, rideCount: 1 });
    }
  }

  return [...months.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function bestMonth(months: MonthlyDistance[]): MonthlyDistance | null {
  if (months.length === 0) return null;
  return months.reduce((best, month) => (month.totalMeters > best.totalMeters ? month : best));
}

export interface WinterStats {
  rideCount: number;
  totalMeters: number;
  totalDuration: number;
  percentageOfRides: number;
}

export function winterStats(rides: Ride[]): WinterStats {
  const winterRides = rides.filter((ride) => WINTER_MONTHS.has(new Date(ride.checkout_time).getMonth() + 1));

  return {
    rideCount: winterRides.length,
    totalMeters: winterRides.reduce((sum, ride) => sum + (ride.distance_meters ?? 0), 0),
    totalDuration: winterRides.reduce((sum, ride) => sum + (ride.duration ?? 0), 0),
    percentageOfRides: rides.length > 0 ? (winterRides.length / rides.length) * 100 : 0,
  };
}

export interface HardcoreStats {
  rainRides: number;
  coldRides: number;
  hotRides: number;
  hardcoreRides: number;
  totalWithWeather: number;
  rainPercentage: number;
  coldPercentage: number;
  hotPercentage: number;
  hardcorePercentage: number;
}

export const COLD_THRESHOLD_C = 5;
export const HOT_THRESHOLD_C = 30;

export function isRainRide(ride: Ride): boolean {
  return (ride.weather?.rain_mm ?? 0) > 0;
}

export function isColdRide(ride: Ride): boolean {
  return (ride.weather?.temperature_c ?? Infinity) < COLD_THRESHOLD_C;
}

export function isHotRide(ride: Ride): boolean {
  return (ride.weather?.temperature_c ?? -Infinity) > HOT_THRESHOLD_C;
}

export interface RideHardcoreTags {
  rain: boolean;
  cold: boolean;
  hot: boolean;
  isHardcore: boolean;
}

export function rideHardcoreTags(ride: Ride): RideHardcoreTags {
  const rain = isRainRide(ride);
  const cold = isColdRide(ride);
  const hot = isHotRide(ride);
  return { rain, cold, hot, isHardcore: rain || cold || hot };
}

export function hardcoreStats(rides: Ride[]): HardcoreStats {
  const withWeather = rides.filter((ride) => ride.weather !== null);

  const rainRides = withWeather.filter(isRainRide).length;
  const coldRides = withWeather.filter(isColdRide).length;
  const hotRides = withWeather.filter(isHotRide).length;
  const hardcoreRides = withWeather.filter(
    (ride) => isRainRide(ride) || isColdRide(ride) || isHotRide(ride),
  ).length;

  const total = withWeather.length;
  return {
    rainRides,
    coldRides,
    hotRides,
    hardcoreRides,
    totalWithWeather: total,
    rainPercentage: total > 0 ? (rainRides / total) * 100 : 0,
    coldPercentage: total > 0 ? (coldRides / total) * 100 : 0,
    hotPercentage: total > 0 ? (hotRides / total) * 100 : 0,
    hardcorePercentage: total > 0 ? (hardcoreRides / total) * 100 : 0,
  };
}

export interface ExpectedTimeComparison {
  expectedSeconds: number;
  actualSeconds: number;
  deltaSeconds: number;
  percentage: number;
  faster: boolean;
}

/** A negative delta means faster than the OSRM router expected. */
export function expectedTimeComparison(ride: Ride): ExpectedTimeComparison | null {
  const expectedSeconds = ride.expected_duration_seconds;
  const actualSeconds = ride.actual_duration_seconds;
  const deltaSeconds = ride.duration_vs_expected_seconds;

  if (expectedSeconds === null || actualSeconds === null || deltaSeconds === null) return null;
  if (expectedSeconds <= 0) return null;

  return {
    expectedSeconds,
    actualSeconds,
    deltaSeconds,
    percentage: (deltaSeconds / expectedSeconds) * 100,
    faster: deltaSeconds < 0,
  };
}

export interface ExpectedTimeStats {
  ridesCompared: number;
  fasterRides: number;
  slowerRides: number;
  fasterPercentage: number;
  averageDeltaSeconds: number;
}

export function expectedTimeStats(rides: Ride[]): ExpectedTimeStats {
  const comparisons = rides
    .map(expectedTimeComparison)
    .filter((comparison): comparison is ExpectedTimeComparison => comparison !== null);

  const fasterRides = comparisons.filter((comparison) => comparison.faster).length;
  const total = comparisons.length;

  return {
    ridesCompared: total,
    fasterRides,
    slowerRides: total - fasterRides,
    fasterPercentage: total > 0 ? (fasterRides / total) * 100 : 0,
    averageDeltaSeconds:
      total > 0 ? comparisons.reduce((sum, comparison) => sum + comparison.deltaSeconds, 0) / total : 0,
  };
}

export interface BikeUsage {
  bike: string;
  count: number;
}

export interface BikeStats {
  uniqueBikes: number;
  repeatedBikes: number;
  mostRidden: BikeUsage | null;
  topBikes: BikeUsage[];
}

export function bikeStats(rides: Ride[]): BikeStats {
  const counts = new Map<string, number>();
  for (const ride of rides) {
    if (!ride.bike_number) continue;
    counts.set(ride.bike_number, (counts.get(ride.bike_number) ?? 0) + 1);
  }

  const usages = [...counts.entries()]
    .map(([bike, count]) => ({ bike, count }))
    .sort((a, b) => b.count - a.count);

  return {
    uniqueBikes: usages.length,
    repeatedBikes: usages.filter((usage) => usage.count > 1).length,
    mostRidden: usages[0] ?? null,
    topBikes: usages.slice(0, 5),
  };
}

export interface RideBadge {
  key: string;
  label: string;
  icon: string;
}

const RIDE_BADGE_PRIORITY: Array<(ride: Ride, ctx: SuperlativeIds) => RideBadge | null> = [
  (ride, ctx) =>
    ride.ride_id === ctx.fastest ? { key: 'fastest', label: 'Fastest ride', icon: '⚡' } : null,
  (ride, ctx) =>
    ride.ride_id === ctx.slowest ? { key: 'slowest', label: 'Slowest ride', icon: '🐌' } : null,
  (ride, ctx) =>
    ride.ride_id === ctx.longest ? { key: 'longest', label: 'Longest ride', icon: '📏' } : null,
  (ride, ctx) =>
    ride.ride_id === ctx.shortest ? { key: 'shortest', label: 'Shortest ride', icon: '🤏' } : null,
  (ride) =>
    rideHardcoreTags(ride).isHardcore ? { key: 'hardcore', label: 'Hardcore ride', icon: '💪' } : null,
  (ride) => (isRoundTrip(ride) ? { key: 'round-trip', label: 'Round trip', icon: '🔄' } : null),
];

interface SuperlativeIds {
  fastest: number | null;
  slowest: number | null;
  longest: number | null;
  shortest: number | null;
}

function findExtreme(
  rides: Ride[],
  key: 'speed_kmh' | 'distance_meters',
  direction: 'max' | 'min',
): number | null {
  let bestId: number | null = null;
  let bestValue: number | null = null;

  for (const ride of rides) {
    const value = ride[key];
    if (value === null || value <= 0) continue;
    if (
      bestValue === null ||
      (direction === 'max' && value > bestValue) ||
      (direction === 'min' && value < bestValue)
    ) {
      bestValue = value;
      bestId = ride.ride_id;
    }
  }

  return bestId;
}

export function computeRideBadges(rides: Ride[]): Map<number, RideBadge> {
  const ctx: SuperlativeIds = {
    fastest: findExtreme(rides, 'speed_kmh', 'max'),
    slowest: findExtreme(rides, 'speed_kmh', 'min'),
    longest: findExtreme(rides, 'distance_meters', 'max'),
    shortest: findExtreme(rides, 'distance_meters', 'min'),
  };

  const badges = new Map<number, RideBadge>();
  for (const ride of rides) {
    for (const rule of RIDE_BADGE_PRIORITY) {
      const badge = rule(ride, ctx);
      if (badge) {
        badges.set(ride.ride_id, badge);
        break;
      }
    }
  }

  return badges;
}
