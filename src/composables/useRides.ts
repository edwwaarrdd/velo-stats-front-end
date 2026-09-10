import { computed, ref } from 'vue';
import { fetchRides } from '../api/client';
import type { Ride } from '../api/types';

const rides = ref<Ride[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const loaded = ref(false);

async function load(): Promise<void> {
  if (loaded.value || loading.value) return;
  loading.value = true;
  error.value = null;
  try {
    rides.value = await fetchRides();
    loaded.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load rides';
  } finally {
    loading.value = false;
  }
}

export function useRides() {
  void load();

  const rideById = computed(() => {
    const map = new Map<number, Ride>();
    for (const ride of rides.value) {
      map.set(ride.ride_id, ride);
    }
    return map;
  });

  return { rides, loading, error, rideById };
}
