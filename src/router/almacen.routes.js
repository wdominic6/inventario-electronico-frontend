// Rutas de Carlos: UI, autenticación, catálogo, usuarios y movimientos.
// Mantener src/router/index.js intacto. La seguridad real también se aplica en Laravel.
import { useAuthStore } from '@/stores/auth.store'
import { tokenStorage } from '@/services/api'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import LoginView from '@/views/auth/LoginView.vue'
import InicioView from '@/views/catalogo/InicioView.vue'
import GestionView from '@/views/catalogo/GestionView.vue'
import AlmacenView from '@/views/movimientos/AlmacenView.vue'
import MovimientoFormView from '@/views/movimientos/MovimientoFormView.vue'
import HistorialView from '@/views/movimientos/HistorialView.vue'

const all = ['admin', 'almacen', 'ventas']
const warehouse = ['admin', 'almacen']
const protect = (roles) => async () => {
  const auth = useAuthStore()
  if (!tokenStorage.get() || !(await auth.restore())) return { path: '/login' }
  if (!roles.includes(auth.user?.role)) return { path: '/sin-acceso' }
  return true
}
export default [
  { path: '/login', component: AuthLayout, children: [{ path: '', name: 'login', component: LoginView }] },
  { path: '/sin-acceso', component: { template: '<main style="padding:40px"><h1>Acceso denegado</h1><p>No tienes permiso para esta sección.</p><a href="/">Volver al inicio</a></main>' } },
  {
    path: '/', component: MainLayout, beforeEnter: protect(all), children: [
      { path: '', name: 'inicio', component: InicioView },
      { path: 'catalogo', name: 'catalogo', component: GestionView, meta: { resource: 'products' } },
      { path: 'categorias', name: 'categorias', component: GestionView, meta: { resource: 'categories' } },
      { path: 'sucursales', name: 'sucursales', component: GestionView, meta: { resource: 'branches' }, beforeEnter: protect(all) },
      { path: 'ubicaciones', name: 'ubicaciones', component: GestionView, meta: { resource: 'locations' } },
      { path: 'almacen', name: 'almacen', component: AlmacenView, beforeEnter: protect(warehouse) },
      { path: 'almacen/entradas', name: 'entradas', component: MovimientoFormView, meta: { movementType: 'entry' }, beforeEnter: protect(warehouse) },
      { path: 'almacen/salidas', name: 'salidas', component: MovimientoFormView, meta: { movementType: 'exit' }, beforeEnter: protect(warehouse) },
      { path: 'almacen/traslados', name: 'traslados', component: MovimientoFormView, meta: { movementType: 'transfer' }, beforeEnter: protect(warehouse) },
      { path: 'almacen/historial', name: 'historial', component: HistorialView, beforeEnter: protect(warehouse) },
    ]
  },
]
