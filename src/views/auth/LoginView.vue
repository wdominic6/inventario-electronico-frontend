<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
const email=ref(''),password=ref(''),error=ref(''),auth=useAuthStore(),router=useRouter()
async function submit(){error.value='';try{await auth.login(email.value,password.value);await router.replace('/')}catch(e){error.value=e.data?.message||e.message}}
</script>
<template><form class="card" @submit.prevent="submit"><div class="symbol">◈</div><h1>Iniciar sesión</h1><p>Gestión Logística e Inventario · Sistema de Inventario</p><label>Correo electrónico<input v-model.trim="email" type="email" autocomplete="username" required maxlength="255"/></label><label>Contraseña<input v-model="password" type="password" autocomplete="current-password" required minlength="4"/></label><p v-if="error" class="error" role="alert">{{error}}</p><button type="submit" :disabled="auth.busy">{{auth.busy?'Ingresando...':'Ingresar al sistema'}}</button></form></template>
<style scoped>.card{background:#fff;border-radius:18px;padding:34px;width:min(430px,100%);box-shadow:0 20px 60px #0003;display:grid;gap:18px}.symbol{color:#2563eb;font-size:40px}h1{margin:0;color:#14243a}p{margin:0;color:#64748b}label{display:grid;gap:8px;font-weight:600;color:#334155}input{border:1px solid #cbd5e1;border-radius:9px;padding:13px;font:inherit}button{border:0;background:#2563eb;color:white;padding:14px;border-radius:9px;cursor:pointer;font-weight:bold}.error{color:#b91c1c}button:disabled{opacity:.6}</style>
