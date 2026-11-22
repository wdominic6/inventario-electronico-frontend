<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
defineProps({ abierto:{type:Boolean,default:false} })
const emit=defineEmits(['cerrar'])
const auth=useAuthStore()
const links=[
 {label:'Inicio',to:'/',roles:['admin','almacen','ventas']},
 {label:'Productos',to:'/catalogo',roles:['admin','almacen','ventas']},
 {label:'Categorías',to:'/categorias',roles:['admin','almacen','ventas']},
 {label:'Sucursales',to:'/sucursales',roles:['admin','almacen','ventas']},
 {label:'Ubicaciones',to:'/ubicaciones',roles:['admin','almacen','ventas']},
 {label:'Movimientos',to:'/almacen',roles:['admin','almacen']},
 {label:'Entradas',to:'/almacen/entradas',roles:['admin','almacen']},
 {label:'Salidas',to:'/almacen/salidas',roles:['admin','almacen']},
 {label:'Traslados',to:'/almacen/traslados',roles:['admin','almacen']},
 {label:'Historial',to:'/almacen/historial',roles:['admin','almacen']},
 {label:'Usuarios',to:'/usuarios',roles:['admin']},
{label:'Auditoría',to:'/usuarios/auditoria',roles:['admin']},
]
const visible=computed(()=>links.filter(x=>x.roles.includes(auth.user?.role)))
</script>
<template>
 <aside :class="['sidebar',{abierto}]"><div class="brand"><span class="logo">◈</span><div><strong>Inventario Electrónico</strong><small>Inventario electrónico</small></div></div><p class="section">NAVEGACIÓN</p><nav><RouterLink v-for="link in visible" :key="link.to" :to="link.to" @click="emit('cerrar')" active-class="active" :exact-active-class="link.to==='/'?'active':''">{{link.label}}</RouterLink></nav><div class="footer">Ingeniería de Software · 2026</div></aside>
</template>
<style scoped>
.sidebar{width:246px;min-width:246px;min-height:100vh;background:#14243a;color:white;padding:24px 14px;display:flex;flex-direction:column}.brand{display:flex;align-items:center;gap:12px;padding:4px 10px 26px}.brand strong,.brand small{display:block}.brand small{font-size:12px;color:#a6bfdc}.logo{color:#93c5fd;font-size:32px}.section{font-size:11px;letter-spacing:1.5px;color:#8fa9c9;padding:0 12px}nav{display:grid;gap:3px}nav a{color:#cfdeee;padding:11px 13px;border-radius:9px;text-decoration:none;font-size:14px}nav a:hover,nav a.active{background:#2b4b70;color:white}.footer{margin-top:auto;color:#8fa9c9;font-size:12px;padding:18px 12px}@media(max-width:800px){.sidebar{position:fixed;left:0;top:0;bottom:0;z-index:30;transform:translateX(-100%);transition:transform .2s;overflow-y:auto}.sidebar.abierto{transform:translateX(0)}}
</style>
