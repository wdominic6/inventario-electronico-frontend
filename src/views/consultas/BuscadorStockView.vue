<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConsultasStore } from '@/stores/consultas.store'
import SubnavVentasReportes from '@/components/reportes/SubnavVentasReportes.vue'
import FiltrosTecnicosStock from '@/components/consultas/FiltrosTecnicosStock.vue'
import SemaforoDisponibilidadBadge from '@/components/consultas/SemaforoDisponibilidadBadge.vue'
import MatrizDisponibilidadSucursales from '@/components/consultas/MatrizDisponibilidadSucursales.vue'

const router = useRouter()
const store = useConsultasStore()

onMounted(async () => {
  await store.loadFilterCatalogs()
  await store.fetchStockSearch()
})

onBeforeUnmount(() => {
  store.stopAutoRefresh()
})

async function handleSearch(nextFilters) {
  await store.fetchStockSearch(nextFilters)
}

async function handleReset() {
  await store.resetFilters()
}

function handleToggleAutoRefresh(enabled) {
  if (enabled) {
    store.startAutoRefresh(20000)
  } else {
    store.stopAutoRefresh()
  }
}

async function changePage(page) {
  if (page < 1 || page > store.meta.last_page || store.loading) return
  await store.fetchStockSearch({ page })
}

function openProductMatrix(product) {
  store.selectProductFromList(product)
}

function goToFullAvailability(productId) {
  router.push({ name: 'consultas.disponibilidad', params: { productId } })
}

function goToKardex(productId) {
  router.push({ name: 'reportes.kardex', params: { productId } })
}
</script>

<template>
  <main class="view-page">
    <SubnavVentasReportes
      title="Buscador Multicriterio de Stock en Tiempo Real"
      subtitle="Consulta rápida para personal de Ventas y Almacén por SKU, código de barras, categoría, sucursal y especificaciones técnicas (RF03)."
      :last-updated-at="store.lastUpdatedAt"
    >
      <template #actions>
        <button
          type="button"
          class="btn-refresh"
          :disabled="store.loading"
          @click="store.fetchStockSearch()"
        >
          {{ store.loading ? 'Actualizando...' : 'Refrescar ahora' }}
        </button>
      </template>
    </SubnavVentasReportes>

    <FiltrosTecnicosStock
      v-model="store.filters"
      :branches="store.branches"
      :categories="store.categories"
      :loading="store.loading"
      :auto-refresh="store.autoRefreshEnabled"
      @search="handleSearch"
      @reset="handleReset"
      @toggle-auto-refresh="handleToggleAutoRefresh"
    />

    <div v-if="store.error" class="alert-error" role="alert">
      <strong>Aviso de consulta:</strong> {{ store.error }}
    </div>

    <MatrizDisponibilidadSucursales
      v-if="store.selectedProductAvailability"
      class="detail-panel"
      :availability="store.selectedProductAvailability"
      :loading="store.availabilityLoading"
      :highlight-branch-id="store.filters.branch_id"
      @close="store.clearAvailability()"
      @view-kardex="goToKardex"
    />

    <section class="results-card">
      <div class="results-header">
        <div>
          <h2 class="results-title">Catálogo y Existencias por Sucursal</h2>
          <p class="results-count">
            Mostrando <strong>{{ store.enrichedItems.length }}</strong> de
            <strong>{{ store.meta.total }}</strong> componentes encontrados
          </p>
        </div>
      </div>

      <div v-if="store.loading && store.enrichedItems.length === 0" class="state-box">
        Consultando existencias en tiempo real en todas las sucursales...
      </div>

      <div v-else-if="store.enrichedItems.length === 0" class="state-box">
        No se encontraron componentes electrónicos que coincidan con los criterios técnicos
        aplicados.
      </div>

      <div v-else class="table-responsive">
        <table class="stock-table">
          <thead>
            <tr>
              <th>SKU / Código</th>
              <th>Componente Electrónico</th>
              <th>Categoría</th>
              <th>Parámetros Técnicos</th>
              <th class="text-right">Stock Global</th>
              <th>Disponibilidad por Sucursal</th>
              <th class="text-right">Ubicación en Estantería</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in store.enrichedItems"
              :key="item.id"
              :class="{
                'row-selected':
                  store.selectedProductAvailability?.product?.id === item.id,
              }"
            >
              <td>
                <code class="sku-badge">{{ item.sku }}</code>
                <div v-if="item.barcode" class="sub-code">EAN: {{ item.barcode }}</div>
              </td>
              <td>
                <strong class="item-name">{{ item.name }}</strong>
                <div class="sub-meta">
                  <span v-if="item.brand">{{ item.brand }}</span>
                  <span v-if="item.model"> · {{ item.model }}</span>
                  <span> · Mín: {{ item.min_stock }} {{ item.unit || 'UND' }}</span>
                </div>
              </td>
              <td>{{ item.category?.name || '-' }}</td>
              <td>
                <div class="specs-tags">
                  <span v-if="item.package_type" class="spec-chip">
                    {{ item.package_type }}
                  </span>
                  <span v-if="item.voltage" class="spec-chip spec-volt">
                    {{ item.voltage }}
                  </span>
                  <span v-if="item.tolerance" class="spec-chip">
                    {{ item.tolerance }}
                  </span>
                  <span
                    v-if="!item.package_type && !item.voltage && !item.tolerance"
                    class="muted-text"
                  >
                    Estándar
                  </span>
                </div>
              </td>
              <td class="text-right">
                <div class="global-stock-cell">
                  <strong class="stock-num">{{ item.total_stock }} {{ item.unit || 'UND' }}</strong>
                  <SemaforoDisponibilidadBadge
                    :status="item.status"
                    :quantity="item.total_stock"
                    :min-stock="item.min_stock"
                    size="sm"
                  />
                </div>
              </td>
              <td>
                <div class="branch-pills">
                  <div
                    v-for="bStock in item.branch_matrix"
                    :key="bStock.branch_id"
                    class="branch-pill"
                    :class="`status-${bStock.status}`"
                  >
                    <span class="b-name">{{ bStock.branch_name }}:</span>
                    <strong class="b-qty">{{ bStock.total_quantity }}</strong>
                  </div>
                </div>
              </td>
              <td class="text-right">
                <div class="action-buttons">
                  <button
                    type="button"
                    class="btn-action"
                    @click="openProductMatrix(item)"
                  >
                    Estantería
                  </button>
                  <button
                    type="button"
                    class="btn-action btn-action-outline"
                    @click="goToFullAvailability(item.id)"
                  >
                    Matriz Sedes
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer v-if="store.meta.last_page > 1" class="pagination-bar">
        <span class="page-info">
          Página {{ store.meta.current_page }} de {{ store.meta.last_page }} (Total:
          {{ store.meta.total }} registros)
        </span>
        <div class="page-controls">
          <button
            type="button"
            class="page-btn"
            :disabled="store.meta.current_page <= 1 || store.loading"
            @click="changePage(store.meta.current_page - 1)"
          >
            Anterior
          </button>
          <button
            type="button"
            class="page-btn"
            :disabled="store.meta.current_page >= store.meta.last_page || store.loading"
            @click="changePage(store.meta.current_page + 1)"
          >
            Siguiente
          </button>
        </div>
      </footer>
    </section>
  </main>
</template>

<style scoped>
.view-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 1.25rem;
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

.btn-refresh {
  padding: 0.45rem 0.9rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1e293b;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-refresh:hover:not(:disabled) {
  background-color: #f1f5f9;
}

.alert-error {
  padding: 0.85rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 0.65rem;
  font-size: 0.875rem;
}

.detail-panel {
  margin-top: 0.25rem;
}

.results-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.results-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-title {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
}

.results-count {
  margin: 0.2rem 0 0;
  font-size: 0.8125rem;
  color: #64748b;
}

.state-box {
  padding: 2.5rem 1rem;
  text-align: center;
  color: #64748b;
  font-size: 0.925rem;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.stock-table th,
.stock-table td {
  padding: 0.8rem 0.95rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  vertical-align: middle;
}

.stock-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.row-selected {
  background-color: #eff6ff;
}

.sku-badge {
  display: inline-block;
  font-family: monospace;
  font-weight: 700;
  color: #1e293b;
  background-color: #f1f5f9;
  padding: 0.18rem 0.45rem;
  border-radius: 0.25rem;
}

.sub-code,
.sub-meta {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.2rem;
}

.item-name {
  color: #0f172a;
}

.specs-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.spec-chip {
  padding: 0.15rem 0.5rem;
  font-size: 0.74rem;
  font-weight: 600;
  background-color: #f1f5f9;
  color: #334155;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.spec-volt {
  background-color: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.muted-text {
  color: #94a3b8;
  font-size: 0.78rem;
}

.text-right {
  text-align: right !important;
}

.global-stock-cell {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.stock-num {
  font-size: 0.95rem;
  color: #0f172a;
}

.branch-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.branch-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border-radius: 0.375rem;
  font-size: 0.76rem;
  border: 1px solid transparent;
}

.branch-pill.status-ok {
  background-color: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.branch-pill.status-low_stock {
  background-color: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}

.branch-pill.status-out_of_stock {
  background-color: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.action-buttons {
  display: inline-flex;
  gap: 0.4rem;
}

.btn-action {
  padding: 0.35rem 0.65rem;
  font-size: 0.76rem;
  font-weight: 600;
  border-radius: 0.375rem;
  cursor: pointer;
  background-color: #2563eb;
  color: #ffffff;
  border: 1px solid #2563eb;
  white-space: nowrap;
}

.btn-action:hover {
  background-color: #1d4ed8;
}

.btn-action-outline {
  background-color: #ffffff;
  color: #1e293b;
  border-color: #cbd5e1;
}

.btn-action-outline:hover {
  background-color: #f8fafc;
}

.pagination-bar {
  padding: 0.85rem 1.25rem;
  border-top: 1px solid #f1f5f9;
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
