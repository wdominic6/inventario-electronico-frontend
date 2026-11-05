# Frontend SPA – Sistema Web de Gestión Logística e Inventario de Productos Electrónicos

Repositorio `inventario-electronico-frontend` del **Grupo 6 – Ingeniería de Software 2026-II (UNA Puno)**.
Interfaz web responsiva (SPA) para el personal de Almacén, Ventas y Administración.

## Stack Tecnológico Real
- **Framework**: Vue 3.5 (Composition API con `<script setup>`).
- **Estado y Enrutamiento**: Pinia 4 (`src/stores/`) y Vue Router 5 (`src/router/`).
- **Empaquetador**: Vite 8 (con proxy `/api` hacia `http://nginx` en Docker o `http://localhost:8000` local).
- **Cliente HTTP Base**: `src/services/api.js` (usa `fetch` nativo, inyecta Bearer token desde `localStorage` y lanza `ApiError`).
- **Calidad de Código**: Oxlint + ESLint (`npm run lint`) y Prettier (`npm run format`).

## Ejecución de Comandos
A través de Docker desde `../infra` (o localmente si Node >= 22.18 / 24.12 está instalado):
```powershell
docker compose -f ../infra/compose.yaml exec frontend npm run lint
docker compose -f ../infra/compose.yaml exec frontend npm run format
docker compose -f ../infra/compose.yaml exec frontend npm run build
```

## Regla de Oro de Trabajo en Equipo (Aislamiento Estricto)
Este repositorio es desarrollado por **dos integrantes de Frontend** con fronteras estrictas de archivos (detalladas en `.agents/rules/aislamiento-equipo-frontend.md`):
1. **Vilca Carpio Carlos Daniel** (*UI/UX, Seguridad y Módulo de Almacén*):
   - Responsable del Layout general, componentes UI base, Login/Usuarios/Auditoría, CRUD de Catálogo Técnico/Sucursales/Ubicaciones y Registro de Movimientos Logísticos (Entradas, Salidas y Traslados).
   - Sus rutas van exclusivamente en `src/router/almacen.routes.js`.
2. **Quispe Huaman Franklin Victor** (*Requisitos, Módulo de Ventas y Reportes*):
   - Responsable del Módulo de Consultas en Tiempo Real para Ventas (buscador con filtros técnicos y disponibilidad cruzada entre sucursales) y del Módulo de Reportes y Alertas de Desabastecimiento (Dashboard gerencial, stock mínimo, rotación y Kardex).
   - Sus rutas van exclusivamente en `src/router/ventas-reportes.routes.js`.

> **IMPORTANTE PARA EL AGENTE**:
> 1. **Nunca modifiques `src/services/api.js`** (es el cliente HTTP compartido congelado).
> 2. Antes de crear o editar cualquier archivo, identifica si la tarea corresponde a **Carlos** o a **Franklin** y **respeta estrictamente sus carpetas asignadas** y el contrato de endpoints en `.agents/rules/contrato-endpoints.md`.
