<script setup>
import { computed } from 'vue'
import SemaforoDisponibilidadBadge from '@/components/consultas/SemaforoDisponibilidadBadge.vue'

const props = defineProps({
  availability: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  highlightBranchId: {
    type: [Number, String],
    default: '',
  },
})

const emit = defineEmits(['close', 'view-kardex'])

const product = computed(() => props.availability?.product || null)
const branches = computed(() => props.availability?.branches || [])

const formattedSpecs = computed(() => {
  if (!product.value) return []
  const specs = product.value.specs || {}
  const entries = []

  if (product.value.package_type || specs.package_type) {
    entries.push({ label: 'Encapsulado', value: product.value.package_type || specs.package_type })
  }
  if (product.value.voltage || specs.voltage) {
    entries.push({ label: 'Voltaje Op.', value: product.value.voltage || specs.voltage })
  }
  if (product.value.tolerance || specs.tolerance) {
    entries.push({ label: 'Tolerancia', value: product.value.tolerance || specs.tolerance })
  }

  Object.entries(specs).forEach(([key, val]) => {
    if (['package_type', 'voltage', 'tolerance'].includes(key) || val === null || val === '') {
      return
    }
    entries.push({
      label: key.replace(/_/g, ' '),
      value: typeof val === 'object' ? JSON.stringify(val) : String(val),
    })
  })

  return entries
})
</script>

<template>
  <section class="matriz-container">
    <div v-if="loading" class="loading-box">
      Consultando disponibilidad cruzada en sucursales y estanterías...
    </div>

    <div v-else-if="!product" class="empty-box">
      Seleccione un componente electrónico de la tabla para inspeccionar su ubicación física exacta
      (estante, nivel y casillero) en todas las sucursales.
    </div>

    <template v-else>
      <header class="matriz-header">
        <div class="product-headline">
          <div class="sku-row">
            <span class="sku-tag">{{ product.sku }}</span>
            <span v-if="product.barcode" class="barcode-tag">EAN: {{ product.barcode }}</span>
            <span v-if="product.category?.name" class="category-tag">
              {{ product.category.name }}
            </span>
          </div>
          <h3 class="product-title">{{ product.name }}</h3>
          <p class="product-meta">
            <span v-if="product.brand"><strong>Fabricante:</strong> {{ product.brand }}</span>
            <span v-if="product.model"> · <strong>Modelo:</strong> {{ product.model }}</span>
            <span> · <strong>Stock Mínimo por Sede:</strong> {{ product.min_stock }} {{ product.unit }}</span>
          </p>
        </div>

        <div class="header-summary">
          <div class="total-stock-card">
            <span class="total-label">Existencia Global</span>
            <strong class="total-number">{{ product.total_stock }} {{ product.unit }}</strong>
            <SemaforoDisponibilidadBadge
              :status="product.overall_status"
              :quantity="product.total_stock"
              :min-stock="product.min_stock"
              size="sm"
            />
          </div>

          <div class="header-actions">
            <button
              type="button"
              class="btn-link"
              @click="emit('view-kardex', product.id)"
            >
              Ver Kardex
            </button>
            <button
              type="button"
              class="btn-close"
              aria-label="Cerrar detalle"
              @click="emit('close')"
            >
              Cerrar
            </button>
          </div>
        </div>
      </header>

      <div v-if="formattedSpecs.length > 0" class="specs-strip">
        <div v-for="spec in formattedSpecs" :key="spec.label" class="spec-pill">
          <span class="spec-label">{{ spec.label }}:</span>
          <strong class="spec-value">{{ spec.value }}</strong>
        </div>
      </div>

      <div class="branches-grid">
        <article
          v-for="branch in branches"
          :key="branch.branch_id"
          class="branch-card"
          :class="{
            highlighted: Number(highlightBranchId) === Number(branch.branch_id),
            'branch-empty': branch.total_quantity <= 0,
          }"
        >
          <div class="branch-card-header">
            <div>
              <span class="branch-code">{{ branch.branch_code }}</span>
              <h4 class="branch-name">{{ branch.branch_name }}</h4>
              <p v-if="branch.address" class="branch-address">{{ branch.address }}</p>
            </div>
            <div class="branch-status-col">
              <strong class="branch-qty">{{ branch.total_quantity }} {{ product.unit }}</strong>
              <SemaforoDisponibilidadBadge
                :status="branch.status"
                :quantity="branch.total_quantity"
                :min-stock="branch.min_stock"
                size="sm"
              />
            </div>
          </div>

          <div class="locations-section">
            <h5 class="locations-title">Ubicación Física en Estantería (Estante / Nivel / Casillero)</h5>

            <table v-if="branch.locations && branch.locations.length > 0" class="locations-table">
              <thead>
                <tr>
                  <th>Estante (Shelf)</th>
                  <th>Nivel (Level)</th>
                  <th>Casillero (Bin)</th>
                  <th class="text-right">Stock Físico</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="loc in branch.locations" :key="loc.location_id">
                  <td>
                    <span class="loc-badge">Estante {{ loc.shelf }}</span>
                  </td>
                  <td>{{ loc.level }}</td>
                  <td>{{ loc.bin }}</td>
                  <td class="text-right">
                    <strong :class="{ 'zero-qty': loc.quantity <= 0 }">
                      {{ loc.quantity }} {{ product.unit }}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>

            <p v-else class="no-location-msg">
              Sin unidades asignadas a ubicaciones de estantería en esta sucursal.
            </p>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>

<style scoped>
.matriz-container {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.loading-box,
.empty-box {
  padding: 2rem 1rem;
  text-align: center;
  color: #64748b;
  font-size: 0.925rem;
}

.matriz-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.sku-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.sku-tag {
  background-color: #1e293b;
  color: #f8fafc;
  font-family: monospace;
  font-size: 0.775rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 0.375rem;
}

.barcode-tag,
.category-tag {
  background-color: #f1f5f9;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 0.375rem;
}

.product-title {
  margin: 0 0 0.35rem;
  font-size: 1.15rem;
  color: #0f172a;
}

.product-meta {
  margin: 0;
  font-size: 0.825rem;
  color: #475569;
}

.header-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.total-stock-card {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
  background-color: #f8fafc;
  padding: 0.6rem 0.9rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.total-label {
  font-size: 0.725rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.total-number {
  font-size: 1.25rem;
  color: #0f172a;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.btn-link,
.btn-close {
  padding: 0.4rem 0.75rem;
  font-size: 0.785rem;
  font-weight: 600;
  border-radius: 0.375rem;
  cursor: pointer;
}

.btn-link {
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.btn-close {
  background-color: #f8fafc;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.specs-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.9rem;
  padding: 0.65rem 0.85rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
}

.spec-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.785rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 0.2rem 0.6rem;
  border-radius: 0.375rem;
}

.spec-label {
  color: #64748b;
  text-transform: capitalize;
}

.spec-value {
  color: #0f172a;
}

.branches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.branch-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.65rem;
  padding: 1rem;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.branch-card.highlighted {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.branch-card.branch-empty {
  background-color: #fafafa;
}

.branch-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.branch-code {
  font-size: 0.7rem;
  font-weight: 700;
  color: #2563eb;
  text-transform: uppercase;
}

.branch-name {
  margin: 0.15rem 0;
  font-size: 0.975rem;
  color: #0f172a;
}

.branch-address {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

.branch-status-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}

.branch-qty {
  font-size: 1.05rem;
  color: #0f172a;
}

.locations-title {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #64748b;
}

.locations-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.locations-table th,
.locations-table td {
  padding: 0.45rem 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
}

.locations-table th {
  font-weight: 600;
  color: #475569;
  background-color: #f8fafc;
}

.loc-badge {
  display: inline-block;
  padding: 0.12rem 0.45rem;
  background-color: #eff6ff;
  color: #1e40af;
  border-radius: 0.25rem;
  font-weight: 600;
}

.text-right {
  text-align: right !important;
}

.zero-qty {
  color: #dc2626;
}

.no-location-msg {
  margin: 0;
  font-size: 0.8rem;
  color: #94a3b8;
  font-style: italic;
}
</style>
