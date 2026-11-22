import api from '@/services/api'

export const USER_ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'almacen', label: 'Almacén' },
  { value: 'ventas', label: 'Ventas' },
]

export const AUDIT_ACTION_OPTIONS = [
  { value: 'auth.login', label: 'Inicio de sesión' },
  { value: 'auth.logout', label: 'Cierre de sesión' },
  { value: 'auth.login_failed', label: 'Intento de acceso fallido' },
  { value: 'auth.login_blocked', label: 'Acceso bloqueado' },
  { value: 'user.created', label: 'Creación de usuario' },
  { value: 'user.updated', label: 'Actualización de usuario' },
  { value: 'branch.created', label: 'Creación de sucursal' },
  { value: 'branch.updated', label: 'Actualización de sucursal' },
  { value: 'branch.deleted', label: 'Baja/Eliminación de sucursal' },
  { value: 'category.created', label: 'Creación de categoría' },
  { value: 'category.updated', label: 'Actualización de categoría' },
  { value: 'category.deleted', label: 'Eliminación de categoría' },
  { value: 'location.created', label: 'Creación de ubicación' },
  { value: 'location.updated', label: 'Actualización de ubicación' },
  { value: 'location.deleted', label: 'Eliminación de ubicación' },
  { value: 'product.created', label: 'Creación de producto' },
  { value: 'product.updated', label: 'Actualización de producto' },
  { value: 'product.deleted', label: 'Baja/Eliminación de producto' },
  { value: 'inventory.entry', label: 'Entrada de inventario' },
  { value: 'inventory.exit', label: 'Salida de inventario' },
  { value: 'inventory.transfer', label: 'Transferencia entre sucursales' },
]

/**
 * Construye una cadena de consulta URL preservando explícitamente los booleanos
 * (`true` -> `'1'`, `false` -> `'0'`) e ignorando valores vacíos, nulos o indefinidos.
 *
 * @param {Record<string, unknown>} params
 * @returns {string}
 */
export function buildUsersQueryString(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }
    if (typeof value === 'boolean') {
      searchParams.set(key, value ? '1' : '0')
      return
    }
    const normalized = String(value).trim()
    if (normalized === '') {
      return
    }
    searchParams.set(key, normalized)
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export const usuariosService = {
  /**
   * GET /api/users
   * Lista paginada de usuarios con filtros de rol, sucursal, estado y texto.
   *
   * @param {Record<string, unknown>} params
   */
  async getUsers(params = {}) {
    const query = buildUsersQueryString(params)
    return api.get(`/users${query}`)
  },

  /**
   * POST /api/users
   * Registra un nuevo usuario del sistema (solo Administrador).
   *
   * @param {Record<string, unknown>} payload
   */
  async createUser(payload) {
    return api.post('/users', payload)
  },

  /**
   * PUT /api/users/{id}
   * Actualiza datos, rol, sucursal, contraseña opcional o estado activo/inactivo.
   *
   * @param {number|string} id
   * @param {Record<string, unknown>} payload
   */
  async updateUser(id, payload) {
    return api.put(`/users/${id}`, payload)
  },

  /**
   * GET /api/audit-logs
   * Consulta paginada de la bitácora de auditoría del sistema (solo Administrador).
   *
   * @param {Record<string, unknown>} params
   */
  async getAuditLogs(params = {}) {
    const query = buildUsersQueryString(params)
    return api.get(`/audit-logs${query}`)
  },

  /**
   * GET /api/branches
   * Catálogo de sucursales para filtros y asignación en el formulario de usuarios.
   *
   * @param {Record<string, unknown>} params
   */
  async getBranches(params = {}) {
    const query = buildUsersQueryString(params)
    return api.get(`/branches${query}`)
  },
}

export default usuariosService
