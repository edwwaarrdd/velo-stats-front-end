<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet.heat'
import type { Ride } from '../../api/types'
import { useStations } from '../../composables/useStations'
import { allStationUsage, topStationFlows } from '../../lib/insights'

const props = defineProps<{ rides: Ride[] }>()

const { stations, stationByCode, loading: stationsLoading } = useStations()

const mode = ref<'heatmap' | 'flows'>('heatmap')
const mapContainer = ref<HTMLDivElement | null>(null)

let map: L.Map | null = null
let activeLayer: L.Layer | null = null
let didFitBounds = false

const ANTWERP_CENTER: [number, number] = [51.2194, 4.4025]

function clearActiveLayer() {
  if (activeLayer && map) {
    map.removeLayer(activeLayer)
    activeLayer = null
  }
}

function fitToData() {
  if (!map || didFitBounds) return

  const usage = allStationUsage(props.rides)
  const latlngs: L.LatLngExpression[] = []
  for (const u of usage) {
    const station = stationByCode.value.get(u.code)
    if (station) latlngs.push([station.lat, station.lon])
  }
  if (latlngs.length === 0) return

  map.fitBounds(L.latLngBounds(latlngs), { padding: [24, 24], maxZoom: 15 })
  didFitBounds = true
}

function renderHeatmap() {
  if (!map) return
  clearActiveLayer()

  const usage = allStationUsage(props.rides)
  const maxCount = Math.max(...usage.map((u) => u.count), 1)

  const points: Array<[number, number, number]> = []
  for (const u of usage) {
    const station = stationByCode.value.get(u.code)
    if (!station) continue
    points.push([station.lat, station.lon, u.count])
  }

  activeLayer = L.heatLayer(points, {
    radius: 26,
    blur: 20,
    minOpacity: 0.25,
    // Scale below the true max so mid-usage stations still register color, not just the single busiest station.
    max: Math.max(maxCount * 0.35, 1),
    gradient: { 0.2: '#38bdf8', 0.5: '#6366f1', 0.8: '#db2777', 1: '#dc2626' },
  }).addTo(map)
}

function renderFlows() {
  if (!map) return
  clearActiveLayer()

  const flows = topStationFlows(props.rides, 20)
  const maxCount = Math.max(...flows.map((f) => f.count), 1)

  const group = L.layerGroup()
  for (const flow of flows) {
    const origin = stationByCode.value.get(flow.originCode)
    const destination = stationByCode.value.get(flow.destinationCode)
    if (!origin || !destination) continue

    const ratio = flow.count / maxCount
    const line = L.polyline(
      [
        [origin.lat, origin.lon],
        [destination.lat, destination.lon],
      ],
      {
        color: '#0284c7',
        weight: 1.5 + ratio * 7,
        opacity: 0.35 + ratio * 0.5,
      },
    )
    line.bindTooltip(`${flow.originName} → ${flow.destinationName}: ${flow.count} rides`)
    line.addTo(group)

    L.circleMarker([destination.lat, destination.lon], {
      radius: 3,
      color: '#0284c7',
      fillColor: '#0284c7',
      fillOpacity: 0.8,
      weight: 1,
    }).addTo(group)
  }

  activeLayer = group.addTo(map)
}

function render() {
  fitToData()
  if (mode.value === 'heatmap') {
    renderHeatmap()
  } else {
    renderFlows()
  }
}

onMounted(async () => {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value).setView(ANTWERP_CENTER, 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  await nextTick()
  map.invalidateSize()
  render()
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})

watch([() => props.rides, stations, mode], render)
</script>

<template>
  <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Station map</h2>
      <div class="inline-flex overflow-hidden rounded-lg ring-1 ring-slate-200">
        <button
          type="button"
          class="px-3 py-1 text-xs font-medium"
          :class="mode === 'heatmap' ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'"
          @click="mode = 'heatmap'"
        >
          Heatmap
        </button>
        <button
          type="button"
          class="px-3 py-1 text-xs font-medium"
          :class="mode === 'flows' ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'"
          @click="mode = 'flows'"
        >
          Flow routes
        </button>
      </div>
    </div>
    <p class="mt-1 text-sm text-slate-500">
      <span v-if="mode === 'heatmap'">Where you check bikes in and out most.</span>
      <span v-else>Your most-ridden origin → destination routes.</span>
      <span v-if="stationsLoading"> Loading station coordinates…</span>
    </p>

    <div ref="mapContainer" class="mt-3 h-96 w-full rounded-lg" />
  </div>
</template>
