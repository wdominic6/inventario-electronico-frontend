import api from '@/services/api'
import { buildQueryString } from '@/services/consultas.service'

export const reportesService = {
  /**
   * GET /api/alerts/low-stock
   * Lista paginada de componentes con stock actual <= min_stock, filtrable por sucursal y severidad.
   *
   * @param {Record<string, unknown>} params
   */
  async getLowStockAlerts(params = {}) {
    const query = buildQueryString(params)
    return api.get(`/alerts/low-stock${query}`)
  },

  /**
   * GET /api/reports/dashboard-summary
   * KPIs ejecutivos para el panel gerencial (SKU activos, valorización, alertas, movimientos, sedes).
   */
  async getDashboardSummary() {
    return api.get('/reports/dashboard-summary')
  },

  /**
   * GET /api/reports/rotation
   * Métricas de rotación de inventario (clasificación ABC) en un rango de fechas y sucursal.
   *
   * @param {Record<string, unknown>} params
   */
  async getInventoryRotation(params = {}) {
    const query = buildQueryString(params)
    return api.get(`/reports/rotation${query}`)
  },

  /**
   * GET /api/reports/kardex/{productId}
   * Historial cronológico de entradas, salidas, traslados y saldo resultante de un producto.
   *
   * @param {number|string} productId
   * @param {Record<string, unknown>} params
   */
  async getProductKardex(productId, params = {}) {
    const query = buildQueryString(params)
    return api.get(`/reports/kardex/${productId}${query}`)
  },

  /**
   * GET /api/branches
   * Lista de sucursales para filtros de reportes y alertas.
   *
   * @param {Record<string, unknown>} params
   */
  async getBranches(params = { is_active: true }) {
    const query = buildQueryString(params)
    return api.get(`/branches${query}`)
  },

  /**
   * GET /api/products
   * Catálogo de productos para el selector del reporte de Kardex.
   *
   * @param {Record<string, unknown>} params
   */
  async getProducts(params = { per_page: 100, is_active: true }) {
    const query = buildQueryString(params)
    return api.get(`/products${query}`)
  },

  /**
   * GET /api/products/{productId}
   * Ficha técnica del componente electrónico seleccionado en el Kardex.
   *
   * @param {number|string} productId
   */
  async getProductById(productId) {
    return api.get(`/products/${productId}`)
  },
}

export default reportesService
