<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConsultasStore } from '@/stores/consultas.store'
import SubnavVentasReportes from '@/components/reportes/SubnavVentasReportes.vue'
import MatrizDisponibilidadSucursales from '@/components/consultas/MatrizDisponibilidadSucursales.vue'
import SemaforoDisponibilidadBadge from '@/components/consultas/SemaforoDisponibilidadBadge.vue'

const route = useRoute()
const router = useRouter()
const store = useConsultasStore()

const selectedProductId = ref(route.params.productId ? String(route.params.productId) : '')
const activeBranchId = ref('')
const branchSearchTerm = ref('')

const activeBranch = computed(() =>
  store.branches.find((b) => Number(b.id) === Number(activeBranchId.value)),
)

onMounted(async () => {
  await store.loadFilterCatalogs()
  if (store.items.length === 0) {
    await store.fetchStockSearch({ per_page: 50 })
  }

  if (selectedProductId.value) {
    await store.fetchProductAvailability(selectedProductId.value)
  } else if (store.items.length > 0) {
    selectedProductId.value = String(store.items[0].id)
    await store.fetchProductAvailability(selectedProductId.value)
  }

  if (store.branches.length > 0) {
    activeBranchId.value = String(store.branches[0].id)
    await loadBranchStock()
  }
})

watch(
  () => route.params.productId,
  async (newId) => {
    if (newId && String(newId) !== selectedProductId.value) {
      selectedProductId.value = String(newId)
      await store.fetchProductAvailability(selectedProductId.value)
    }
  },
)

async function handleSelectProduct() {
  if (!selectedProductId.value) return
  router.replace({
    name: 'consultas.disponibilidad',
    params: { productId: selectedProductId.value },
  })
  await store.fetchProductAvailability(selectedProductId.value)
}

async function loadBranchStock() {
  if (!activeBranchId.value) return
  const params = { per_page: 20 }
  if (branchSearchTerm.value.trim().length >= 2) {
    params.q = branchSearchTerm.value.trim()
  }
  await store.fetchStockByBranch(activeBranchId.value, params)
}

function inspectProductFromBranchTable(product) {
  selectedProductId.value = String(product.id)
  handleSelectProduct()
}

function goToKardex(productId) {
  router.push({ name: 'reportes.kardex', params: { productId } })
}
</script>

<template>
  <main class="view-page">
    <SubnavVentasReportes
      title="Disponibilidad Cruzada entre Sucursales y Estanterías"
      subtitle="Verificación en tiempo real de existencias por sede, estante (shelf), nivel (level) y casillero (bin) para atención de pedidos sin sobreventas."
      :last-updated-at="store.lastUpdatedAt"
    />

    <section class="selector-card">
      <div class="selector-grid">
        <div class="field-col">
          <label for="avail-product">Componente electrónico a inspeccionar en todas las sedes</label>
          <select id="avail-product" v-model="selectedProductId" @change="handleSelectProduct">
            <option value="">-- Seleccione un componente del catálogo --</option>
            <option v-for="prod in store.items" :key="prod.id" :value="String(prod.id)">
              [{{ prod.sku }}] {{ prod.name }} — Stock Global: {{ prod.total_stock }}
            </option>
          </select>
        </div>

        <div class="field-actions">
          <button
            type="button"
            class="btn-primary"
            :disabled="!selectedProductId || store.availabilityLoading"
            @click="handleSelectProduct"
          >
            {{ store.availabilityLoading ? 'Verificando...' : 'Actualizar Matriz Cruzada' }}
          </button>
        </div>
      </div>
    </section>

    <div v-if="store.error" class="alert-error" role="alert">
      {{ store.error }}
    </div>

    <MatrizDisponibilidadSucursales
      :availability="store.selectedProductAvailability"
      :loading="store.availabilityLoading"
      :highlight-branch-id="activeBranchId"
      @close="store.clearAvailability()"
      @view-kardex="goToKardex"
    />

    <section class="branch-inventory-card">
      <header class="branch-inv-header">
        <div>
          <h2 class="section-title">
            Inventario Detallado por Sucursal
            <span v-if="activeBranch">· {{ activeBranch.name }}</span>
          </h2>
          <p class="section-subtitle">
            Consulte todos los componentes almacenados en una sede específica y sus ubicaciones en
            estantería.
          </p>
        </div>

        <form class="branch-filter-bar" @submit.prevent="loadBranchStock">
          <select v-model="activeBranchId" aria-label="Seleccionar sucursal" @change="loadBranchStock">
            <option v-for="branch in store.branches" :key="branch.id" :value="String(branch.id)">
              {{ branch.name }} ({{ branch.code }})
            </option>
          </select>

          <input
            v-model="branchSearchTerm"
            type="search"
            placeholder="Filtrar SKU o nombre (mín. 2 car.)..."
          />

          <button type="submit" class="btn-secondary" :disabled="store.branchInventoryLoading">
            Filtrar Sede
          </button>
        </form>
      </header>

      <div v-if="store.branchInventoryLoading" class="state-box">
        Cargando inventario físico de la sucursal seleccionada...
      </div>

      <div v-else-if="store.branchInventoryItems.length === 0" class="state-box">
        No se encontraron componentes registrados para esta sucursal con el filtro aplicado.
      </div>

      <div v-else class="table-responsive">
        <table class="branch-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Componente Electrónico</th>
              <th>Categoría</th>
              <th>Encapsulado / Voltaje</th>
              <th class="text-right">Stock Global</th>
              <th>Ubicaciones en esta Sucursal</th>
              <th class="text-right">Inspección</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prod in store.branchInventoryItems" :key="prod.id">
              <td>
                <code class="sku-code">{{ prod.sku }}</code>
              </td>
              <td>
                <strong>{{ prod.name }}</strong>
              </td>
              <td>{{ prod.category?.name || '-' }}</td>
              <td>
                <span>{{ prod.package_type || prod.specs?.package_type || '-' }}</span>
                <span v-if="prod.voltage || prod.specs?.voltage">
                  · {{ prod.voltage || prod.specs?.voltage }}
                </span>
              </td>
              <td class="text-right">
                <SemaforoDisponibilidadBadge
                  :quantity="Number(prod.total_stock || 0)"
                  :min-stock="Number(prod.min_stock || 0)"
                  size="sm"
                />
              </td>
              <td>
                <div class="loc-chips">
                  <template
                    v-for="bEntry in (prod.stocks_by_branch || []).filter(
                      (b) => Number(b.branch_id) === Number(activeBranchId),
                    )"
                    :key="bEntry.branch_id"
                  >
                    <span
                      v-for="loc in bEntry.locations"
                      :key="loc.location_id"
                      class="loc-chip"
                    >
                      Est. {{ loc.shelf }} / {{ loc.level }} / {{ loc.bin }}:
                      <strong>{{ loc.quantity }}</strong>
                    </span>
                  </template>
                </div>
              </td>
              <td class="text-right">
                <button
                  type="button"
                  class="btn-inspect"
                  @click="inspectProductFromBranchTable(prod)"
                >
                  Comparar Sedes
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

.selector-card,
.branch-inventory-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.15rem 1.25rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.selector-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
}

.field-col {
  flex: 1 1 360px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-col label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
}

.field-col select,
.branch-filter-bar select,
.branch-filter-bar input {
  padding: 0.55rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #0f172a;
  background-color: #f8fafc;
}

.btn-primary,
.btn-secondary {
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
  background-color: #f1f5f9;
  color: #1e293b;
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

.branch-inv-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.section-title {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
}

.section-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: #64748b;
}

.branch-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.state-box {
  padding: 2rem 1rem;
  text-align: center;
  color: #64748b;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  margin-top: 0.75rem;
}

.branch-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
}

.branch-table th,
.branch-table td {
  padding: 0.7rem 0.85rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
}

.branch-table th {
  background-color: #f8fafc;
  color: #475569;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.sku-code {
  font-family: monospace;
  font-weight: 700;
  background: #f1f5f9;
  padding: 0.15rem 0.45rem;
  border-radius: 0.25rem;
}

.loc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.loc-chip {
  font-size: 0.75rem;
  padding: 0.18rem 0.5rem;
  background-color: #eff6ff;
  color: #1e40af;
  border-radius: 0.375rem;
}

.text-right {
  text-align: right !important;
}

.btn-inspect {
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1d4ed8;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.375rem;
  cursor: pointer;
}
</style>
