<script setup>
import { ref,onMounted } from 'vue'
import { movimientosService } from '@/services/movimientos.service'
import BaseTable from '@/components/ui/BaseTable.vue'
const rows=ref([]),error=ref(''),busy=ref(false)
const columns=[{key:'id',label:'ID'},{key:'movement_type_name',label:'Tipo'},{key:'codigo',label:'Producto'},{key:'quantity',label:'Cantidad'},{key:'previous_stock',label:'Stock anterior'},{key:'new_stock',label:'Stock actual'},{key:'created_at',label:'Fecha'}]
async function refresh(){busy.value=true;error.value='';try{const result=await movimientosService.list();rows.value=result?.data??[]}catch(e){error.value=e.message}finally{busy.value=false}}
onMounted(refresh)
</script>
<template><section><h2>Historial de movimientos</h2><p v-if="error" class="error" role="alert">{{error}}</p><div class="panel"><button @click="refresh" :disabled="busy">{{busy?'Cargando...':'Actualizar'}}</button><BaseTable :rows="rows" :columns="columns" :actions="false"/></div></section></template>
<style scoped>h2{color:#14243a}.panel{background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0}.error{color:#b91c1c}button{padding:10px;margin-bottom:12px;border:1px solid #cbd5e1;border-radius:8px;background:white}</style>
