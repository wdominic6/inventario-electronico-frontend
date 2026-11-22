<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuariosStore } from '@/stores/usuarios.store'
import { USER_ROLES } from '@/services/usuarios.service'
import SubnavVentasReportes from '@/components/reportes/SubnavVentasReportes.vue'
import TablaUsuarios from '@/components/usuarios/TablaUsuarios.vue'
import UsuarioFormModal from '@/components/usuarios/UsuarioFormModal.vue'

const router = useRouter()
const store = useUsuariosStore()

const localFilters = reactive({
  q: store.filters.q || '',
  role: store.filters.role || '',
  branch_id: store.filters.branch_id || '',
  is_active: store.filters.is_active || '',
  per_page: Number(store.filters.per_page || 15),
})

const modalOpen = ref(false)
const editingUser = ref(null)

onMounted(async () => {
  store.clearFeedback()
  await Promise.all([store.loadBranches(), applyFilters(1)])
})

async function applyFilters(page = 1) {
  await store.fetchUsers({
    ...localFilters,
    page,
  })
}

async function resetFilters() {
  localFilters.q = ''
  localFilters.role = ''
  localFilters.branch_id = ''
  localFilters.is_active = ''
  localFilters.per_page = 15
  await applyFilters(1)
}

function openCreateModal() {
  store.clearFeedback()
  editingUser.value = null
  modalOpen.value = true
}

function openEditModal(user) {
  store.clearFeedback()
  editingUser.value = user
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingUser.value = null
}

async function handleModalSubmit(payload) {
  const result = editingUser.value?.id
    ? await store.updateUser(editingUser.value.id, payload)
    : await store.createUser(payload)

  if (result.ok) {
    closeModal()
  }
}

async function handleToggleStatus(user) {
  if (user.is_active) {
    const confirmed = window.confirm(
      `¿Desactivar la cuenta de ${user.name} (${user.email})? Se revocarán de inmediato todas sus sesiones activas.`,
    )
    if (!confirmed) return
  }

  await store.toggleUserStatus(user)
}

function goToUserAudit(user) {
  router.push({
    name: 'usuarios.auditoria',
    query: { user_id: String(user.id) },
  })
}

function goToAuditLogs() {
  router.push({ name: 'usuarios.auditoria' })
}
</script>

<template>
  <main class="view-page">
    <SubnavVentasReportes
      title="Gestión de Usuarios y Control de Acceso (RBAC)"
      subtitle="Administración de cuentas de personal, asignación de roles (Administrador, Almacén, Ventas), sucursal operativa y activación/revocación de acceso (RF08)."
      :last-updated-at="store.lastUpdatedAt"
    >
      <template #actions>
        <button type="button" class="btn btn-secondary" @click="goToAuditLogs">
          Ver Bitácora
        </button>
        <button type="button" class="btn btn-primary" @click="openCreateModal">
          + Nuevo Usuario
        </button>
      </template>
    </SubnavVentasReportes>

    <section class="summary-strip">
      <div class="stat-pill">
        <span>Total Registrados:</span>
        <strong>{{ store.usersMeta.total }}</strong>
      </div>
      <div class="stat-pill pill-active">
        <span>Activos en Página:</span>
        <strong>{{ store.activeUsersCount }}</strong>
      </div>
      <div class="stat-pill pill-inactive">
        <span>Inactivos en Página:</span>
        <strong>{{ store.inactiveUsersCount }}</strong>
      </div>
    </section>

    <form class="filters-bar" @submit.prevent="applyFilters(1)">
      <div class="filter-field filter-search">
        <label for="users-q">Buscar usuario</label>
        <input
          id="users-q"
          v-model="localFilters.q"
          type="search"
          placeholder="Nombre, apellido o correo electrónico..."
        />
      </div>

      <div class="filter-field">
        <label for="users-role">Rol RBAC</label>
        <select id="users-role" v-model="localFilters.role" @change="applyFilters(1)">
          <option value="">Todos los roles</option>
          <option v-for="roleOpt in USER_ROLES" :key="roleOpt.value" :value="roleOpt.value">
            {{ roleOpt.label }}
          </option>
        </select>
      </div>

      <div class="filter-field">
        <label for="users-branch">Sucursal</label>
        <select id="users-branch" v-model="localFilters.branch_id" @change="applyFilters(1)">
          <option value="">Todas las sucursales</option>
          <option v-for="branch in store.branches" :key="branch.id" :value="String(branch.id)">
            {{ branch.code ? `${branch.name} (${branch.code})` : branch.name }}
          </option>
        </select>
      </div>

      <div class="filter-field">
        <label for="users-status">Estado</label>
        <select id="users-status" v-model="localFilters.is_active" @change="applyFilters(1)">
          <option value="">Todos los estados</option>
          <option value="1">Solo activos</option>
          <option value="0">Solo inactivos</option>
        </select>
      </div>

      <div class="filter-field filter-compact">
        <label for="users-per-page">Por página</label>
        <select
          id="users-per-page"
          v-model.number="localFilters.per_page"
          @change="applyFilters(1)"
        >
          <option :value="15">15</option>
          <option :value="30">30</option>
          <option :value="50">50</option>
        </select>
      </div>

      <div class="filter-actions">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="store.loadingUsers"
          @click="resetFilters"
        >
          Restablecer
        </button>
        <button type="submit" class="btn btn-primary" :disabled="store.loadingUsers">
          {{ store.loadingUsers ? 'Buscando...' : 'Filtrar' }}
        </button>
      </div>
    </form>

    <div v-if="store.successMessage" class="alert-success" role="status">
      <span>{{ store.successMessage }}</span>
      <button
        type="button"
        class="dismiss-btn"
        aria-label="Cerrar aviso"
        @click="store.clearFeedback()"
      >
        &times;
      </button>
    </div>

    <div v-if="store.error && !modalOpen" class="alert-error" role="alert">
      {{ store.error }}
    </div>

    <TablaUsuarios
      :users="store.users"
      :loading="store.loadingUsers"
      :toggling-user-id="store.togglingUserId"
      @edit="openEditModal"
      @toggle-status="handleToggleStatus"
      @view-audit="goToUserAudit"
    />

    <footer v-if="store.usersMeta.last_page > 1" class="pagination-bar">
      <span class="page-info">
        Página {{ store.usersMeta.current_page }} de {{ store.usersMeta.last_page }} (Total:
        {{ store.usersMeta.total }} usuarios)
      </span>
      <div class="page-controls">
        <button
          type="button"
          class="page-btn"
          :disabled="store.usersMeta.current_page <= 1 || store.loadingUsers"
          @click="applyFilters(store.usersMeta.current_page - 1)"
        >
          Anterior
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="store.usersMeta.current_page >= store.usersMeta.last_page || store.loadingUsers"
          @click="applyFilters(store.usersMeta.current_page + 1)"
        >
          Siguiente
        </button>
      </div>
    </footer>

    <UsuarioFormModal
      :open="modalOpen"
      :user="editingUser"
      :branches="store.branches"
      :saving="store.savingUser"
      :error="store.error"
      :validation-errors="store.validationErrors"
      @close="closeModal"
      @submit="handleModalSubmit"
    />
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

.pill-active {
  background-color: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.pill-inactive {
  background-color: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
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
  flex: 1 1 170px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-search {
  flex: 2 1 240px;
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

.alert-success {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  background-color: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  border-radius: 0.65rem;
  font-size: 0.875rem;
}

.dismiss-btn {
  border: none;
  background: transparent;
  color: inherit;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
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
