<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useReportesStore } from '@/stores/reportes.store'
import SubnavVentasReportes from '@/components/reportes/SubnavVentasReportes.vue'
import TablaRotacionAbc from '@/components/reportes/TablaRotacionAbc.vue'

const router = useRouter()
const store = useReportesStore()

const localFilters = reactive({
  branch_id: store.rotationFilters.branch_id || '',
  date_from: store.rotationFilters.date_from || '',
  date_to: store.rotationFilters.date_to || '',
  per_page: Number(store.rotationFilters.per_page || 20),
})

const abcStats = computed(() => {
  const list = store.rotationWithAbc
  return {
    classA: list.filter((item) => item.abc_class === 'A').length,
    classB: list.filter((item) => item.abc_class === 'B').length,
    classC: list.filter((item) => item.abc_class === 'C').length,
    totalMoved: list.reduce((sum, item) => sum + Number(item.quantity_moved || 0), 0),
  }
})

onMounted(async () => {
  await store.loadCatalogs()
  await applyRotationFilters(1)
})

async function applyRotationFilters(page = 1) {
  await store.fetchInventoryRotation({
    ...localFilters,
    page,
  })
}

async function resetRotationFilters() {
  localFilters.branch_id = ''
  localFilters.date_from = ''
  localFilters.date_to = ''
  localFilters.per_page = 20
  await applyRotationFilters(1)
}

function goToKardex(productId) {
  router.push({
    name: 'reportes.kardex',
    params: { productId },
    query: localFilters.branch_id ? { branch_id: localFilters.branch_id } : {},
  })
}

function goToAvailability(productId) {
  router.push({ name: 'consultas.disponibilidad', params: { productId } })
}
</script>

<template>
  <section class="view-page">
    <SubnavVentasReportes
      title="Reporte de Rotación de Inventario y Clasificación ABC"
      subtitle="Análisis de componentes electrónicos de mayor y menor movimiento por sucursal y rango de fechas para decisiones de abastecimiento (RF07)."
      :last-updated-at="store.lastUpdatedAt"
    />

    <section class="abc-summary-grid">
      <div class="abc-box box-a">
        <span class="abc-box-title">Clase A · Alta Rotación (0%–80% Vol.)</span>
        <strong>{{ abcStats.classA }} componentes</strong>
        <small>Artículos críticos de abastecimiento continuo</small>
      </div>
      <div class="abc-box box-b">
        <span class="abc-box-title">Clase B · Rotación Media (80%–95% Vol.)</span>
        <strong>{{ abcStats.classB }} componentes</strong>
        <small>Reposición periódica moderada</small>
      </div>
      <div class="abc-box box-c">
        <span class="abc-box-title">Clase C · Baja Rotación (95%–100% Vol.)</span>
        <strong>{{ abcStats.classC }} componentes</strong>
        <small>Control de sobrestock e inmovilización</small>
      </div>
      <div class="abc-box box-total">
        <span class="abc-box-title">Volumen Total Movilizado (Página)</span>
        <strong>{{ abcStats.totalMoved.toLocaleString('es-PE') }} unidades</strong>
        <small>Entradas, salidas y transferencias registradas</small>
      </div>
    </section>

    <form class="filters-bar" @submit.prevent="applyRotationFilters(1)">
      <div class="filter-field">
        <label for="rot-branch">Sucursal</label>
        <select id="rot-branch" v-model="localFilters.branch_id" @change="applyRotationFilters(1)">
          <option value="">Consolidado (Todas las sucursales)</option>
          <option v-for="branch in store.branches" :key="branch.id" :value="branch.id">
            {{ branch.name }}
          </option>
        </select>
      </div>

      <div class="filter-field">
        <label for="rot-from">Fecha Desde</label>
        <input id="rot-from" v-model="localFilters.date_from" type="date" />
      </div>

      <div class="filter-field">
        <label for="rot-to">Fecha Hasta</label>
        <input id="rot-to" v-model="localFilters.date_to" type="date" />
      </div>

      <div class="filter-field">
        <label for="rot-per-page">Componentes por página</label>
        <select
          id="rot-per-page"
          v-model.number="localFilters.per_page"
          @change="applyRotationFilters(1)"
        >
          <option :value="15">15 componentes</option>
          <option :value="20">20 componentes</option>
          <option :value="50">50 componentes</option>
        </select>
      </div>

      <div class="filter-actions">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="store.loadingRotation"
          @click="resetRotationFilters"
        >
          Últimos 30 días
        </button>
        <button type="submit" class="btn btn-primary" :disabled="store.loadingRotation">
          {{ store.loadingRotation ? 'Calculando...' : 'Generar Reporte' }}
        </button>
      </div>
    </form>

    <div v-if="store.error" class="alert-error" role="alert">
      {{ store.error }}
    </div>

    <TablaRotacionAbc
      :items="store.rotationWithAbc"
      :loading="store.loadingRotation"
      @inspect-kardex="goToKardex"
      @inspect-availability="goToAvailability"
    />

    <footer v-if="store.rotationMeta.last_page > 1" class="pagination-bar">
      <span class="page-info">
        Página {{ store.rotationMeta.current_page }} de {{ store.rotationMeta.last_page }} (Total:
        {{ store.rotationMeta.total }} componentes con movimiento)
      </span>
      <div class="page-controls">
        <button
          type="button"
          class="page-btn"
          :disabled="store.rotationMeta.current_page <= 1 || store.loadingRotation"
          @click="applyRotationFilters(store.rotationMeta.current_page - 1)"
        >
          Anterior
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="
            store.rotationMeta.current_page >= store.rotationMeta.last_page || store.loadingRotation
          "
          @click="applyRotationFilters(store.rotationMeta.current_page + 1)"
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

.abc-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.9rem;
}

.abc-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #64748b;
  border-radius: 0.75rem;
  padding: 0.95rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.abc-box-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
}

.abc-box strong {
  font-size: 1.25rem;
  color: #0f172a;
}

.abc-box small {
  font-size: 0.75rem;
  color: #475569;
}

.box-a {
  border-left-color: #10b981;
}

.box-b {
  border-left-color: #3b82f6;
}

.box-c {
  border-left-color: #94a3b8;
}

.box-total {
  border-left-color: #4f46e5;
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
  flex: 1 1 190px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
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
