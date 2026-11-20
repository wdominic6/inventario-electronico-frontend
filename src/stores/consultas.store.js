import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import consultasService, {
  buildAvailabilityMatrix,
  resolveStockStatus,
} from '@/services/consultas.service'

const DEFAULT_META = () => ({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const DEFAULT_FILTERS = () => ({
  q: '',
  category_id: '',
  branch_id: '',
  package_type: '',
  voltage: '',
  only_available: false,
  page: 1,
  per_page: 15,
})

export const useConsultasStore = defineStore('consultas', () => {
  const items = ref([])
  const meta = ref(DEFAULT_META())
  const filters = ref(DEFAULT_FILTERS())

  const branches = ref([])
  const categories = ref([])

  const selectedProductAvailability = ref(null)
  const branchInventoryItems = ref([])
  const branchInventoryMeta = ref(DEFAULT_META())

  const loading = ref(false)
  const availabilityLoading = ref(false)
  const branchInventoryLoading = ref(false)
  const catalogLoading = ref(false)

  const error = ref(null)
  const validationErrors = ref({})
  const lastUpdatedAt = ref(null)

  const autoRefreshEnabled = ref(false)
  let pollingTimerId = null

  const hasActiveFilters = computed(() => {
    const f = filters.value
    return Boolean(
      f.q.trim() ||
        f.category_id ||
        f.branch_id ||
        f.package_type.trim() ||
        f.voltage.trim() ||
        f.only_available,
    )
  })

  const enrichedItems = computed(() =>
    items.value.map((product) => {
      const minStock = Number(product.min_stock ?? 0)
      const totalStock = Number(product.total_stock ?? 0)
      const matrix = buildAvailabilityMatrix(product, branches.value)

      return {
        ...product,
        package_type: product.package_type || product.specs?.package_type || null,
        voltage: product.voltage || product.specs?.voltage || null,
        tolerance: product.tolerance || product.specs?.tolerance || null,
        status: resolveStockStatus(totalStock, minStock),
        branch_matrix: matrix.branches,
      }
    }),
  )

  async function loadFilterCatalogs(force = false) {
    if (!force && branches.value.length > 0 && categories.value.length > 0) {
      return
    }
    catalogLoading.value = true
    try {
      const [branchesRes, categoriesRes] = await Promise.all([
        consultasService.getBranches({ is_active: true }).catch(() => ({ data: [] })),
        consultasService.getCategories().catch(() => ({ data: [] })),
      ])
      branches.value = Array.isArray(branchesRes?.data) ? branchesRes.data : []
      categories.value = Array.isArray(categoriesRes?.data) ? categoriesRes.data : []
    } finally {
      catalogLoading.value = false
    }
  }

  async function fetchStockSearch(overrideFilters = {}) {
    filters.value = {
      ...filters.value,
      ...overrideFilters,
    }

    const trimmedQuery = String(filters.value.q || '').trim()
    if (trimmedQuery.length === 1) {
      error.value = 'El criterio de búsqueda debe tener como mínimo 2 caracteres.'
      validationErrors.value = {
        q: ['El criterio de búsqueda debe tener como mínimo 2 caracteres.'],
      }
      return
    }

    loading.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const response = await consultasService.searchStock({
        ...filters.value,
        q: trimmedQuery,
      })

      items.value = Array.isArray(response?.data) ? response.data : []
      meta.value = {
        ...DEFAULT_META(),
        ...response?.meta,
      }
      lastUpdatedAt.value = new Date().toLocaleTimeString('es-PE')

      if (selectedProductAvailability.value?.product?.id) {
        const refreshed = items.value.find(
          (item) => Number(item.id) === Number(selectedProductAvailability.value.product.id),
        )
        if (refreshed) {
          selectedProductAvailability.value = buildAvailabilityMatrix(refreshed, branches.value)
        }
      }
    } catch (err) {
      error.value = err?.message || 'No se pudo consultar la disponibilidad de stock.'
      validationErrors.value = err?.data?.errors || {}
    } finally {
      loading.value = false
    }
  }

  async function fetchProductAvailability(productId) {
    if (!productId) {
      selectedProductAvailability.value = null
      return null
    }

    availabilityLoading.value = true
    error.value = null

    try {
      await loadFilterCatalogs()

      const cachedProduct = items.value.find((item) => Number(item.id) === Number(productId))
      if (cachedProduct) {
        selectedProductAvailability.value = buildAvailabilityMatrix(cachedProduct, branches.value)
      }

      const response = await consultasService.getProductAvailability(productId)
      if (response?.data) {
        selectedProductAvailability.value = response.data
        lastUpdatedAt.value = new Date().toLocaleTimeString('es-PE')
      }
      return selectedProductAvailability.value
    } catch (err) {
      error.value =
        err?.message || 'No se pudo obtener la matriz de disponibilidad entre sucursales.'
      return null
    } finally {
      availabilityLoading.value = false
    }
  }

  async function fetchStockByBranch(branchId, params = {}) {
    if (!branchId) {
      branchInventoryItems.value = []
      branchInventoryMeta.value = DEFAULT_META()
      return
    }

    branchInventoryLoading.value = true
    error.value = null

    try {
      const response = await consultasService.getStockByBranch(branchId, params)
      branchInventoryItems.value = Array.isArray(response?.data) ? response.data : []
      branchInventoryMeta.value = {
        ...DEFAULT_META(),
        ...response?.meta,
      }
      lastUpdatedAt.value = new Date().toLocaleTimeString('es-PE')
    } catch (err) {
      error.value = err?.message || 'No se pudo cargar el inventario de la sucursal seleccionada.'
    } finally {
      branchInventoryLoading.value = false
    }
  }

  function selectProductFromList(product) {
    if (!product) {
      selectedProductAvailability.value = null
      return
    }
    selectedProductAvailability.value = buildAvailabilityMatrix(product, branches.value)
  }

  function clearAvailability() {
    selectedProductAvailability.value = null
  }

  async function resetFilters() {
    filters.value = DEFAULT_FILTERS()
    error.value = null
    validationErrors.value = {}
    await fetchStockSearch()
  }

  function startAutoRefresh(intervalMs = 20000) {
    stopAutoRefresh()
    autoRefreshEnabled.value = true
    pollingTimerId = window.setInterval(() => {
      if (!loading.value) {
        fetchStockSearch()
      }
    }, intervalMs)
  }

  function stopAutoRefresh() {
    autoRefreshEnabled.value = false
    if (pollingTimerId !== null) {
      window.clearInterval(pollingTimerId)
      pollingTimerId = null
    }
  }

  return {
    items,
    enrichedItems,
    meta,
    filters,
    branches,
    categories,
    selectedProductAvailability,
    branchInventoryItems,
    branchInventoryMeta,
    loading,
    availabilityLoading,
    branchInventoryLoading,
    catalogLoading,
    error,
    validationErrors,
    lastUpdatedAt,
    autoRefreshEnabled,
    hasActiveFilters,
    loadFilterCatalogs,
    fetchStockSearch,
    fetchProductAvailability,
    fetchStockByBranch,
    selectProductFromList,
    clearAvailability,
    resetFilters,
    startAutoRefresh,
    stopAutoRefresh,
  }
})

export default useConsultasStore
