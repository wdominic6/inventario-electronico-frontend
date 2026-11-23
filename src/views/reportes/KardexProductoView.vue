<script setup>
import { onMounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReportesStore } from '@/stores/reportes.store'
import SubnavVentasReportes from '@/components/reportes/SubnavVentasReportes.vue'
import TablaKardexCronologico from '@/components/reportes/TablaKardexCronologico.vue'

const route = useRoute()
const router = useRouter()
const store = useReportesStore()

const localFilters = reactive({
  product_id: route.params.productId ? String(route.params.productId) : '',
  branch_id: route.query.branch_id ? String(route.query.branch_id) : '',
  date_from: '',
  date_to: '',
  per_page: 20,
})

onMounted(async () => {
  await store.loadCatalogs()

  if (!localFilters.product_id && store.productsCatalog.length > 0) {
    localFilters.product_id = String(store.productsCatalog[0].id)
  }

  if (localFilters.product_id) {
    await submitKardexQuery(1)
  }
})

watch(
  () => route.params.productId,
  async (newProductId) => {
    if (newProductId && String(newProductId) !== localFilters.product_id) {
      localFilters.product_id = String(newProductId)
      await submitKardexQuery(1)
    }
  },
)

async function submitKardexQuery(page = 1) {
  if (!localFilters.product_id) return

  router.replace({
    name: 'reportes.kardex',
    params: { productId: localFilters.product_id },
    query: localFilters.branch_id ? { branch_id: localFilters.branch_id } : {},
  })

  await store.fetchProductKardex(localFilters.product_id, {
    branch_id: localFilters.branch_id,
    date_from: localFilters.date_from,
    date_to: localFilters.date_to,
    per_page: localFilters.per_page,
    page,
  })
}

async function resetKardexFilters() {
  localFilters.branch_id = ''
  localFilters.date_from = ''
  localFilters.date_to = ''
  localFilters.per_page = 20
  await submitKardexQuery(1)
}

function goToAvailability() {
  if (!localFilters.product_id) return
  router.push({
    name: 'consultas.disponibilidad',
    params: { productId: localFilters.product_id },
  })
}
</script>

<template>
  <section class="view-page">
    <SubnavVentasReportes
      title="Reporte Histórico de Kardex por Componente Electrónico"
      subtitle="Trazabilidad cronológica inmutable de entradas, salidas, ajustes y transferencias con saldo anterior, saldo resultante y ubicación física (RF04, RF07)."
      :last-updated-at="store.lastUpdatedAt"
    >
      <template #actions>
        <button
          v-if="localFilters.product_id"
          type="button"
          class="btn-link"
          @click="goToAvailability"
        >
          Ver Disponibilidad en Sedes
        </button>
      </template>
    </SubnavVentasReportes>

    <form class="filters-bar" @submit.prevent="submitKardexQuery(1)">
      <div class="filter-field field-product">
        <label for="kardex-product">Componente Electrónico</label>
        <select
          id="kardex-product"
          v-model="localFilters.product_id"
          @change="submitKardexQuery(1)"
        >
          <option value="">-- Seleccione un componente electrónico --</option>
          <option v-for="prod in store.productsCatalog" :key="prod.id" :value="String(prod.id)">
            [{{ prod.sku }}] {{ prod.name }}
          </option>
        </select>
      </div>

      <div class="filter-field">
        <label for="kardex-branch">Sucursal</label>
        <select id="kardex-branch" v-model="localFilters.branch_id" @change="submitKardexQuery(1)">
          <option value="">Todas las sucursales</option>
          <option v-for="branch in store.branches" :key="branch.id" :value="String(branch.id)">
            {{ branch.name }}
          </option>
        </select>
      </div>

      <div class="filter-field">
        <label for="kardex-from">Fecha Desde</label>
        <input id="kardex-from" v-model="localFilters.date_from" type="date" />
      </div>

      <div class="filter-field">
        <label for="kardex-to">Fecha Hasta</label>
        <input id="kardex-to" v-model="localFilters.date_to" type="date" />
      </div>

      <div class="filter-actions">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="store.loadingKardex"
          @click="resetKardexFilters"
        >
          Limpiar Fechas
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!localFilters.product_id || store.loadingKardex"
        >
          {{ store.loadingKardex ? 'Consultando...' : 'Consultar Kardex' }}
        </button>
      </div>
    </form>

    <div v-if="store.error" class="alert-error" role="alert">
      {{ store.error }}
    </div>

    <section v-if="store.kardexProduct" class="product-banner">
      <div class="banner-main">
        <code class="sku-tag">{{ store.kardexProduct.sku }}</code>
        <div>
          <h2 class="banner-title">{{ store.kardexProduct.name }}</h2>
          <p class="banner-meta">
            <span v-if="store.kardexProduct.brand">
              <strong>Marca:</strong> {{ store.kardexProduct.brand }}
            </span>
            <span v-if="store.kardexProduct.model">
              · <strong>Modelo:</strong> {{ store.kardexProduct.model }}
            </span>
            <span>
              · <strong>Stock Mínimo:</strong> {{ store.kardexProduct.min_stock }}
              {{ store.kardexProduct.unit || 'UND' }}
            </span>
          </p>
        </div>
      </div>

      <div class="banner-stats">
        <div class="stat-item">
          <span class="stat-label">Movimientos Listados</span>
          <strong>{{ store.kardexMeta.total }}</strong>
        </div>
        <div v-if="store.kardexProduct.total_stock !== undefined" class="stat-item">
          <span class="stat-label">Stock Global Actual</span>
          <strong>
            {{ store.kardexProduct.total_stock }} {{ store.kardexProduct.unit || 'UND' }}
          </strong>
        </div>
      </div>
    </section>

    <TablaKardexCronologico :movements="store.kardexItems" :loading="store.loadingKardex" />

    <footer v-if="store.kardexMeta.last_page > 1" class="pagination-bar">
      <span class="page-info">
        Página {{ store.kardexMeta.current_page }} de {{ store.kardexMeta.last_page }} (Total:
        {{ store.kardexMeta.total }} movimientos en Kardex)
      </span>
      <div class="page-controls">
        <button
          type="button"
          class="page-btn"
          :disabled="store.kardexMeta.current_page <= 1 || store.loadingKardex"
          @click="submitKardexQuery(store.kardexMeta.current_page - 1)"
        >
          Anterior
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="
            store.kardexMeta.current_page >= store.kardexMeta.last_page || store.loadingKardex
          "
          @click="submitKardexQuery(store.kardexMeta.current_page + 1)"
        >
          Siguiente
        </button>
      </div>
    </footer>
  </section>
</template>

<style scoped>
.view-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    sans-serif;
  color: #0f172a;
}

.btn-link {
  padding: 0.45rem 0.85rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1d4ed8;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  cursor: pointer;
}

.filters-bar {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.9rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.filter-field {
  flex: 1 1 170px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-product {
  flex: 2 1 300px;
}

.filter-field label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
}

.filter-field select,
.filter-field input {
  padding: 0.55rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #0f172a;
  background-color: #f8fafc;
}

.filter-actions {
  display: flex;
  gap: 0.6rem;
}

.btn {
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
}

.btn-secondary {
  background-color: #f8fafc;
  color: #334155;
  border-color: #cbd5e1;
}

.alert-error {
  padding: 0.85rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 0.65rem;
  font-size: 0.875rem;
}

.product-banner {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.banner-main {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.sku-tag {
  background-color: #1e293b;
  color: #ffffff;
  font-family: monospace;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.35rem 0.65rem;
  border-radius: 0.375rem;
}

.banner-title {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
}

.banner-meta {
  margin: 0.2rem 0 0;
  font-size: 0.8125rem;
  color: #475569;
}

.banner-stats {
  display: flex;
  gap: 1.25rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-label {
  font-size: 0.725rem;
  text-transform: uppercase;
  color: #64748b;
}

.stat-item strong {
  font-size: 1.15rem;
  color: #0f172a;
}

.pagination-bar {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.85rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.page-info {
  font-size: 0.8125rem;
  color: #64748b;
}

.page-controls {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  padding: 0.4rem 0.85rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 0.375rem;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #334155;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
