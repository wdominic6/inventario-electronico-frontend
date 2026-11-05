# Convenciones Técnicas de Vue 3.5, Pinia 4 y Estilo (`frontend`)

## 1. Componentes y Vistas
- Usa exclusivamente **Composition API con `<script setup>`**.
- Usa el alias `@/` para todas las importaciones internas desde `src/` (ej. `import api from '@/services/api'`).
- Las páginas completas van en `src/views/<modulo>/*View.vue` y los fragmentos reutilizables en `src/components/<modulo>/*.vue`.
- La interfaz debe ser **100% responsiva** (como exige el alcance del Plan de Proyecto, ya que no habrá app móvil nativa y los almaceneros/vendedores podrán usar tablets o teléfonos desde el navegador).

## 2. Stores con Pinia 4
- Define los stores usando la sintaxis *Setup Store* (`defineStore('nombre', () => { ... })`).
- Cada store debe exponer estados claros (`items`, `loading`, `error`, `meta`) y delegar las llamadas HTTP a su archivo correspondiente en `src/services/*.service.js`.

## 3. Alcance del Producto en la Interfaz
- El sistema es de **uso logístico e interno para la pyme electrónica** (Almacén, Ventas en mostrador y Administración).
- **No diseñes elementos de e-commerce** (carritos de compra para clientes externos, pasarelas de pago ni facturación SUNAT), pues están explícitamente excluidos en la Sección 10 del Plan de Proyecto.

## 4. Verificación de Calidad
Al terminar cualquier cambio en archivos `.vue` o `.js`, ejecuta siempre:
```powershell
docker compose -f ../infra/compose.yaml exec frontend npm run lint
docker compose -f ../infra/compose.yaml exec frontend npm run format
```
