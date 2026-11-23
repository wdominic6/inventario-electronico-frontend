<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  branches: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  autoRefresh: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'search', 'reset', 'toggle-auto-refresh'])

const PACKAGE_PRESETS = [
  'SMD 0805',
  'SMD 0603',
  'SMD 1206',
  'DIP-8',
  'DIP-14',
  'DIP-16',
  'DIP-28',
  'TO-220',
  'TO-92',
  'SOT-223',
  'QFN-56',
  'LQFP-48',
  'THT',
  'Módulo PCB',
]

const VOLTAGE_PRESETS = ['3.3V', '5V', '3.3V - 5V', '9V', '12V', '24V', '50V', '250V']

const localFilters = reactive({
  q: props.modelValue.q || '',
  category_id: props.modelValue.category_id || '',
  branch_id: props.modelValue.branch_id || '',
  package_type: props.modelValue.package_type || '',
  voltage: props.modelValue.voltage || '',
  only_available: Boolean(props.modelValue.only_available),
  per_page: Number(props.modelValue.per_page || 15),
})

watch(
  () => props.modelValue,
  (nextValue) => {
    if (!nextValue) return
    localFilters.q = nextValue.q ?? ''
    localFilters.category_id = nextValue.category_id ?? ''
    localFilters.branch_id = nextValue.branch_id ?? ''
    localFilters.package_type = nextValue.package_type ?? ''
    localFilters.voltage = nextValue.voltage ?? ''
    localFilters.only_available = Boolean(nextValue.only_available)
    localFilters.per_page = Number(nextValue.per_page || 15)
  },
  { deep: true },
)

function submitSearch() {
  const payload = {
    ...props.modelValue,
    ...localFilters,
    page: 1,
  }
  emit('update:modelValue', payload)
  emit('search', payload)
}

function handleReset() {
  localFilters.q = ''
  localFilters.category_id = ''
  localFilters.branch_id = ''
  localFilters.package_type = ''
  localFilters.voltage = ''
  localFilters.only_available = false
  localFilters.per_page = 15
  emit('reset')
}

function applyPackagePreset(pkg) {
  localFilters.package_type = localFilters.package_type === pkg ? '' : pkg
  submitSearch()
}
</script>

<template>
  <form class="filtros-card" @submit.prevent="submitSearch">
    <div class="filtros-grid">
      <div class="field-group field-search">
        <label for="stock-q">Búsqueda técnica (SKU, código de barras, nombre o modelo)</label>
        <div class="input-with-hint">
          <input
            id="stock-q"
            v-model="localFilters.q"
            type="search"
            placeholder="Ej. RES-10K, ATmega328P, ESP32, 775001..."
            autocomplete="off"
          />
          <small class="hint">Mínimo 2 caracteres para búsqueda textual (RF03).</small>
        </div>
      </div>

      <div class="field-group">
        <label for="stock-category">Categoría electrónica</label>
        <select id="stock-category" v-model="localFilters.category_id" @change="submitSearch">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.code_prefix ? `${cat.name} (${cat.code_prefix})` : cat.name }}
          </option>
        </select>
      </div>

      <div class="field-group">
        <label for="stock-branch">Sucursal / Almacén</label>
        <select id="stock-branch" v-model="localFilters.branch_id" @change="submitSearch">
          <option value="">Todas las sucursales</option>
          <option v-for="branch in branches" :key="branch.id" :value="branch.id">
            {{ branch.name }}
          </option>
        </select>
      </div>

      <div class="field-group">
        <label for="stock-package">Encapsulado (Package)</label>
        <input
          id="stock-package"
          v-model="localFilters.package_type"
          type="text"
          list="package-presets-list"
          placeholder="Ej. SMD 0805, DIP-8, TO-220"
        />
        <datalist id="package-presets-list">
          <option v-for="pkg in PACKAGE_PRESETS" :key="pkg" :value="pkg" />
        </datalist>
      </div>

      <div class="field-group">
        <label for="stock-voltage">Voltaje de operación</label>
        <input
          id="stock-voltage"
          v-model="localFilters.voltage"
          type="text"
          list="voltage-presets-list"
          placeholder="Ej. 3.3V, 5V, 12V, 50V"
        />
        <datalist id="voltage-presets-list">
          <option v-for="volt in VOLTAGE_PRESETS" :key="volt" :value="volt" />
        </datalist>
      </div>

      <div class="field-group">
        <label for="stock-per-page">Registros por página</label>
        <select id="stock-per-page" v-model.number="localFilters.per_page" @change="submitSearch">
          <option :value="10">10 componentes</option>
          <option :value="15">15 componentes</option>
          <option :value="30">30 componentes</option>
          <option :value="50">50 componentes</option>
        </select>
      </div>
    </div>

    <div class="quick-chips-row">
      <span class="chips-label">Encapsulados frecuentes:</span>
      <button
        v-for="pkg in ['SMD 0805', 'DIP-8', 'DIP-28', 'TO-220', 'TO-92', 'THT']"
        :key="pkg"
        type="button"
        class="chip-btn"
        :class="{ active: localFilters.package_type === pkg }"
        @click="applyPackagePreset(pkg)"
      >
        {{ pkg }}
      </button>
    </div>

    <div class="filtros-actions">
      <div class="toggles-group">
        <label class="checkbox-label">
          <input v-model="localFilters.only_available" type="checkbox" @change="submitSearch" />
          <span>Mostrar solo con stock disponible (&gt; 0)</span>
        </label>

        <label class="checkbox-label">
          <input
            :checked="autoRefresh"
            type="checkbox"
            @change="emit('toggle-auto-refresh', $event.target.checked)"
          />
          <span>Sincronización automática en tiempo real (cada 20s)</span>
        </label>
      </div>

      <div class="buttons-group">
        <button type="button" class="btn btn-secondary" :disabled="loading" @click="handleReset">
          Limpiar filtros
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Consultando...' : 'Buscar disponibilidad' }}
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.filtros-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.9rem;
}

.field-search {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .field-search {
    grid-column: span 1;
  }
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-group label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
}

.field-group input,
.field-group select {
  width: 100%;
  box-sizing: border-box;
  padding: 0.55rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #0f172a;
  background-color: #f8fafc;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.field-group input:focus,
.field-group select:focus {
  outline: none;
  border-color: #2563eb;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
}

.quick-chips-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  padding-top: 0.25rem;
}

.chips-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.chip-btn {
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  background-color: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip-btn:hover {
  background-color: #e2e8f0;
}

.chip-btn.active {
  background-color: #1d4ed8;
  color: #ffffff;
  border-color: #1d4ed8;
}

.filtros-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.85rem;
}

.toggles-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8125rem;
  color: #334155;
  cursor: pointer;
}

.buttons-group {
  display: flex;
  gap: 0.65rem;
}

.btn {
  padding: 0.55rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #f8fafc;
  color: #334155;
  border-color: #cbd5e1;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f1f5f9;
}
</style>
