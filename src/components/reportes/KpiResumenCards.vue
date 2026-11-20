<script setup>
import { computed } from 'vue'

const props = defineProps({
  summary: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const currencyFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
})

const cards = computed(() => [
  {
    key: 'active_skus',
    title: 'Componentes Activos (SKUs)',
    value: Number(props.summary?.active_skus || 0).toLocaleString('es-PE'),
    caption: 'Catálogo técnico electrónico habilitado',
    accent: 'accent-blue',
  },
  {
    key: 'inventory_value',
    title: 'Valorización Total de Inventario',
    value: currencyFormatter.format(Number(props.summary?.inventory_value || 0)),
    caption: 'Costo acumulado sobre existencias físicas',
    accent: 'accent-emerald',
  },
  {
    key: 'low_stock_alerts',
    title: 'Alertas de Desabastecimiento',
    value: Number(props.summary?.low_stock_alerts || 0).toLocaleString('es-PE'),
    caption: 'Artículos con saldo <= stock mínimo por sede',
    accent: Number(props.summary?.low_stock_alerts || 0) > 0 ? 'accent-amber' : 'accent-slate',
  },
  {
    key: 'movements_today',
    title: 'Movimientos Registrados Hoy',
    value: Number(props.summary?.movements_today || 0).toLocaleString('es-PE'),
    caption: 'Entradas, salidas y traslados del día',
    accent: 'accent-indigo',
  },
  {
    key: 'movements_this_week',
    title: 'Movimientos de la Semana',
    value: Number(props.summary?.movements_this_week || 0).toLocaleString('es-PE'),
    caption: 'Operaciones acumuladas en el Kardex',
    accent: 'accent-purple',
  },
  {
    key: 'operational_branches',
    title: 'Sucursales Operativas',
    value: Number(props.summary?.operational_branches || 0).toLocaleString('es-PE'),
    caption: 'Almacenes conectados en tiempo real',
    accent: 'accent-teal',
  },
])
</script>

<template>
  <section class="kpi-grid" aria-label="Indicadores Clave de Rendimiento">
    <article
      v-for="card in cards"
      :key="card.key"
      class="kpi-card"
      :class="[card.accent, { 'is-loading': loading }]"
    >
      <span class="kpi-title">{{ card.title }}</span>
      <strong class="kpi-value">{{ loading ? '...' : card.value }}</strong>
      <span class="kpi-caption">{{ card.caption }}</span>
    </article>
  </section>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #64748b;
  border-radius: 0.75rem;
  padding: 1.15rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.kpi-card.is-loading {
  opacity: 0.65;
}

.kpi-title {
  font-size: 0.785rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #64748b;
}

.kpi-value {
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f172a;
}

.kpi-caption {
  font-size: 0.775rem;
  color: #475569;
}

.accent-blue {
  border-left-color: #2563eb;
}

.accent-emerald {
  border-left-color: #059669;
}

.accent-amber {
  border-left-color: #d97706;
  background-color: #fffdf7;
}

.accent-indigo {
  border-left-color: #4f46e5;
}

.accent-purple {
  border-left-color: #7c3aed;
}

.accent-teal {
  border-left-color: #0d9488;
}

.accent-slate {
  border-left-color: #64748b;
}
</style>
