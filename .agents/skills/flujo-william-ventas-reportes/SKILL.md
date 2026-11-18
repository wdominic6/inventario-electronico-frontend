---
name: flujo-william-ventas-reportes
description: >-
  Guía de implementación para Tito Monteagudo William Dominic en el frontend
  (Buscador avanzado de stock multi-sucursal en tiempo real para Ventas,
  disponibilidad cruzada por estantería, Dashboard gerencial, Alertas de
  bajo stock y Reportes de rotación/Kardex). Úsalo cuando se trabaje en
  consultas de ventas, alertas o reportes en Vue 3.
---

# Flujo de Desarrollo Frontend – William Dominic (Consultas en Ventas y Reportes/Alertas)

> Módulos reasignados desde Quispe Huaman Franklin Victor (retirado del proyecto, noviembre 2026).

Este skill guía el trabajo de **Tito Monteagudo William Dominic** en el frontend asegurando que no se modifiquen los archivos de Carlos Daniel y que se cumpla el contrato de endpoints con Anthony Junior.

## Reglas Previas
1. Verifica que **solo** registrarás rutas en `src/router/ventas-reportes.routes.js`.
2. **Nunca modifiques `src/services/api.js`** ni los archivos de `auth`, `catalogo` o `movimientos` de Carlos.
3. Revisa las rutas y parámetros de consulta en `.agents/rules/contrato-endpoints.md` (Módulos 4 y 5).

## Pasos para Implementar Consultas de Ventas o Reportes/Alertas

1. **Crear o Actualizar el Servicio (`src/services/`)**:
   - Usa exclusivamente `src/services/consultas.service.js` y `src/services/reportes.service.js`.
   - Importa `api` desde `@/services/api` y construye los query params con `URLSearchParams` (ej. `/stock/search?${params.toString()}`).

2. **Crear o Actualizar el Store en Pinia (`src/stores/`)**:
   - Usa `src/stores/consultas.store.js` o `src/stores/reportes.store.js`.
   - Permite refrescar los datos al instante (o mediante polling ligero configurable) para garantizar visibilidad de stock en tiempo real entre sucursales.

3. **Construir las Vistas y Componentes (`src/views/` y `src/components/`)**:
   - En **Consultas para Ventas (`src/views/consultas/`)**:
     - Diseña un buscador ágil por SKU, código de barras, nombre o filtros técnicos (`package_type`, `voltage`, `category_id`).
     - Muestra la matriz de disponibilidad cruzada por sucursal indicando cantidad disponible, ubicación exacta en estantería (`shelf`, `level`, `bin`) y semáforo visual (`Disponible`, `Stock Bajo`, `Agotado`).
   - En **Reportes y Alertas (`src/views/reportes/`)**:
     - Panel de alertas de desabastecimiento (`current_stock <= min_stock`) filtrable por sucursal y severidad.
     - Resumen ejecutivo (KPIs), rotación de inventario (modelo ABC) y Kardex histórico por componente.

4. **Registrar la Ruta en `src/router/ventas-reportes.routes.js`**:
   - Añade metadatos de rol (`roles: ['admin', 'ventas', 'almacen']` para consultas y `roles: ['admin']` para reportes gerenciales).

5. **Validar Linting y Formato**:
   ```powershell
   docker compose -f ../infra/compose.yaml exec frontend npm run lint
   docker compose -f ../infra/compose.yaml exec frontend npm run format
   ```
