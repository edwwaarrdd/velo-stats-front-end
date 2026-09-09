<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch, ref } from 'vue'
import L from 'leaflet'
import type { Ride } from '../api/types'
import { useStations } from '../composables/useStations'

const props = defineProps<{ ride: Ride }>()

const { stationByCode, loading: stationsLoading } = useStations()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let layer: L.LayerGroup | null = null

const ANTWERP_CENTER: [number, number] = [51.2194, 4.4025]

function render() {
  if (!map) return
  if (layer) {
    map.removeLayer(layer)
    layer = null
  }

  const origin = props.ride.origin_station_code ? stationByCode.value.get(props.ride.origin_station_code) : null
  const destination = props.ride.destination_station_code
    ? stationByCode.value.get(props.ride.destination_station_code)
    : null

  if (!origin) return

  const group = L.layerGroup()
  const isRoundTrip = destination && origin.station_id === destination.station_id

  L.circleMarker([origin.lat, origin.lon], {
    radius: 9,
    color: '#ffffff',
    weight: 2,
    fillColor: '#16a34a',
    fillOpacity: 1,
  })
    .bindTooltip(isRoundTrip ? `Start & end: ${origin.name}` : `Start: ${origin.name}`, { permanent: true, direction: 'top', offset: [0, -6] })
    .addTo(group)

  if (destination && !isRoundTrip) {
    L.circleMarker([destination.lat, destination.lon], {
      radius: 9,
      color: '#ffffff',
      weight: 2,
      fillColor: '#dc2626',
      fillOpacity: 1,
    })
      .bindTooltip(`End: ${destination.name}`, { permanent: true, direction: 'top', offset: [0, -6] })
      .addTo(group)

    L.polyline(
      [
        [origin.lat, origin.lon],
        [destination.lat, destination.lon],
      ],
      { color: '#0284c7', weight: 3, opacity: 0.7, dashArray: '6 8' },
    ).addTo(group)
  }

  layer = group.addTo(map)

  const points: L.LatLngExpression[] = [[origin.lat, origin.lon]]
  if (destination && !isRoundTrip) points.push([destination.lat, destination.lon])
  if (points.length > 1) {
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 })
  } else {
    map.setView(points[0], 15)
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

watch([() => props.ride, stationByCode], render)
</script>

<template>
  <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Route</h2>
    <p class="mt-1 text-sm text-slate-500">
      Straight-line route between stations.
      <span v-if="stationsLoading">Loading station coordinates…</span>
    </p>

    <div ref="mapContainer" class="mt-3 h-72 w-full rounded-lg" />
  </div>
</template>
