# Frontend – Sistema Web de Gestión Logística e Inventario de Productos Electrónicos

Interfaz web (SPA) del proyecto del **Grupo 6 – Ingeniería de Software 2026-II (UNA Puno)**.

**Stack:** Vue 3 · Vite · Pinia · Vue Router

Repos relacionados: `inventario-electronico-backend` (API Laravel), `inventario-electronico-infra` (Docker) y `inventario-electronico-docs` (documentación).

## Cómo ejecutarlo

### Con Docker (recomendado)
Sigue las instrucciones del repo **infra**. El frontend queda en http://localhost:5173.

### Sin Docker
```sh
npm install
npm run dev        # http://localhost:5173 (las peticiones a /api van a http://localhost:8000)
```

## Comunicación con la API
- Las peticiones a `/api/*` se redirigen al backend mediante el proxy de Vite (ver `vite.config.js`).
- El cliente HTTP está en `src/services/api.js`:
  ```js
  import api, { tokenStorage } from '@/services/api'
  const usuario = await api.get('/user')
  ```

## Scripts
| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compilación para producción |
| `npm run lint` | Oxlint + ESLint |
| `npm run format` | Prettier |

## Responsables (según el plan)
- **Vilca Carpio Carlos Daniel**: UI/UX y módulo de almacén
- **Quispe Huaman Franklin Victor**: requisitos, módulo de ventas y reportes

## Flujo de trabajo
- `main`: versión estable (solo se modifica con Pull Request).
- `develop`: integración.
- `feature/<issue>-<descripcion>`: una rama por issue. Abrir el PR hacia `develop` y enlazar el issue (`Closes #N`).
