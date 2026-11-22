<script setup>
import { useAuthStore } from '@/stores/auth.store'
const auth=useAuthStore()
</script>
<template><section><h2>Bienvenido al sistema de inventario</h2><p>Sesión iniciada como <strong>{{auth.user?.name}}</strong>. Selecciona un módulo en la barra lateral.</p><div class="card"><h3>Panel operativo</h3><p>Utiliza los módulos de catálogo, ubicaciones y movimientos de acuerdo con tus permisos.</p><p>Las métricas gerenciales y los reportes pertenecen al módulo de William.</p></div></section></template>
<style scoped>h2{color:#14243a}.card{padding:22px;background:white;border-radius:12px;max-width:650px;border:1px solid #e2e8f0}p{color:#64748b;line-height:1.6}</style>
