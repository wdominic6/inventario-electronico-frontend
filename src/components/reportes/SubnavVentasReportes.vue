<script setup>
import { useRoute } from 'vue-router'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  lastUpdatedAt: {
    type: String,
    default: null,
  },
})

const route = useRoute()

const navLinks = [
  {
    name: 'consultas.stock',
    path: '/consultas/stock',
    label: 'Buscador Multicriterio',
    moduleBadge: 'Ventas',
  },
  {
    name: 'consultas.disponibilidad',
    path: '/consultas/disponibilidad',
    label: 'Disponibilidad Sucursales',
    moduleBadge: 'Ventas',
  },
  {
    name: 'reportes.dashboard',
    path: '/reportes/dashboard',
    label: 'Dashboard Gerencial',
    moduleBadge: 'Gerencia',
  },
  {
    name: 'reportes.alertas',
    path: '/reportes/alertas',
    label: 'Alertas Bajo Stock',
    moduleBadge: 'Alertas',
  },
  {
    name: 'reportes.rotacion',
    path: '/reportes/rotacion',
    label: 'Rotación ABC',
    moduleBadge: 'Reportes',
  },
  {
    name: 'reportes.kardex',
    path: '/reportes/kardex',
    label: 'Kardex de Producto',
    moduleBadge: 'Kardex',
  },
  {
    name: 'usuarios.index',
    path: '/usuarios',
    label: 'Usuarios RBAC',
    moduleBadge: 'Admin',
  },
  {
    name: 'usuarios.auditoria',
    path: '/usuarios/auditoria',
    label: 'Auditoría',
    moduleBadge: 'Admin',
  },
]

function isActive(item) {
  if (route.name === item.name || route.path === item.path) {
    return true
  }
  if (item.path === '/usuarios') {
    return false
  }
  return route.path.startsWith(`${item.path}/`)
}
</script>

<template>
  <header class="module-header">
    <nav class="subnav-tabs" aria-label="Navegación de Consultas y Reportes">
      <RouterLink
        v-for="item in navLinks"
        :key="item.name"
        :to="item.path"
        class="tab-link"
        :class="{ active: isActive(item) }"
      >
        <span class="tab-badge">{{ item.moduleBadge }}</span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="title-row">
      <div>
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-right">
        <span v-if="lastUpdatedAt" class="sync-indicator">
          <span class="pulse-dot" aria-hidden="true"></span>
          Actualizado: {{ lastUpdatedAt }}
        </span>
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<style scoped>
.module-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.subnav-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
}

.tab-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.85rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  transition: all 0.15s ease;
}

.tab-link:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.tab-link.active {
  background-color: #1e293b;
  color: #ffffff;
}

.tab-badge {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
  background-color: rgba(148, 163, 184, 0.22);
}

.tab-link.active .tab-badge {
  background-color: #2563eb;
  color: #ffffff;
}

.title-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.875rem;
  color: #475569;
}

.header-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.sync-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.775rem;
  font-weight: 600;
  color: #047857;
  background-color: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 0.3rem 0.65rem;
  border-radius: 9999px;
}

.pulse-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 9999px;
  background-color: #10b981;
}
</style>
