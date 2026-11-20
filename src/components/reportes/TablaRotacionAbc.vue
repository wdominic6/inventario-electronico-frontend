<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['inspect-kardex', 'inspect-availability'])

function abcBadgeInfo(abcClass) {
  if (abcClass === 'A') {
    return {
      label: 'Clase A · Alta Rotación',
      css: 'abc-a',
    }
  }
  if (abcClass === 'B') {
    return {
      label: 'Clase B · Rotación Media',
      css: 'abc-b',
    }
  }
  return {
    label: 'Clase C · Baja Rotación',
    css: 'abc-c',
  }
}
</script>

<template>
  <div class="rotation-wrapper">
    <div v-if="loading" class="state-box">Calculando métricas de rotación y clasificación ABC...</div>

    <div v-else-if="props.items.length === 0" class="state-box">
      No se registraron movimientos de inventario en el rango de fechas seleccionado.
    </div>

    <table v-else class="rotation-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Clasificación ABC</th>
          <th>SKU</th>
          <th>Componente Electrónico</th>
          <th>Categoría</th>
          <th class="text-right">N.º Operaciones</th>
          <th class="text-right">Unidades Movilizadas</th>
          <th>Volumen Relativo / % Acumulado</th>
          <th class="text-right">Detalle</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in props.items" :key="row.product_id">
          <td class="rank-cell">{{ row.rank }}</td>
          <td>
            <span class="abc-pill" :class="abcBadgeInfo(row.abc_class).css">
              {{ abcBadgeInfo(row.abc_class).label }}
            </span>
          </td>
          <td>
            <code class="sku-code">{{ row.sku }}</code>
          </td>
          <td>
            <strong class="prod-name">{{ row.name }}</strong>
          </td>
          <td>{{ row.category || 'Sin categoría' }}</td>
          <td class="text-right">{{ row.movement_count }}</td>
          <td class="text-right">
            <strong>{{ row.quantity_moved }}</strong>
          </td>
          <td>
            <div class="volume-cell">
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :class="abcBadgeInfo(row.abc_class).css"
                  :style="{ width: `${row.bar_width_percent}%` }"
                ></div>
              </div>
              <small class="share-caption">
                {{ row.share_percent }}% del total (Acum.: {{ row.cumulative_percent }}%)
              </small>
            </div>
          </td>
          <td class="text-right">
            <div class="actions-cell">
              <button
                type="button"
                class="btn-mini"
                @click="emit('inspect-kardex', row.product_id)"
              >
                Kardex
              </button>
              <button
                type="button"
                class="btn-mini btn-mini-alt"
                @click="emit('inspect-availability', row.product_id)"
              >
                Stock
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.rotation-wrapper {
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

.rotation-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.rotation-table th,
.rotation-table td {
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  vertical-align: middle;
}

.rotation-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.775rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.rank-cell {
  font-weight: 700;
  color: #64748b;
}

.abc-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.73rem;
  font-weight: 700;
  white-space: nowrap;
}

.abc-a {
  background-color: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.bar-fill.abc-a {
  background-color: #10b981;
  border: none;
}

.abc-b {
  background-color: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.bar-fill.abc-b {
  background-color: #3b82f6;
  border: none;
}

.abc-c {
  background-color: #f8fafc;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.bar-fill.abc-c {
  background-color: #94a3b8;
  border: none;
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

.volume-cell {
  min-width: 170px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bar-track {
  height: 0.45rem;
  background-color: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 9999px;
}

.share-caption {
  font-size: 0.725rem;
  color: #64748b;
}

.actions-cell {
  display: inline-flex;
  gap: 0.35rem;
}

.btn-mini {
  padding: 0.3rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.375rem;
  cursor: pointer;
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.btn-mini-alt {
  background-color: #f8fafc;
  color: #334155;
  border-color: #cbd5e1;
}
</style>
