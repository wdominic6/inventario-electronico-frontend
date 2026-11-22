import api from '@/services/api'

/**
 * Construye una cadena de consulta URL ignorando valores vacíos, nulos o indefinidos.
 *
 * @param {Record<string, unknown>} params
 * @returns {string}
 */
export function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }
    if (typeof value === 'boolean') {
      if (value) {
        searchParams.set(key, '1')
      }
      return
    }
    searchParams.set(key, String(value).trim())
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

/**
 * Determina el estado del semáforo de stock comparando contra el stock mínimo.
 *
 * @param {number} quantity
 * @param {number} minStock
 * @returns {'ok' | 'low_stock' | 'out_of_stock'}
 */
export function resolveStockStatus(quantity, minStock = 0) {
  const qty = Number(quantity || 0)
  const min = Number(minStock || 0)

  if (qty <= 0) {
    return 'out_of_stock'
  }
  if (qty <= min) {
    return 'low_stock'
  }
  return 'ok'
}

/**
 * Normaliza la ficha de un producto y la lista de sucursales en una matriz
 * de disponibilidad cruzada multi-sucursal con estado por sede y estantería.
 *
 * @param {Record<string, any>} product
 * @param {Array<Record<string, any>>} branches
 * @returns {Record<string, any>}
 */
export function buildAvailabilityMatrix(product, branches = []) {
  const minStock = Number(product?.min_stock ?? 0)
  const stocksByBranch = Array.isArray(product?.stocks_by_branch) ? product.stocks_by_branch : []
  const branchMap = new Map(stocksByBranch.map((entry) => [Number(entry.branch_id), entry]))

  const sourceBranches =
    branches.length > 0
      ? branches
      : stocksByBranch.map((entry) => ({
          id: entry.branch_id,
          name: entry.branch_name,
          code: entry.branch_code || `SUC-${entry.branch_id}`,
          is_active: true,
        }))

  const matrix = sourceBranches.map((branch) => {
    const branchId = Number(branch.id ?? branch.branch_id)
    const stockEntry = branchMap.get(branchId)
    const totalQuantity = Number(stockEntry?.total_quantity ?? 0)
    const locations = Array.isArray(stockEntry?.locations)
      ? stockEntry.locations.map((loc) => ({
          location_id: loc.location_id,
          shelf: loc.shelf || '-',
          level: loc.level || '-',
          bin: loc.bin || '-',
          code: loc.code || `EST-${loc.shelf || '?'}-${loc.level || '?'}-${loc.bin || '?'}`,
          quantity: Number(loc.quantity ?? 0),
        }))
      : []

    return {
      branch_id: branchId,
      branch_code: branch.code || `SUC-${branchId}`,
      branch_name: branch.name || stockEntry?.branch_name || `Sucursal #${branchId}`,
      address: branch.address || null,
      total_quantity: totalQuantity,
      min_stock: minStock,
      status: stockEntry?.status || resolveStockStatus(totalQuantity, minStock),
      locations,
    }
  })

  const totalStock =
    product?.total_stock !== undefined
      ? Number(product.total_stock)
      : matrix.reduce((acc, item) => acc + item.total_quantity, 0)

  return {
    product: {
      id: product.id,
      sku: product.sku,
      barcode: product.barcode || null,
      name: product.name,
      brand: product.brand || null,
      model: product.model || null,
      unit: product.unit || 'UND',
      min_stock: minStock,
      unit_price: product.unit_price ?? null,
      package_type: product.package_type || product.specs?.package_type || null,
      voltage: product.voltage || product.specs?.voltage || null,
      tolerance: product.tolerance || product.specs?.tolerance || null,
      specs: product.specs || {},
      category: product.category || null,
      total_stock: totalStock,
      overall_status: resolveStockStatus(totalStock, minStock),
    },
    branches: matrix,
  }
}

export const consultasService = {
  /**
   * GET /api/stock/search
   * Buscador multicriterio en tiempo real por SKU, nombre, categoría, sucursal y parámetros técnicos.
   *
   * @param {Record<string, unknown>} params
   */
  async searchStock(params = {}) {
    const query = buildQueryString(params)
    return api.get(`/stock/search${query}`)
  },

  /**
   * GET /api/stock/availability/{productId}
   * Obtiene la matriz de disponibilidad cruzada en tiempo real de un componente en todas las sucursales.
   * Si el endpoint específico aún no está registrado en el backend, construye la matriz desde
   * GET /api/products/{productId} y GET /api/branches.
   *
   * @param {number|string} productId
   */
  async getProductAvailability(productId) {
    try {
      const response = await api.get(`/stock/availability/${productId}`)
      if (response?.data?.branches) {
        return response
      }
      if (response?.data) {
        const branchesRes = await api.get('/branches?is_active=1').catch(() => ({ data: [] }))
        return {
          data: buildAvailabilityMatrix(response.data, branchesRes?.data || []),
        }
      }
      return response
    } catch (error) {
      if (error?.status === 404) {
        const [productRes, branchesRes] = await Promise.all([
          api.get(`/products/${productId}`),
          api.get('/branches?is_active=1').catch(() => ({ data: [] })),
        ])
        return {
          data: buildAvailabilityMatrix(productRes?.data || {}, branchesRes?.data || []),
        }
      }
      throw error
    }
  },

  /**
   * GET /api/stock/by-branch/{branchId}
   * Inventario detallado de una sucursal específica con filtros técnicos.
   * Incluye respaldo automático hacia GET /api/stock/search?branch_id={branchId} en caso de 404.
   *
   * @param {number|string} branchId
   * @param {Record<string, unknown>} params
   */
  async getStockByBranch(branchId, params = {}) {
    const query = buildQueryString(params)
    try {
      return await api.get(`/stock/by-branch/${branchId}${query}`)
    } catch (error) {
      if (error?.status === 404) {
        const fallbackQuery = buildQueryString({ ...params, branch_id: branchId })
        return api.get(`/stock/search${fallbackQuery}`)
      }
      throw error
    }
  },

  /**
   * GET /api/branches
   * Lista de sucursales activas para selectores de consulta y cabeceras de disponibilidad cruzada.
   *
   * @param {Record<string, unknown>} params
   */
  async getBranches(params = { is_active: true }) {
    const query = buildQueryString(params)
    return api.get(`/branches${query}`)
  },

  /**
   * GET /api/categories
   * Lista de categorías electrónicas para filtros de búsqueda técnica.
   *
   * @param {Record<string, unknown>} params
   */
  async getCategories(params = {}) {
    const query = buildQueryString(params)
    return api.get(`/categories${query}`)
  },
}

export default consultasService
