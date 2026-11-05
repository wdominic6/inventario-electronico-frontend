import { createRouter, createWebHistory } from 'vue-router'
import almacenRoutes from './almacen.routes'
import ventasReportesRoutes from './ventas-reportes.routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...almacenRoutes, ...ventasReportesRoutes],
})

export default router
