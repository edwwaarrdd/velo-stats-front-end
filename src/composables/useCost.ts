import { onMounted, ref } from 'vue';
import { fetchCost } from '../api/client';
import type { RideCost } from '../api/types';

export function useCost() {
  const cost = ref<RideCost | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  onMounted(async () => {
    try {
      cost.value = await fetchCost();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load cost';
    } finally {
      loading.value = false;
    }
  });

  return { cost, loading, error };
}
