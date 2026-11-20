import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import reportesService from '@/services/reportes.service'

const DEFAULT_META = () => ({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const DEFAULT_SUMMARY = () => ({
  active_skus: 0,
  inventory_value: 0,
  low_stock_alerts: 0,
  movements_today: 0,
  movements_this_week: 0,
  operational_branches: 0,
})

export const useReportesStore = defineStore('reportes', () => {
  const summary = ref(DEFAULT_SUMMARY())

  const items = ref([])
  const meta = ref(DEFAULT_META())

  const alerts = ref([])
  const alertsMeta = ref(DEFAULT_META())
  const alertFilters = ref({
    branch_id: '',
    severity: '',
    page: 1,
    per_page: 15,
  })

  const rotationItems = ref([])
  const rotationMeta = ref(DEFAULT_META())
  const rotationFilters = ref({
    branch_id: '',
    date_from: '',
    date_to: '',
    page: 1,
    per_page: 20,
  })

  const kardexItems = ref([])
  const kardexMeta = ref(DEFAULT_META())
  const kardexProduct = ref(null)
  const kardexFilters = ref({
    product_id: '',
    branch_id: '',
    date_from: '',
    date_to: '',
    page: 1,
    per_page: 20,
  })

  const branches = ref([])
  const productsCatalog = ref([])

  const loading = ref(false)
  const loadingSummary = ref(false)
  const loadingAlerts = ref(false)
  const loadingRotation = ref(false)
  const loadingKardex = ref(false)

  const error = ref(null)
  const validationErrors = ref({})
  const lastUpdatedAt = ref(null)

  const criticalAlertsCount = computed(
    () => alerts.value.filter((item) => item.severity === 'critical').length,
  )

  const warningAlertsCount = computed(
    () => alerts.value.filter((item) => item.severity === 'warning').length,
  )

  /**
   * Clasificación ABC sobre los ítems de rotación:
   * - Clase A: hasta el 80% del volumen acumulado de unidades movilizadas (alta rotación)
   * - Clase B: del 80% al 95% del volumen acumulado (rotación media)
   * - Clase C: último 5% del volumen o baja frecuencia (rotación baja)
   */
  const rotationWithAbc = computed(() => {
    const list = rotationItems.value
    const totalQuantityMoved = list.reduce(
      (sum, row) => sum + Number(row.quantity_moved || 0),
      0,
    )
    const maxQuantity = list.reduce(
      (max, row) => Math.max(max, Number(row.quantity_moved || 0)),
      1,
    )

    let cumulative = 0

    return list.map((row, index) => {
      const qty = Number(row.quantity_moved || 0)
      const share = totalQuantityMoved > 0 ? (qty / totalQuantityMoved) * 100 : 0
      const previousCumulative = cumulative
      cumulative += share

      let abcClass = 'C'
      if (previousCumulative < 80) {
        abcClass = 'A'
      } else if (previousCumulative < 95) {
        abcClass = 'B'
      }

      return {
        ...row,
        rank: index + 1,
        quantity_moved: qty,
        movement_count: Number(row.movement_count || 0),
        share_percent: Number(share.toFixed(1)),
        cumulative_percent: Number(Math.min(cumulative, 100).toFixed(1)),
        bar_width_percent: Math.max(Math.round((qty / maxQuantity) * 100), 4),
        abc_class: abcClass,
      }
    })
  })

  async function loadCatalogs(force = false) {
    if (!force && branches.value.length > 0 && productsCatalog.value.length > 0) {
      return
    }
    try {
      const [branchesRes, productsRes] = await Promise.all([
        reportesService.getBranches({ is_active: true }).catch(() => ({ data: [] })),
        reportesService.getProducts({ per_page: 100, is_active: true }).catch(() => ({ data: [] })),
      ])
      branches.value = Array.isArray(branchesRes?.data) ? branchesRes.data : []
      productsCatalog.value = Array.isArray(productsRes?.data) ? productsRes.data : []
    } catch {
      // Catálogos auxiliares opcionales para selectores
    }
  }

  async function fetchDashboardSummary() {
    loadingSummary.value = true
    loading.value = true
    error.value = null

    try {
      const response = await reportesService.getDashboardSummary()
      summary.value = {
        ...DEFAULT_SUMMARY(),
        ...response?.data,
      }
      lastUpdatedAt.value = new Date().toLocaleTimeString('es-PE')
      return summary.value
    } catch (err) {
      error.value = err?.message || 'No se pudo cargar el resumen ejecutivo del dashboard.'
      return null
    } finally {
      loadingSummary.value = false
      loading.value = false
    }
  }

  async function fetchLowStockAlerts(overrideFilters = {}) {
    alertFilters.value = {
      ...alertFilters.value,
      ...overrideFilters,
    }

    loadingAlerts.value = true
    loading.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const response = await reportesService.getLowStockAlerts(alertFilters.value)
      alerts.value = Array.isArray(response?.data) ? response.data : []
      alertsMeta.value = {
        ...DEFAULT_META(),
        ...response?.meta,
      }
      items.value = alerts.value
      meta.value = alertsMeta.value
      lastUpdatedAt.value = new Date().toLocaleTimeString('es-PE')
    } catch (err) {
      error.value = err?.message || 'No se pudieron obtener las alertas de bajo stock.'
      validationErrors.value = err?.data?.errors || {}
    } finally {
      loadingAlerts.value = false
      loading.value = false
    }
  }

  async function fetchInventoryRotation(overrideFilters = {}) {
    rotationFilters.value = {
      ...rotationFilters.value,
      ...overrideFilters,
    }

    loadingRotation.value = true
    loading.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const response = await reportesService.getInventoryRotation(rotationFilters.value)
      rotationItems.value = Array.isArray(response?.data) ? response.data : []
      rotationMeta.value = {
        ...DEFAULT_META(),
        ...response?.meta,
      }
      items.value = rotationItems.value
      meta.value = rotationMeta.value
      lastUpdatedAt.value = new Date().toLocaleTimeString('es-PE')
    } catch (err) {
      error.value = err?.message || 'No se pudo generar el reporte de rotación de inventario.'
      validationErrors.value = err?.data?.errors || {}
    } finally {
      loadingRotation.value = false
      loading.value = false
    }
  }

  async function fetchProductKardex(productId, overrideFilters = {}) {
    const resolvedProductId = productId || kardexFilters.value.product_id
    if (!resolvedProductId) {
      error.value = 'Seleccione un componente electrónico para consultar su Kardex.'
      return
    }

    kardexFilters.value = {
      ...kardexFilters.value,
      ...overrideFilters,
      product_id: resolvedProductId,
    }

    loadingKardex.value = true
    loading.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const queryParams = {
        branch_id: kardexFilters.value.branch_id,
        date_from: kardexFilters.value.date_from,
        date_to: kardexFilters.value.date_to,
        page: kardexFilters.value.page,
        per_page: kardexFilters.value.per_page,
      }
      const [kardexRes, productRes] = await Promise.all([
        reportesService.getProductKardex(resolvedProductId, queryParams),
        reportesService.getProductById(resolvedProductId).catch(() => null),
      ])

      kardexItems.value = Array.isArray(kardexRes?.data) ? kardexRes.data : []
      kardexMeta.value = {
        ...DEFAULT_META(),
        ...kardexRes?.meta,
      }
      if (productRes?.data) {
        kardexProduct.value = productRes.data
      } else {
        kardexProduct.value =
          productsCatalog.value.find(
            (prod) => Number(prod.id) === Number(resolvedProductId),
          ) || null
      }

      items.value = kardexItems.value
      meta.value = kardexMeta.value
      lastUpdatedAt.value = new Date().toLocaleTimeString('es-PE')
    } catch (err) {
      error.value = err?.message || 'No se pudo consultar el historial de Kardex del producto.'
      validationErrors.value = err?.data?.errors || {}
    } finally {
      loadingKardex.value = false
      loading.value = false
    }
  }

  return {
    summary,
    items,
    meta,
    alerts,
    alertsMeta,
    alertFilters,
    rotationItems,
    rotationMeta,
    rotationFilters,
    rotationWithAbc,
    kardexItems,
    kardexMeta,
    kardexProduct,
    kardexFilters,
    branches,
    productsCatalog,
    loading,
    loadingSummary,
    loadingAlerts,
    loadingRotation,
    loadingKardex,
    error,
    validationErrors,
    lastUpdatedAt,
    criticalAlertsCount,
    warningAlertsCount,
    loadCatalogs,
    fetchDashboardSummary,
    fetchLowStockAlerts,
    fetchInventoryRotation,
    fetchProductKardex,
  }
})

export default useReportesStore
