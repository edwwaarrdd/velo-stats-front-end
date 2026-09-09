import { onMounted, ref } from 'vue'
import { fetchSummary } from '../api/client'
import type { RideSummary } from '../api/types'

export function useSummary() {
  const summary = ref<RideSummary | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      summary.value = await fetchSummary()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load summary'
    } finally {
      loading.value = false
    }
  })

  return { summary, loading, error }
}
