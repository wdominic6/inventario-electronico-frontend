<script setup>
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useReportesStore } from '@/stores/reportes.store'
import SubnavVentasReportes from '@/components/reportes/SubnavVentasReportes.vue'
import TablaAlertasStock from '@/components/reportes/TablaAlertasStock.vue'

const router = useRouter()
const store = useReportesStore()

const localFilters = reactive({
  branch_id: store.alertFilters.branch_id || '',
  severity: store.alertFilters.severity || '',
  per_page: Number(store.alertFilters.per_page || 15),
})

onMounted(async () => {
  await store.loadCatalogs()
  await applyFilters()
})

async function applyFilters(page = 1) {
  await store.fetchLowStockAlerts({
    ...localFilters,
    page,
  })
}

async function resetFilters() {
  localFilters.branch_id = ''
  localFilters.severity = ''
  localFilters.per_page = 15
  await applyFilters(1)
}

function goToAvailability(productId) {
  router.push({ name: 'consultas.disponibilidad', params: { productId } })
}

function goToKardex(alertItem) {
  router.push({
    name: 'reportes.kardex',
    params: { productId: alertItem.product_id },
    query: { branch_id: alertItem.branch_id },
  })
}
</script>

<template>
  <section class="view-page">
    <SubnavVentasReportes
      title="Alertas Automáticas de Bajo Stock y Quiebre de Inventario"
      subtitle="Monitoreo de componentes electrónicos cuyo saldo actual es menor o igual al parámetro stock_minimo configurado por sucursal (RF07)."
      :last-updated-at="store.lastUpdatedAt"
    />

    <section class="summary-strip">
      <div class="stat-pill pill-total">
        <span>Total Alertas en Página:</span>
        <strong>{{ store.alerts.length }} (de {{ store.alertsMeta.total }})</strong>
      </div>
      <div class="stat-pill pill-critical">
        <span>Críticas (Stock = 0):</span>
        <strong>{{ store.criticalAlertsCount }}</strong>
      </div>
      <div class="stat-pill pill-warning">
        <span>Advertencias (Stock &le; Mínimo):</span>
        <strong>{{ store.warningAlertsCount }}</strong>
      </div>
    </section>

    <form class="filters-bar" @submit.prevent="applyFilters(1)">
      <div class="filter-field">
        <label for="alert-branch">Filtrar por Sucursal</label>
        <select id="alert-branch" v-model="localFilters.branch_id" @change="applyFilters(1)">
          <option value="">Todas las sucursales</option>
          <option v-for="branch in store.branches" :key="branch.id" :value="branch.id">
            {{ branch.name }}
          </option>
        </select>
      </div>

      <div class="filter-field">
        <label for="alert-severity">Nivel de Severidad</label>
        <select id="alert-severity" v-model="localFilters.severity" @change="applyFilters(1)">
          <option value="">Todas las severidades</option>
          <option value="critical">Crítico — Quiebre de stock (0 unidades)</option>
          <option value="warning">Advertencia — Por debajo o igual al stock mínimo</option>
        </select>
      </div>

      <div class="filter-field">
        <label for="alert-per-page">Registros por página</label>
        <select
          id="alert-per-page"
          v-model.number="localFilters.per_page"
          @change="applyFilters(1)"
        >
          <option :value="15">15 alertas</option>
          <option :value="30">30 alertas</option>
          <option :value="50">50 alertas</option>
        </select>
      </div>

      <div class="filter-actions">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="store.loadingAlerts"
          @click="resetFilters"
        >
          Restablecer
        </button>
        <button type="submit" class="btn btn-primary" :disabled="store.loadingAlerts">
          {{ store.loadingAlerts ? 'Filtrando...' : 'Aplicar filtro' }}
        </button>
      </div>
    </form>

    <div v-if="store.error" class="alert-error" role="alert">
      {{ store.error }}
    </div>

    <TablaAlertasStock
      :alerts="store.alerts"
      :loading="store.loadingAlerts"
      @inspect-availability="goToAvailability"
      @inspect-kardex="goToKardex"
    />

    <footer v-if="store.alertsMeta.last_page > 1" class="pagination-bar">
      <span class="page-info">
        Página {{ store.alertsMeta.current_page }} de {{ store.alertsMeta.last_page }} (Total:
        {{ store.alertsMeta.total }} alertas)
      </span>
      <div class="page-controls">
        <button
          type="button"
          class="page-btn"
          :disabled="store.alertsMeta.current_page <= 1 || store.loadingAlerts"
          @click="applyFilters(store.alertsMeta.current_page - 1)"
        >
          Anterior
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="
            store.alertsMeta.current_page >= store.alertsMeta.last_page || store.loadingAlerts
          "
          @click="applyFilters(store.alertsMeta.current_page + 1)"
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

.summary-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 0.6rem;
  font-size: 0.825rem;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
}

.pill-critical {
  background-color: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.pill-warning {
  background-color: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}

.filters-bar {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.filter-field {
  flex: 1 1 220px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-field label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
}

.filter-field select {
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
