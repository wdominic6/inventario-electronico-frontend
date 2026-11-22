<script setup>
const props = defineProps({
  users: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  togglingUserId: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['edit', 'toggle-status', 'view-audit'])

const ROLE_META = {
  admin: { label: 'Administrador', className: 'role-admin' },
  almacen: { label: 'Almacén', className: 'role-almacen' },
  ventas: { label: 'Ventas', className: 'role-ventas' },
}

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function resolveRole(role) {
  return ROLE_META[role] || { label: role || 'Sin rol', className: 'role-default' }
}

function formatLastAccess(isoDate) {
  if (!isoDate) return 'Sin accesos'
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return isoDate
  return dateFormatter.format(parsed)
}
</script>

<template>
  <div class="table-wrapper">
    <div v-if="loading" class="state-box">Cargando usuarios y permisos RBAC...</div>

    <div v-else-if="props.users.length === 0" class="state-box">
      No se encontraron usuarios que coincidan con los filtros seleccionados.
    </div>

    <table v-else class="users-table">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Rol RBAC</th>
          <th>Sucursal</th>
          <th>Estado</th>
          <th>Último acceso</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in props.users" :key="user.id" :class="{ 'row-inactive': !user.is_active }">
          <td>
            <div class="user-identity">
              <strong class="user-name">{{ user.name }}</strong>
              <span class="user-email">{{ user.email }}</span>
            </div>
          </td>
          <td>
            <span class="role-pill" :class="resolveRole(user.role).className">
              {{ resolveRole(user.role).label }}
            </span>
          </td>
          <td>
            <div class="branch-cell">
              <span>{{ user.branch_name || user.branch?.name || 'Sin sucursal' }}</span>
              <code v-if="user.branch?.code" class="branch-code">{{ user.branch.code }}</code>
            </div>
          </td>
          <td>
            <span class="status-pill" :class="user.is_active ? 'status-active' : 'status-inactive'">
              {{ user.is_active ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td class="date-cell">{{ formatLastAccess(user.last_access) }}</td>
          <td class="text-right">
            <div class="row-actions">
              <button
                type="button"
                class="action-btn"
                title="Editar perfil, rol o sucursal"
                @click="emit('edit', user)"
              >
                Editar
              </button>
              <button
                type="button"
                class="action-btn"
                :class="user.is_active ? 'action-danger' : 'action-success'"
                :disabled="Number(togglingUserId) === Number(user.id)"
                :title="
                  user.is_active
                    ? 'Desactivar cuenta y revocar sesiones activas'
                    : 'Reactivar acceso del usuario'
                "
                @click="emit('toggle-status', user)"
              >
                {{
                  Number(togglingUserId) === Number(user.id)
                    ? 'Actualizando...'
                    : user.is_active
                      ? 'Desactivar'
                      : 'Reactivar'
                }}
              </button>
              <button
                type="button"
                class="action-btn action-secondary"
                title="Ver bitácora de auditoría de este usuario"
                @click="emit('view-audit', user)"
              >
                Auditoría
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

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.users-table th,
.users-table td {
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  vertical-align: middle;
}

.users-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.row-inactive {
  background-color: #fafafa;
}

.user-identity {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.user-name {
  color: #0f172a;
}

.user-email {
  font-size: 0.78rem;
  color: #64748b;
}

.role-pill,
.status-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
}

.role-admin {
  background-color: #eef2ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
}

.role-almacen {
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.role-ventas {
  background-color: #f0fdfa;
  color: #0f766e;
  border: 1px solid #99f6e4;
}

.role-default {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.branch-cell {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.branch-code {
  font-family: monospace;
  font-size: 0.74rem;
  font-weight: 700;
  background-color: #f1f5f9;
  color: #334155;
  padding: 0.12rem 0.4rem;
  border-radius: 0.25rem;
}

.status-active {
  background-color: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-inactive {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.date-cell {
  white-space: nowrap;
  color: #475569;
  font-size: 0.8125rem;
}

.text-right {
  text-align: right !important;
}

.row-actions {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: flex-end;
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

.action-btn:hover:not(:disabled) {
  background-color: #dbeafe;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-danger {
  background-color: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.action-danger:hover:not(:disabled) {
  background-color: #fee2e2;
}

.action-success {
  background-color: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.action-success:hover:not(:disabled) {
  background-color: #d1fae5;
}

.action-secondary {
  background-color: #f8fafc;
  color: #334155;
  border-color: #cbd5e1;
}

.action-secondary:hover:not(:disabled) {
  background-color: #f1f5f9;
}
</style>
