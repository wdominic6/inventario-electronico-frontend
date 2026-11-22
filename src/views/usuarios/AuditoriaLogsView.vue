<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsuariosStore } from '@/stores/usuarios.store'
import { AUDIT_ACTION_OPTIONS } from '@/services/usuarios.service'
import SubnavVentasReportes from '@/components/reportes/SubnavVentasReportes.vue'
import TablaLogsAuditoria from '@/components/usuarios/TablaLogsAuditoria.vue'

const route = useRoute()
const router = useRouter()
const store = useUsuariosStore()

const localFilters = reactive({
  user_id: route.query.user_id ? String(route.query.user_id) : store.auditFilters.user_id || '',
  action: route.query.action ? String(route.query.action) : store.auditFilters.action || '',
  date_from: store.auditFilters.date_from || '',
  date_to: store.auditFilters.date_to || '',
  per_page: Number(store.auditFilters.per_page || 20),
})

const selectedUserRecord = computed(() =>
  store.usersDirectory.find((u) => String(u.id) === String(localFilters.user_id)),
)

const dateRangeError = computed(() => {
  if (localFilters.date_from && localFilters.date_to && localFilters.date_from > localFilters.date_to) {
    return 'La fecha inicial no puede ser posterior a la fecha final.'
  }
  const fromErr = store.validationErrors?.date_from?.[0]
  const toErr = store.validationErrors?.date_to?.[0]
  return fromErr || toErr || null
})

onMounted(async () => {
  store.clearFeedback()
  await store.loadUsersDirectory()
  await applyFilters(1)
})

watch(
  () => route.query.user_id,
  async (newUserId) => {
    const normalized = newUserId ? String(newUserId) : ''
    if (normalized !== localFilters.user_id) {
      localFilters.user_id = normalized
      await applyFilters(1)
    }
  },
)

async function applyFilters(page = 1) {
  if (localFilters.date_from && localFilters.date_to && localFilters.date_from > localFilters.date_to) {
    return
  }

  await store.fetchAuditLogs({
    ...localFilters,
    page,
  })
}

async function resetFilters() {
  localFilters.user_id = ''
  localFilters.action = ''
  localFilters.date_from = ''
  localFilters.date_to = ''
  localFilters.per_page = 20

  if (route.query.user_id || route.query.action) {
    await router.replace({ name: 'usuarios.auditoria', query: {} })
  }
  await applyFilters(1)
}

function goToUsersManagement() {
  router.push({ name: 'usuarios.index' })
}
</script>

<template>
  <main class="view-page">
    <SubnavVentasReportes
      title="Bitácora de Auditoría y Trazabilidad del Sistema"
      subtitle="Registro cronológico de accesos, cambios de usuarios, modificaciones de catálogo y operaciones de inventario con valores anteriores y posteriores (RF08)."
      :last-updated-at="store.lastUpdatedAt"
    >
      <template #actions>
        <button type="button" class="btn btn-secondary" @click="goToUsersManagement">
          Gestión de Usuarios
        </button>
      </template>
    </SubnavVentasReportes>

    <section class="summary-strip">
      <div class="stat-pill">
        <span>Eventos Encontrados:</span>
        <strong>{{ store.auditMeta.total }}</strong>
      </div>
      <div class="stat-pill">
        <span>Mostrando en Página:</span>
        <strong>{{ store.auditLogs.length }}</strong>
      </div>
      <div v-if="selectedUserRecord" class="stat-pill pill-filter">
        <span>Filtrado por usuario:</span>
        <strong>{{ selectedUserRecord.name }} ({{ selectedUserRecord.email }})</strong>
      </div>
    </section>

    <form class="filters-bar" @submit.prevent="applyFilters(1)">
      <div class="filter-field filter-user">
        <label for="audit-user">Usuario</label>
        <select id="audit-user" v-model="localFilters.user_id" @change="applyFilters(1)">
          <option value="">Todos los usuarios</option>
          <option
            v-for="user in store.usersDirectory"
            :key="user.id"
            :value="String(user.id)"
          >
            {{ user.name }} ({{ user.email }})
          </option>
        </select>
      </div>

      <div class="filter-field filter-action">
        <label for="audit-action">Acción (exacta o prefijo)</label>
        <input
          id="audit-action"
          v-model="localFilters.action"
          type="text"
          list="audit-actions-datalist"
          maxlength="50"
          placeholder="Ej. user.updated, inventory., auth.login"
        />
        <datalist id="audit-actions-datalist">
          <option
            v-for="opt in AUDIT_ACTION_OPTIONS"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </datalist>
      </div>

      <div class="filter-field">
        <label for="audit-date-from">Desde</label>
        <input id="audit-date-from" v-model="localFilters.date_from" type="date" />
      </div>

      <div class="filter-field">
        <label for="audit-date-to">Hasta</label>
        <input id="audit-date-to" v-model="localFilters.date_to" type="date" />
      </div>

      <div class="filter-field filter-compact">
        <label for="audit-per-page">Por página</label>
        <select
          id="audit-per-page"
          v-model.number="localFilters.per_page"
          @change="applyFilters(1)"
        >
          <option :value="15">15</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>

      <div class="filter-actions">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="store.loadingAudit"
          @click="resetFilters"
        >
          Restablecer
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="store.loadingAudit || Boolean(dateRangeError)"
        >
          {{ store.loadingAudit ? 'Consultando...' : 'Consultar' }}
        </button>
      </div>
    </form>

    <div v-if="dateRangeError" class="alert-error" role="alert">
      {{ dateRangeError }}
    </div>

    <div v-if="store.auditError" class="alert-error" role="alert">
      {{ store.auditError }}
    </div>

    <TablaLogsAuditoria :logs="store.auditLogs" :loading="store.loadingAudit" />

    <footer v-if="store.auditMeta.last_page > 1" class="pagination-bar">
      <span class="page-info">
        Página {{ store.auditMeta.current_page }} de {{ store.auditMeta.last_page }} (Total:
        {{ store.auditMeta.total }} eventos)
      </span>
      <div class="page-controls">
        <button
          type="button"
          class="page-btn"
          :disabled="store.auditMeta.current_page <= 1 || store.loadingAudit"
          @click="applyFilters(store.auditMeta.current_page - 1)"
        >
          Anterior
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="
            store.auditMeta.current_page >= store.auditMeta.last_page || store.loadingAudit
          "
          @click="applyFilters(store.auditMeta.current_page + 1)"
        >
          Siguiente
        </button>
      </div>
    </footer>
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

.pill-filter {
  background-color: #eff6ff;
  color: #1e40af;
  border-color: #bfdbfe;
}

.filters-bar {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.9rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.filter-field {
  flex: 1 1 160px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-user,
.filter-action {
  flex: 1.6 1 220px;
}

.filter-compact {
  flex: 0 1 110px;
}

.filter-field label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
}

.filter-field input,
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
  white-space: nowrap;
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
