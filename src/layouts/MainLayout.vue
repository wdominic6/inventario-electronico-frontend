<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/ui/AppSidebar.vue'
import AppHeader from '@/components/ui/AppHeader.vue'
const menuAbierto=ref(false)
</script>
<template><div class="layout"><div v-if="menuAbierto" class="overlay" @click="menuAbierto=false"></div><AppSidebar :abierto="menuAbierto" @cerrar="menuAbierto=false"/><div class="content"><AppHeader @abrir-menu="menuAbierto=true"/><main><RouterView/></main></div></div></template>
<style scoped>.layout{min-height:100vh;display:flex;font-family:Inter,system-ui,Arial,sans-serif}.content{flex:1;min-width:0;background:#f4f7fb}main{padding:26px;max-width:1800px;margin:auto}.overlay{display:none}@media(max-width:800px){main{padding:14px}.overlay{display:block;position:fixed;inset:0;background:#0008;z-index:20}}</style>
