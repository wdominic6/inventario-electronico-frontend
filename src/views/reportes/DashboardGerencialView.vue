<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportesStore } from '@/stores/reportes.store'
import SubnavVentasReportes from '@/components/reportes/SubnavVentasReportes.vue'
import KpiResumenCards from '@/components/reportes/KpiResumenCards.vue'
import TablaAlertasStock from '@/components/reportes/TablaAlertasStock.vue'
import TablaRotacionAbc from '@/components/reportes/TablaRotacionAbc.vue'

const router = useRouter()
const store = useReportesStore()

onMounted(async () => {
  await refreshAllDashboardData()
})

async function refreshAllDashboardData() {
  await Promise.all([
    store.fetchDashboardSummary(),
    store.fetchLowStockAlerts({ per_page: 5, page: 1 }),
    store.fetchInventoryRotation({ per_page: 5, page: 1 }),
  ])
}

function goToAvailability(productId) {
  router.push({ name: 'consultas.disponibilidad', params: { productId } })
}

function goToKardex(payload) {
  const productId = typeof payload === 'object' ? payload.product_id : payload
  const branchId = typeof payload === 'object' ? payload.branch_id : undefined
  router.push({
    name: 'reportes.kardex',
    params: { productId },
    query: branchId ? { branch_id: branchId } : {},
  })
}
</script>

<template>
  <main class="view-page">
    <SubnavVentasReportes
      title="Panel de Control y Resumen Ejecutivo (Dashboard Gerencial)"
      subtitle="Indicadores estratégicos de valorización de inventario, alertas tempranas de desabastecimiento y rotación de componentes (RF07)."
      :last-updated-at="store.lastUpdatedAt"
    >
      <template #actions>
        <button
          type="button"
          class="btn-refresh"
          :disabled="store.loadingSummary"
          @click="refreshAllDashboardData"
        >
          {{ store.loadingSummary ? 'Sincronizando...' : 'Actualizar KPIs' }}
        </button>
      </template>
    </SubnavVentasReportes>

    <div v-if="store.error" class="alert-error" role="alert">
      <strong>Aviso:</strong> {{ store.error }}
    </div>

    <KpiResumenCards :summary="store.summary" :loading="store.loadingSummary" />

    <div class="dashboard-panels">
      <section class="panel-card">
        <header class="panel-header">
          <div>
            <h2 class="panel-title">Alertas Prioritarias de Stock Mínimo</h2>
            <p class="panel-subtitle">
              Componentes electrónicos que requieren reposición o traslado entre sucursales.
            </p>
          </div>
          <RouterLink to="/reportes/alertas" class="panel-link">
            Ver todas las alertas &rarr;
          </RouterLink>
        </header>

        <TablaAlertasStock
          :alerts="store.alerts.slice(0, 5)"
          :loading="store.loadingAlerts"
          compact
          @inspect-availability="goToAvailability"
          @inspect-kardex="goToKardex"
        />
      </section>

      <section class="panel-card">
        <header class="panel-header">
          <div>
            <h2 class="panel-title">Top Componentes de Mayor Rotación (Modelo ABC)</h2>
            <p class="panel-subtitle">
              Artículos con mayor volumen de entradas, salidas y traslados en los últimos 30 días.
            </p>
          </div>
          <RouterLink to="/reportes/rotacion" class="panel-link">
            Reporte ABC completo &rarr;
          </RouterLink>
        </header>

        <TablaRotacionAbc
          :items="store.rotationWithAbc.slice(0, 5)"
          :loading="store.loadingRotation"
          @inspect-kardex="goToKardex"
          @inspect-availability="goToAvailability"
        />
      </section>
    </div>
  </main>
</template>

<style scoped>
.view-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
  color: #ffffff;
  background-color: #2563eb;
  border: 1px solid #2563eb;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-refresh:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.alert-error {
  padding: 0.85rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 0.65rem;
  font-size: 0.875rem;
}

.dashboard-panels {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.panel-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.15rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.panel-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.panel-title {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
}

.panel-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.8125rem;
  color: #64748b;
}

.panel-link {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
}

.panel-link:hover {
  text-decoration: underline;
}
</style>
