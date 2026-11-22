<script setup>
const props = defineProps({
  alerts: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['inspect-availability', 'inspect-kardex'])

function calculateCoveragePercent(current, min) {
  const minVal = Number(min || 0)
  const curVal = Number(current || 0)
  if (minVal <= 0) return 0
  return Math.min(Math.round((curVal / minVal) * 100), 100)
}

function calculateDeficit(current, min) {
  const diff = Number(min || 0) - Number(current || 0)
  return diff > 0 ? diff : 0
}
</script>

<template>
  <div class="table-wrapper">
    <div v-if="loading" class="state-box">Cargando alertas de stock mínimo por sucursal...</div>

    <div v-else-if="props.alerts.length === 0" class="state-box empty-state">
      No se encontraron alertas de bajo stock para los filtros seleccionados.
    </div>

    <table v-else class="alerts-table">
      <thead>
        <tr>
          <th>Severidad</th>
          <th>SKU</th>
          <th>Componente Electrónico</th>
          <th>Sucursal</th>
          <th class="text-right">Stock Actual</th>
          <th class="text-right">Stock Mínimo</th>
          <th v-if="!compact">Nivel de Cobertura / Déficit</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="alert in props.alerts"
          :key="`${alert.product_id}-${alert.branch_id}`"
          :class="{ 'row-critical': alert.severity === 'critical' }"
        >
          <td>
            <span
              class="severity-pill"
              :class="alert.severity === 'critical' ? 'pill-critical' : 'pill-warning'"
            >
              {{ alert.severity === 'critical' ? 'CRÍTICO (Agotado)' : 'ADVERTENCIA (Bajo)' }}
            </span>
          </td>
          <td>
            <code class="sku-code">{{ alert.sku }}</code>
          </td>
          <td>
            <strong class="prod-name">{{ alert.name }}</strong>
          </td>
          <td>{{ alert.branch_name }}</td>
          <td class="text-right">
            <strong :class="alert.current_stock <= 0 ? 'text-danger' : 'text-warning'">
              {{ alert.current_stock }}
            </strong>
          </td>
          <td class="text-right">{{ alert.min_stock }}</td>
          <td v-if="!compact">
            <div class="coverage-cell">
              <div class="progress-track">
                <div
                  class="progress-fill"
                  :class="alert.severity === 'critical' ? 'fill-critical' : 'fill-warning'"
                  :style="{
                    width: `${calculateCoveragePercent(alert.current_stock, alert.min_stock)}%`,
                  }"
                ></div>
              </div>
              <small class="deficit-text">
                Faltan {{ calculateDeficit(alert.current_stock, alert.min_stock) }} und. para el
                mínimo
              </small>
            </div>
          </td>
          <td class="text-right">
            <div class="row-actions">
              <button
                type="button"
                class="action-btn"
                title="Consultar stock en otras sucursales para traslado"
                @click="emit('inspect-availability', alert.product_id)"
              >
                Otras Sedes
              </button>
              <button
                type="button"
                class="action-btn action-secondary"
                title="Ver historial Kardex del componente"
                @click="emit('inspect-kardex', alert)"
              >
                Kardex
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
}

.state-box {
  padding: 2.25rem 1rem;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}

.alerts-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.alerts-table th,
.alerts-table td {
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  vertical-align: middle;
}

.alerts-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.775rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.row-critical {
  background-color: #fffafa;
}

.severity-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.73rem;
  font-weight: 700;
  white-space: nowrap;
}

.pill-critical {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.pill-warning {
  background-color: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.sku-code {
  font-family: monospace;
  font-weight: 700;
  color: #1e293b;
  background: #f1f5f9;
  padding: 0.15rem 0.45rem;
  border-radius: 0.25rem;
}

.prod-name {
  color: #0f172a;
}

.text-right {
  text-align: right !important;
}

.text-danger {
  color: #dc2626;
}

.text-warning {
  color: #d97706;
}

.coverage-cell {
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.progress-track {
  height: 0.45rem;
  background-color: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
}

.fill-critical {
  background-color: #ef4444;
}

.fill-warning {
  background-color: #f59e0b;
}

.deficit-text {
  font-size: 0.725rem;
  color: #64748b;
}

.row-actions {
  display: inline-flex;
  gap: 0.4rem;
}

.action-btn {
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.375rem;
  cursor: pointer;
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  white-space: nowrap;
}

.action-btn:hover {
  background-color: #dbeafe;
}

.action-secondary {
  background-color: #f8fafc;
  color: #334155;
  border-color: #cbd5e1;
}

.action-secondary:hover {
  background-color: #f1f5f9;
}
</style>
