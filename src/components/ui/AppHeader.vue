<script setup>
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
const emit=defineEmits(['abrir-menu'])
const auth=useAuthStore();const router=useRouter()
async function salir(){try{await auth.logout()}finally{router.push('/login')}}
</script>
<template><header><div class="left"><button class="menu" aria-label="Abrir menú" @click="emit('abrir-menu')">☰</button><div><h1>Gestión Logística e Inventario</h1><small>Productos electrónicos · Inventario Electrónico</small></div></div><div class="user"><span>{{auth.user?.name||'Usuario'}} <small>({{auth.user?.role||'—'}})</small></span><button @click="salir">Salir</button></div></header></template>
<style scoped>header{min-height:78px;background:white;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;gap:14px;padding:14px 24px}.left,.user{display:flex;align-items:center;gap:14px}h1{font-size:19px;margin:0;color:#172b46}small{display:block;color:#64748b;margin-top:5px}.menu{display:none;font-size:24px;border:0;background:transparent;cursor:pointer}.user button{border:1px solid #cbd5e1;background:white;padding:9px 14px;border-radius:8px;cursor:pointer}@media(max-width:800px){.menu{display:block}header{padding:12px}.user span{display:none}h1{font-size:15px}}</style>
