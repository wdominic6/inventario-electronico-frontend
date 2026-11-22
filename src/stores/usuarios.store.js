import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import usuariosService from '@/services/usuarios.service'

const DEFAULT_META = (perPage = 15) => ({
  current_page: 1,
  last_page: 1,
  per_page: perPage,
  total: 0,
})

function resolveErrorMessage(err, fallback) {
  if (err?.status === 403) {
    return 'Acceso restringido: esta sección requiere privilegios de Administrador (RF08).'
  }
  if (err?.status === 401) {
    return 'Su sesión ha expirado o no está autenticada. Inicie sesión nuevamente.'
  }
  return err?.message || fallback
}

export const useUsuariosStore = defineStore('usuarios', () => {
  const users = ref([])
  const usersMeta = ref(DEFAULT_META(15))
  const filters = ref({
    q: '',
    role: '',
    branch_id: '',
    is_active: '',
    page: 1,
    per_page: 15,
  })

  const branches = ref([])
  const usersDirectory = ref([])

  const auditLogs = ref([])
  const auditMeta = ref(DEFAULT_META(20))
  const auditFilters = ref({
    user_id: '',
    action: '',
    date_from: '',
    date_to: '',
    page: 1,
    per_page: 20,
  })

  const loadingUsers = ref(false)
  const savingUser = ref(false)
  const togglingUserId = ref(null)
  const loadingAudit = ref(false)

  const error = ref(null)
  const auditError = ref(null)
  const validationErrors = ref({})
  const successMessage = ref(null)
  const lastUpdatedAt = ref(null)

  const activeUsersCount = computed(() => users.value.filter((item) => item.is_active).length)

  const inactiveUsersCount = computed(() => users.value.filter((item) => !item.is_active).length)

  function clearFeedback() {
    error.value = null
    auditError.value = null
    validationErrors.value = {}
    successMessage.value = null
  }

  async function loadBranches(force = false) {
    if (!force && branches.value.length > 0) {
      return
    }
    try {
      const response = await usuariosService.getBranches({})
      branches.value = Array.isArray(response?.data) ? response.data : []
    } catch {
      // Catálogo auxiliar opcional para selectores de sucursal
    }
  }

  async function loadUsersDirectory(force = false) {
    if (!force && usersDirectory.value.length > 0) {
      return
    }
    try {
      const response = await usuariosService.getUsers({ per_page: 100, page: 1 })
      usersDirectory.value = Array.isArray(response?.data) ? response.data : []
    } catch {
      // Directorio auxiliar para el filtro de usuario en bitácora de auditoría
    }
  }

  async function fetchUsers(overrideFilters = {}) {
    filters.value = {
      ...filters.value,
      ...overrideFilters,
    }

    loadingUsers.value = true
    error.value = null

    try {
      const response = await usuariosService.getUsers(filters.value)
      users.value = Array.isArray(response?.data) ? response.data : []
      usersMeta.value = {
        ...DEFAULT_META(Number(filters.value.per_page || 15)),
        ...response?.meta,
      }
      lastUpdatedAt.value = new Date().toLocaleTimeString('es-PE')
      return users.value
    } catch (err) {
      error.value = resolveErrorMessage(err, 'No se pudo cargar el listado de usuarios.')
      return []
    } finally {
      loadingUsers.value = false
    }
  }

  async function createUser(payload) {
    savingUser.value = true
    error.value = null
    validationErrors.value = {}
    successMessage.value = null

    try {
      const response = await usuariosService.createUser(payload)
      const created = response?.data || null
      successMessage.value = created
        ? `Usuario ${created.name} (${created.email}) registrado correctamente.`
        : 'Usuario registrado correctamente.'
      await fetchUsers({ page: 1 })
      usersDirectory.value = []
      return { ok: true, data: created }
    } catch (err) {
      validationErrors.value = err?.data?.errors || {}
      error.value = resolveErrorMessage(err, 'No se pudo registrar el usuario.')
      return { ok: false, error: error.value }
    } finally {
      savingUser.value = false
    }
  }

  async function updateUser(userId, payload) {
    savingUser.value = true
    error.value = null
    validationErrors.value = {}
    successMessage.value = null

    try {
      const response = await usuariosService.updateUser(userId, payload)
      const updated = response?.data || null
      successMessage.value = updated
        ? `Datos del usuario ${updated.name} actualizados correctamente.`
        : 'Usuario actualizado correctamente.'
      await fetchUsers()
      usersDirectory.value = []
      return { ok: true, data: updated }
    } catch (err) {
      validationErrors.value = err?.data?.errors || {}
      error.value = resolveErrorMessage(err, 'No se pudo actualizar el usuario.')
      return { ok: false, error: error.value }
    } finally {
      savingUser.value = false
    }
  }

  async function toggleUserStatus(user) {
    if (!user?.id) {
      return { ok: false, error: 'Usuario inválido.' }
    }

    const nextActiveState = !user.is_active
    togglingUserId.value = user.id
    error.value = null
    successMessage.value = null

    try {
      const response = await usuariosService.updateUser(user.id, {
        is_active: nextActiveState,
      })
      const updated = response?.data || null
      successMessage.value = nextActiveState
        ? `Usuario ${user.name} reactivado correctamente.`
        : `Usuario ${user.name} desactivado. Sus sesiones activas fueron revocadas.`
      await fetchUsers()
      usersDirectory.value = []
      return { ok: true, data: updated }
    } catch (err) {
      error.value = resolveErrorMessage(err, 'No se pudo cambiar el estado del usuario.')
      return { ok: false, error: error.value }
    } finally {
      togglingUserId.value = null
    }
  }

  async function fetchAuditLogs(overrideFilters = {}) {
    auditFilters.value = {
      ...auditFilters.value,
      ...overrideFilters,
    }

    loadingAudit.value = true
    auditError.value = null
    validationErrors.value = {}

    try {
      const response = await usuariosService.getAuditLogs(auditFilters.value)
      auditLogs.value = Array.isArray(response?.data) ? response.data : []
      auditMeta.value = {
        ...DEFAULT_META(Number(auditFilters.value.per_page || 20)),
        ...response?.meta,
      }
      lastUpdatedAt.value = new Date().toLocaleTimeString('es-PE')
      return auditLogs.value
    } catch (err) {
      validationErrors.value = err?.data?.errors || {}
      auditError.value = resolveErrorMessage(
        err,
        'No se pudo consultar la bitácora de auditoría.',
      )
      return []
    } finally {
      loadingAudit.value = false
    }
  }

  return {
    users,
    usersMeta,
    filters,
    branches,
    usersDirectory,
    auditLogs,
    auditMeta,
    auditFilters,
    loadingUsers,
    savingUser,
    togglingUserId,
    loadingAudit,
    error,
    auditError,
    validationErrors,
    successMessage,
    lastUpdatedAt,
    activeUsersCount,
    inactiveUsersCount,
    clearFeedback,
    loadBranches,
    loadUsersDirectory,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    fetchAuditLogs,
  }
})

export default useUsuariosStore
