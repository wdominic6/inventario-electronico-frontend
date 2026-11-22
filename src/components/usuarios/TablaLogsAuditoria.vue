<script setup>
import { AUDIT_ACTION_OPTIONS } from '@/services/usuarios.service'

const props = defineProps({
  logs: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const ACTION_LABELS = Object.fromEntries(
  AUDIT_ACTION_OPTIONS.map((item) => [item.value, item.label]),
)

const dateTimeFormatter = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'short',
  timeStyle: 'medium',
})

function formatDateTime(isoDate) {
  if (!isoDate) return '-'
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return isoDate
  return dateTimeFormatter.format(parsed)
}

function actionLabel(action) {
  return ACTION_LABELS[action] || action || 'Evento'
}

function actionBadgeClass(action = '') {
  if (
    action.includes('failed') ||
    action.includes('blocked') ||
    action.endsWith('.deleted')
  ) {
    return 'badge-danger'
  }
  if (action.endsWith('.created') || action === 'inventory.entry' || action === 'auth.login') {
    return 'badge-success'
  }
  if (action === 'inventory.exit' || action === 'auth.logout') {
    return 'badge-warning'
  }
  return 'badge-info'
}

function hasPayload(value) {
  if (!value) return false
  if (typeof value === 'object') {
    return Object.keys(value).length > 0
  }
  return true
}

function formatJson(value) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function resolveDescription(log) {
  if (log?.details && typeof log.details === 'object' && log.details.descripcion) {
    return log.details.descripcion
  }
  return `${actionLabel(log?.action)} sobre ${log?.entity_type || 'sistema'}`
}

function resolveNewDetails(log) {
  if (!log?.details || typeof log.details !== 'object') {
    return log?.details ?? null
  }
  return log.details.detalles ?? null
}
</script>

<template>
  <div class="table-wrapper">
    <div v-if="loading" class="state-box">Consultando registros de auditoría del sistema...</div>

    <div v-else-if="props.logs.length === 0" class="state-box">
      No se encontraron eventos de auditoría para los criterios aplicados.
    </div>

    <table v-else class="audit-table">
      <thead>
        <tr>
          <th>Fecha / Hora</th>
          <th>Usuario</th>
          <th>Acción</th>
          <th>Entidad</th>
          <th>Descripción y Trazabilidad</th>
          <th>IP</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in props.logs" :key="log.id">
          <td class="date-cell">{{ formatDateTime(log.created_at) }}</td>
          <td>
            <div class="user-cell">
              <strong>
                {{ log.user?.name || (log.user_id ? `Usuario #${log.user_id}` : 'Sistema') }}
              </strong>
              <span v-if="log.user?.email" class="muted-sub">{{ log.user.email }}</span>
            </div>
          </td>
          <td>
            <div class="action-cell">
              <span class="action-pill" :class="actionBadgeClass(log.action)">
                {{ actionLabel(log.action) }}
              </span>
              <code class="action-code">{{ log.action }}</code>
            </div>
          </td>
          <td class="entity-cell">
            <span class="entity-tag">
              {{ log.entity_type || 'sistema' }}
              <template v-if="log.entity_id !== null && log.entity_id !== undefined">
                #{{ log.entity_id }}
              </template>
            </span>
          </td>
          <td>
            <p class="desc-text">{{ resolveDescription(log) }}</p>
            <details
              v-if="hasPayload(log.old_values) || hasPayload(resolveNewDetails(log)) || log.user_agent"
              class="trace-details"
            >
              <summary>Inspeccionar valores y contexto técnico</summary>
              <div class="trace-grid">
                <div v-if="hasPayload(log.old_values)" class="trace-block">
                  <strong>Valores anteriores</strong>
                  <pre>{{ formatJson(log.old_values) }}</pre>
                </div>
                <div v-if="hasPayload(resolveNewDetails(log))" class="trace-block">
                  <strong>Valores nuevos / Detalles</strong>
                  <pre>{{ formatJson(resolveNewDetails(log)) }}</pre>
                </div>
                <div v-if="log.user_agent" class="trace-block trace-full">
                  <strong>Agente de usuario (User-Agent)</strong>
                  <p class="ua-text">{{ log.user_agent }}</p>
                </div>
              </div>
            </details>
          </td>
          <td>
            <code class="ip-code">{{ log.ip_address || '-' }}</code>
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

.audit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
}

.audit-table th,
.audit-table td {
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  vertical-align: top;
}

.audit-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.date-cell {
  white-space: nowrap;
  color: #334155;
  font-size: 0.8rem;
}

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.muted-sub {
  font-size: 0.75rem;
  color: #64748b;
}

.action-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.action-pill {
  display: inline-block;
  padding: 0.18rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.73rem;
  font-weight: 700;
  white-space: nowrap;
}

.badge-success {
  background-color: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.badge-info {
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.badge-warning {
  background-color: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.badge-danger {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.action-code,
.ip-code {
  font-family: monospace;
  font-size: 0.73rem;
  color: #475569;
  background-color: #f1f5f9;
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
}

.entity-cell {
  white-space: nowrap;
}

.entity-tag {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 0.35rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 0.76rem;
  font-weight: 600;
  color: #334155;
}

.desc-text {
  margin: 0;
  color: #0f172a;
}

.trace-details {
  margin-top: 0.45rem;
}

.trace-details summary {
  cursor: pointer;
  font-size: 0.76rem;
  font-weight: 600;
  color: #2563eb;
}

.trace-grid {
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.5rem;
}

.trace-block {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.45rem;
  padding: 0.55rem 0.65rem;
}

.trace-full {
  grid-column: 1 / -1;
}

.trace-block strong {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  color: #475569;
  margin-bottom: 0.3rem;
}

.trace-block pre {
  margin: 0;
  font-family: monospace;
  font-size: 0.73rem;
  color: #1e293b;
  white-space: pre-wrap;
  word-break: break-word;
}

.ua-text {
  margin: 0;
  font-size: 0.74rem;
  color: #475569;
  word-break: break-word;
}
</style>
