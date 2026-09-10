import { computed, ref } from 'vue';
import { fetchStations } from '../api/client';
import type { Station } from '../api/types';

const stations = ref<Station[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const loaded = ref(false);

async function load(): Promise<void> {
  if (loaded.value || loading.value) return;
  loading.value = true;
  error.value = null;
  try {
    stations.value = await fetchStations();
    loaded.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load stations';
  } finally {
    loading.value = false;
  }
}

export function useStations() {
  void load();

  const stationByCode = computed(() => {
    const map = new Map<string, Station>();
    for (const station of stations.value) {
      map.set(station.station_id, station);
    }
    return map;
  });

  return { stations, loading, error, stationByCode };
}
