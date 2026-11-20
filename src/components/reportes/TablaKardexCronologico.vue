<script setup>
defineProps({
  movements: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

function formatDateTime(raw) {
  if (!raw) return '-'
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return String(raw)
  return parsed.toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function movementVariant(row) {
  const factor = Number(row.factor ?? 1)
  const typeName = String(row.type || '').toLowerCase()

  if (typeName.includes('traslado')) {
    return factor < 0 ? 'type-transfer-out' : 'type-transfer-in'
  }
  return factor < 0 ? 'type-exit' : 'type-entry'
}

function formatSignedQuantity(row) {
  const factor = Number(row.factor ?? 1)
  const qty = Number(row.quantity ?? 0)
  return factor < 0 ? `-${qty}` : `+${qty}`
}
</script>

<template>
  <div class="kardex-wrapper">
    <div v-if="loading" class="state-box">Consultando historial inmutable del Kardex...</div>

    <div v-else-if="movements.length === 0" class="state-box">
      No se encontraron registros en el Kardex para este componente con los filtros indicados.
    </div>

    <table v-else class="kardex-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha y Hora</th>
          <th>Tipo de Operación</th>
          <th>Sucursal</th>
          <th>Ubicación Física (Estante / Nivel / Casillero)</th>
          <th class="text-right">Saldo Previo</th>
          <th class="text-right">Variación</th>
          <th class="text-right">Saldo Resultante</th>
          <th>Responsable</th>
          <th>Observación / Referencia</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="mov in movements" :key="mov.id">
          <td class="id-cell">#{{ mov.id }}</td>
          <td class="date-cell">{{ formatDateTime(mov.created_at) }}</td>
          <td>
            <span class="type-pill" :class="movementVariant(mov)">
              {{ mov.type }}
            </span>
          </td>
          <td>{{ mov.branch?.name || '-' }}</td>
          <td>
            <span v-if="mov.location" class="location-tag">
              Est. {{ mov.location.shelf }} · Niv. {{ mov.location.level }} · Cas.
              {{ mov.location.bin }}
            </span>
            <span v-else>-</span>
          </td>
          <td class="text-right">{{ mov.previous_stock }}</td>
          <td class="text-right">
            <strong :class="Number(mov.factor) < 0 ? 'delta-neg' : 'delta-pos'">
              {{ formatSignedQuantity(mov) }}
            </strong>
          </td>
          <td class="text-right">
            <strong class="resulting-stock">{{ mov.resulting_stock }}</strong>
          </td>
          <td>{{ mov.user?.name || '-' }}</td>
          <td class="notes-cell">{{ mov.notes || 'Sin observación' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.kardex-wrapper {
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

.kardex-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.835rem;
}

.kardex-table th,
.kardex-table td {
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  vertical-align: middle;
}

.kardex-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.id-cell {
  font-family: monospace;
  color: #64748b;
  font-weight: 600;
}

.date-cell {
  white-space: nowrap;
  color: #334155;
}

.type-pill {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.73rem;
  font-weight: 700;
  white-space: nowrap;
}

.type-entry {
  background-color: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.type-exit {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.type-transfer-in {
  background-color: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.type-transfer-out {
  background-color: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.location-tag {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  background-color: #f1f5f9;
  color: #334155;
  border-radius: 0.375rem;
  font-size: 0.76rem;
  font-weight: 600;
  white-space: nowrap;
}

.text-right {
  text-align: right !important;
}

.delta-pos {
  color: #059669;
}

.delta-neg {
  color: #dc2626;
}

.resulting-stock {
  color: #0f172a;
  font-size: 0.925rem;
}

.notes-cell {
  color: #475569;
  max-width: 240px;
}
</style>
