# Contrato Estricto de Endpoints para Frontend (`src/services/*.service.js`)

Todos los servicios del Frontend deben consumir exactamente las rutas expuestas por el Backend de **William** y **Anthony** a través del cliente `api` en `@/services/api`.
**Importante**: Como `BASE_URL` en `src/services/api.js` ya es `'/api'`, las rutas pasadas a `api.get(path)` **NO deben repetir `/api` al inicio** (ejemplo: usar `api.get('/products')` para llamar a `GET /api/products`).

---

## 1. Servicios de Carlos Daniel (UI/UX, Seguridad y Almacén)

### A. `src/services/auth.service.js` y `src/services/usuarios.service.js` (Conecta con William)
- `api.post('/auth/login', { email, password })` → Recibe `{ data: { token, user } }` y guarda el token con `tokenStorage.set(res.data.token)`.
- `api.post('/auth/logout')` → Limpia el token con `tokenStorage.clear()`.
- `api.get('/auth/me')` → Obtiene `{ data: { id, name, email, role, branch_id, branch } }`.
- `api.get('/users?...')`, `api.post('/users', payload)`, `api.put(\`/users/\${id}\`, payload)` → Gestión de usuarios (`admin`).
- `api.get('/audit-logs?...')` → Historial de auditoría (`admin`).

### B. `src/services/catalogo.service.js` (Conecta con William)
- **Sucursales**: `api.get('/branches')`, `api.post('/branches', body)`, `api.put(\`/branches/\${id}\`, body)`, `api.delete(\`/branches/\${id}\`)`.
- **Categorías**: `api.get('/categories')`, `api.post('/categories', body)`, `api.put(\`/categories/\${id}\`, body)`, `api.delete(\`/categories/\${id}\`)`.
- **Ubicaciones en estantería**: `api.get(\`/locations?branch_id=\${branchId}\`)`, `api.post('/locations', body)`, `api.put(\`/locations/\${id}\`, body)`, `api.delete(\`/locations/\${id}\`)`.
- **Productos electrónicos**:
  - `api.get('/products?q=...&category_id=...&page=...')`
  - `api.get(\`/products/\${id}\`)`
  - `api.post('/products', body)` y `api.put(\`/products/\${id}\`, body)` con estructura:
    ```json
    {
      "sku": "RES-SMD-10K",
      "barcode": "775000000101",
      "name": "Resistencia SMD 10k Ohm 1/4W",
      "category_id": 1,
      "brand": "Yageo",
      "model": "RC0805FR-0710KL",
      "unit": "UND",
      "min_stock": 100,
      "unit_cost": 0.05,
      "unit_price": 0.20,
      "specs": {
        "resistance": "10kΩ",
        "tolerance": "±1%",
        "power": "0.125W",
        "package_type": "SMD 0805",
        "voltage": "150V"
      },
      "is_active": true
    }
    ```

### C. `src/services/movimientos.service.js` (Conecta con William)
- `api.get('/movements?branch_id=...&type=...&date_from=...&date_to=...')`
- `api.get(\`/movements/\${id}\`)`
- `api.post('/movements/entry', { branch_id, reference_code, supplier_name, notes, items: [{ product_id, location_id, quantity, unit_cost }] })`
- `api.post('/movements/exit', { branch_id, reference_code, reason, notes, items: [{ product_id, location_id, quantity }] })`
- `api.post('/movements/transfer', { source_branch_id, target_branch_id, reference_code, notes, items: [{ product_id, source_location_id, target_location_id, quantity }] })`

---

## 2. Servicios de Franklin Victor (Consultas en Ventas y Reportes/Alertas)

### A. `src/services/consultas.service.js` (Conecta con Anthony)
- `api.get('/stock/search?q=...&category_id=...&branch_id=...&package_type=...&voltage=...&only_available=...')`
  - Buscador rápido para personal de Ventas con filtros por especificaciones técnicas de componentes electrónicos.
- `api.get(\`/stock/availability/\${productId}\`)`
  - Obtiene la matriz de disponibilidad cruzada en todas las sucursales y ubicaciones físicas (`shelf`, `level`, `bin`) con semáforo de stock (`ok`, `low_stock`, `out_of_stock`).
- `api.get(\`/stock/by-branch/\${branchId}?q=...&category_id=...\`)`
  - Inventario detallado de una sucursal específica.

### B. `src/services/reportes.service.js` (Conecta con Anthony)
- `api.get('/alerts/low-stock?branch_id=...&severity=...')`
  - Lista de componentes electrónicos que alcanzaron o bajaron de su `min_stock` (stock de seguridad).
- `api.get('/reports/dashboard-summary')`
  - Indicadores clave (KPIs) para gerencia/administradores.
- `api.get('/reports/rotation?date_from=...&date_to=...&branch_id=...')`
  - Reporte de rotación de inventario y clasificación ABC.
- `api.get(\`/reports/kardex/\${productId}?branch_id=...&date_from=...&date_to=...\`)`
  - Historial cronológico de entradas, salidas, traslados y saldo de un componente.

---

## 3. Manejo de Errores con `ApiError`
Cuando el Backend devuelve errores de validación (`422`) o conflicto de stock (`409`), `src/services/api.js` lanza una instancia de `ApiError` con:
- `error.status`: Código HTTP (`401`, `403`, `409`, `422`).
- `error.message`: Mensaje principal en español (`data.message`).
- `error.data?.errors`: Objeto de errores por campo en validaciones `422`.
