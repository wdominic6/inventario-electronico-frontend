<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'ok',
  },
  quantity: {
    type: Number,
    default: null,
  },
  minStock: {
    type: Number,
    default: null,
  },
  size: {
    type: String,
    default: 'md',
  },
})

const resolvedStatus = computed(() => {
  if (props.status === 'critical' || props.status === 'out_of_stock') {
    return 'out_of_stock'
  }
  if (props.status === 'warning' || props.status === 'low_stock') {
    return 'low_stock'
  }
  if (props.quantity !== null) {
    const qty = Number(props.quantity)
    const min = Number(props.minStock ?? 0)
    if (qty <= 0) return 'out_of_stock'
    if (qty <= min) return 'low_stock'
  }
  return 'ok'
})

const config = computed(() => {
  if (resolvedStatus.value === 'out_of_stock') {
    return {
      label: 'Agotado',
      variant: 'badge-danger',
    }
  }
  if (resolvedStatus.value === 'low_stock') {
    return {
      label: 'Stock Bajo',
      variant: 'badge-warning',
    }
  }
  return {
    label: 'Disponible',
    variant: 'badge-success',
  }
})
</script>

<template>
  <span class="semaforo-badge" :class="[config.variant, `size-${size}`]">
    <span class="dot" aria-hidden="true"></span>
    <span class="label">{{ config.label }}</span>
    <span v-if="quantity !== null" class="qty">({{ quantity }})</span>
  </span>
</template>

<style scoped>
.semaforo-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 600;
  border-radius: 9999px;
  white-space: nowrap;
  border: 1px solid transparent;
}

.size-sm {
  padding: 0.15rem 0.55rem;
  font-size: 0.75rem;
}

.size-md {
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

.badge-success {
  background-color: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.badge-success .dot {
  background-color: #10b981;
}

.badge-warning {
  background-color: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}

.badge-warning .dot {
  background-color: #f59e0b;
}

.badge-danger {
  background-color: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.badge-danger .dot {
  background-color: #ef4444;
}

.qty {
  font-weight: 700;
  opacity: 0.9;
}
</style>
