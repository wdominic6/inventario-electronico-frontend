---
name: flujo-carlos-ui-almacen
description: >-
  Guía de implementación para Vilca Carpio Carlos Daniel en el frontend
  (Layout UI/UX base, Autenticación/Usuarios, Catálogo Técnico de componentes
  electrónicos con ubicaciones en estantería y Movimientos de Almacén). Úsalo
  cuando se trabaje en UI base, login, catálogo o movimientos en Vue 3.
---

# Flujo de Desarrollo Frontend – Carlos Daniel (UI/UX, Seguridad y Almacén)

Este skill guía el trabajo de **Vilca Carpio Carlos Daniel** asegurando que no se modifiquen los archivos de William Dominic (Ventas y Reportes) y que se cumpla el contrato de endpoints con William Dominic.

## Reglas Previas
1. Verifica que **solo** registrarás rutas en `src/router/almacen.routes.js`.
2. **Nunca modifiques `src/services/api.js`** ni los archivos de `consultas` o `reportes` de William.
3. Revisa los payloads exactos en `.agents/rules/contrato-endpoints.md` (Módulos 1, 2 y 3).

## Pasos para Implementar una Funcionalidad de Almacén o Seguridad

1. **Crear o Actualizar el Servicio (`src/services/`)**:
   - Usa `auth.service.js`, `catalogo.service.js` o `movimientos.service.js`.
   - Importa `api` desde `@/services/api` (recuerda no anteponer `/api` a la ruta porque `api.js` ya lo incluye).

2. **Crear o Actualizar el Store en Pinia (`src/stores/`)**:
   - Maneja `loading`, `error` (capturando `ApiError`, especialmente `status === 422` y `status === 409` cuando no hay stock suficiente en una salida o traslado) y actualiza el estado reactivo.

3. **Construir las Vistas y Componentes (`src/views/` y `src/components/`)**:
   - En **Catálogo Técnico**: Incluye campos dinámicos o estructurados para especificaciones electrónicas (`voltage`, `resistance`, `tolerance`, `package_type`, `sku`, `barcode`) y selector de ubicación física (`shelf` estante, `level` nivel, `bin` casillero).
   - En **Movimientos Logísticos**: Diferencia visualmente Entradas (compras/recepción), Salidas (despacho) y Traslados entre sucursales (sucursal origen → sucursal destino).

4. **Registrar la Ruta en `src/router/almacen.routes.js`**:
   - Añade metadatos de autorización (`meta: { requiresAuth: true, roles: ['admin', 'almacen'] }`).

5. **Validar Linting y Formato**:
   ```powershell
   docker compose -f ../infra/compose.yaml exec frontend npm run lint
   docker compose -f ../infra/compose.yaml exec frontend npm run format
   ```
