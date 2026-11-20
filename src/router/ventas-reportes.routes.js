// Rutas exclusivas de Tito Monteagudo William Dominic (reasignadas desde Quispe Huaman Franklin Victor)
// Módulos: Consultas de Stock Multi-Sucursal (Ventas) y Reportes/Alertas de Desabastecimiento.
// Ver: .agents/rules/aislamiento-equipo-frontend.md

export default [
  {
    path: '/consultas/stock',
    name: 'consultas.stock',
    component: () => import('@/views/consultas/BuscadorStockView.vue'),
    meta: {
      title: 'Buscador Multicriterio de Stock',
      requiresAuth: true,
      roles: ['admin', 'ventas', 'almacen'],
    },
  },
  {
    path: '/consultas/disponibilidad/:productId?',
    name: 'consultas.disponibilidad',
    component: () => import('@/views/consultas/DisponibilidadSucursalesView.vue'),
    meta: {
      title: 'Disponibilidad Cruzada por Sucursal',
      requiresAuth: true,
      roles: ['admin', 'ventas', 'almacen'],
    },
  },
  {
    path: '/reportes/dashboard',
    name: 'reportes.dashboard',
    component: () => import('@/views/reportes/DashboardGerencialView.vue'),
    meta: {
      title: 'Dashboard Gerencial de Inventario',
      requiresAuth: true,
      roles: ['admin'],
    },
  },
  {
    path: '/reportes/alertas',
    name: 'reportes.alertas',
    component: () => import('@/views/reportes/AlertasStockView.vue'),
    meta: {
      title: 'Alertas de Bajo Stock',
      requiresAuth: true,
      roles: ['admin', 'almacen', 'ventas'],
    },
  },
  {
    path: '/reportes/rotacion',
    name: 'reportes.rotacion',
    component: () => import('@/views/reportes/RotacionInventarioView.vue'),
    meta: {
      title: 'Rotación de Inventario (Modelo ABC)',
      requiresAuth: true,
      roles: ['admin'],
    },
  },
  {
    path: '/reportes/kardex/:productId?',
    name: 'reportes.kardex',
    component: () => import('@/views/reportes/KardexProductoView.vue'),
    meta: {
      title: 'Kardex Cronológico de Producto',
      requiresAuth: true,
      roles: ['admin', 'almacen'],
    },
  },
]
