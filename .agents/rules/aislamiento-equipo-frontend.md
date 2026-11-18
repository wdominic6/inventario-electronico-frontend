# Aislamiento Estricto de Equipo en Frontend (Carlos vs. William)

Para garantizar que **Vilca Carpio Carlos Daniel** y **Tito Monteagudo William Dominic** trabajen en paralelo con asistencia de IA sin provocar conflictos de `git merge`, se establecen las siguientes fronteras obligatorias de archivos.

> **Cambio de equipo (noviembre 2026)**: Quispe Huaman Franklin Victor se retiró del proyecto. Su dominio (Ventas/Consultas y Reportes/Alertas) fue reasignado a **Tito Monteagudo William Dominic**.

## 1. Archivos Compartidos Congelados / Modulares
- **`src/services/api.js`**: **INMUTABLE**. Contiene `api` (`get`, `post`, `put`, `patch`, `delete`), `tokenStorage` y `ApiError`. Ningún integrante debe modificarlo; cada módulo importa `api` desde `@/services/api` en su propio archivo `*.service.js`.
- **`src/router/index.js`**: Actúa únicamente como ensamblador importando dos arreglos de rutas separados:
  ```js
  import almacenRoutes from './almacen.routes'             // Exclusivo de Carlos Daniel
  import ventasReportesRoutes from './ventas-reportes.routes' // Exclusivo de William Dominic
  ```

---

## 2. Matriz de Propiedad de Archivos en `frontend/src/`

### A. Dominio de Vilca Carpio Carlos Daniel
*(Rol: UI/UX, Seguridad y Módulo de Almacén – Semanas 7, 10, 15)*

**Archivos y carpetas permitidos para crear/modificar:**
- **Rutas**: `src/router/almacen.routes.js`
- **Layout y UI Base**: `src/layouts/*` (`MainLayout.vue`, `AuthLayout.vue`), `src/components/ui/*` (botones, modales, tablas base, badges), `src/assets/*`
- **Módulo 1 (Auth, Usuarios y Auditoría)**:
  - `src/services/auth.service.js`, `src/services/usuarios.service.js`
  - `src/stores/auth.store.js`, `src/stores/usuarios.store.js`
  - `src/views/auth/*`, `src/views/usuarios/*`
- **Módulo 2 (Catálogo Técnico, Categorías, Sucursales y Ubicaciones en Estantería)**:
  - `src/services/catalogo.service.js`
  - `src/stores/catalogo.store.js`
  - `src/views/catalogo/*`, `src/components/catalogo/*`
- **Módulo 3 (Movimientos Logísticos: Entradas, Salidas y Traslados)**:
  - `src/services/movimientos.service.js`
  - `src/stores/movimientos.store.js`
  - `src/views/movimientos/*`, `src/components/movimientos/*`

**Archivos prohibidos cuando el agente asiste a Carlos:**
- `src/router/ventas-reportes.routes.js`
- `src/services/consultas.service.js` y `src/services/reportes.service.js`
- `src/stores/consultas.store.js` y `src/stores/reportes.store.js`
- `src/views/consultas/*`, `src/components/consultas/*`, `src/views/reportes/*`, `src/components/reportes/*`

---

### B. Dominio de Tito Monteagudo William Dominic (reasignado desde Quispe Huaman Franklin Victor)
*(Rol: Requisitos, Módulo de Ventas/Consultas y Módulo de Reportes/Alertas – Semanas 6, 7, 12, 14)*

**Archivos y carpetas permitidos para crear/modificar:**
- **Rutas**: `src/router/ventas-reportes.routes.js`
- **Módulo 4 (Consultas en Tiempo Real y Disponibilidad Cruzada para Ventas)**:
  - `src/services/consultas.service.js`
  - `src/stores/consultas.store.js`
  - `src/views/consultas/*` (`BuscadorStockView.vue`, `DisponibilidadSucursalesView.vue`)
  - `src/components/consultas/*` (filtros por especificaciones técnicas: voltaje, tolerancia, encapsulado, matriz de stock por sucursal y estante)
- **Módulo 5 (Reportes Estratégicos, Dashboard Gerencial y Alertas de Bajo Stock)**:
  - `src/services/reportes.service.js`
  - `src/stores/reportes.store.js`
  - `src/views/reportes/*` (`DashboardGerencialView.vue`, `AlertasStockView.vue`, `RotacionInventarioView.vue`, `KardexProductoView.vue`)
  - `src/components/reportes/*` (tarjetas KPI, tabla de alertas de stock mínimo, gráficos de rotación y kardex)

**Archivos prohibidos cuando el agente asiste a William en el frontend:**
- `src/router/almacen.routes.js`
- `src/layouts/*` y `src/components/ui/*` (puede importarlos y usarlos, pero no modificarlos sin coordinar con Carlos)
- `src/services/auth.service.js`, `src/services/catalogo.service.js`, `src/services/movimientos.service.js`
- `src/stores/auth.store.js`, `src/stores/catalogo.store.js`, `src/stores/movimientos.store.js`
- `src/views/auth/*`, `src/views/usuarios/*`, `src/views/catalogo/*`, `src/views/movimientos/*`
