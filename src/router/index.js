
import { createRouter, createWebHistory } from 'vue-router'
import almacenRoutes from './almacen.routes'
import ventasReportesRoutes from './ventas-reportes.routes'
import { useAuthStore } from '@/stores/auth.store'
import { tokenStorage } from '@/services/api'

// Protección de las rutas de William según los roles autorizados.
async function protegerRutaEquipo(to) {
  const auth = useAuthStore()

  if (!tokenStorage.get()) {
    return '/login'
  }

  if (!auth.authenticated) {
    const sesionValida = await auth.restore()

    if (!sesionValida) {
      return '/login'
    }
  }

  const rolesPermitidos = to.meta.roles

  if (
    Array.isArray(rolesPermitidos) &&
    !rolesPermitidos.includes(auth.user?.role)
  ) {
    return '/sin-acceso'
  }

  return true
}

// Localizar el layout principal que ya utiliza Carlos.
const rutaPrincipal = almacenRoutes.find(
  (ruta) => ruta.path === '/' && Array.isArray(ruta.children)
)

if (!rutaPrincipal) {
  throw new Error('No se encontró la ruta del layout principal')
}

// Incorporar las rutas del equipo dentro del mismo layout,
// sin modificar los componentes originales de William.
rutaPrincipal.children.push(
  ...ventasReportesRoutes.map((ruta) => ({
    ...ruta,
    beforeEnter: protegerRutaEquipo,
  }))
)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: almacenRoutes,
})

export default router
