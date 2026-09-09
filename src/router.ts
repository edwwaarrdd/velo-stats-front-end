import { createRouter, createWebHistory } from 'vue-router'
import RideListPage from './pages/RideListPage.vue'
import RideDetailPage from './pages/RideDetailPage.vue'
import InsightsPage from './pages/InsightsPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'ride-list', component: RideListPage },
    { path: '/rides/:rideId', name: 'ride-detail', component: RideDetailPage },
    { path: '/insights', name: 'insights', component: InsightsPage },
  ],
})
