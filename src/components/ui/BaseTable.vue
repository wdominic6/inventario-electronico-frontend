<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ rows:{type:Array,default:()=>[]}, columns:{type:Array,required:true}, pageSize:{type:Number,default:10}, actions:{type:Boolean,default:true} })
const page=ref(1)
const pages=computed(()=>Math.max(1,Math.ceil(props.rows.length/props.pageSize)))
const visible=computed(()=>props.rows.slice((Math.min(page.value,pages.value)-1)*props.pageSize,Math.min(page.value,pages.value)*props.pageSize))
const emit=defineEmits(['edit','remove'])
</script>
<template>
 <div class="table-scroll"><table><thead><tr><th v-for="col in columns" :key="col.key">{{ col.label }}</th><th v-if="props.actions">Acciones</th></tr></thead>
 <tbody><tr v-for="(row,index) in visible" :key="row.id ?? index"><td v-for="col in columns" :key="col.key">{{ row[col.key] ?? '—' }}</td><td v-if="props.actions"><button type="button" @click="emit('edit',row)">Editar</button><button type="button" class="danger" @click="emit('remove',row)">Eliminar</button></td></tr>
 <tr v-if="!rows.length"><td :colspan="columns.length+1" class="empty">No hay registros para mostrar.</td></tr></tbody></table></div>
 <div class="pager" v-if="pages>1"><button :disabled="page<=1" @click="page--">Anterior</button><span>Página {{ Math.min(page,pages) }} de {{ pages }}</span><button :disabled="page>=pages" @click="page++">Siguiente</button></div>
</template>
<style scoped>
.table-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;white-space:nowrap}th,td{text-align:left;border-bottom:1px solid #e2e8f0;padding:12px}th{background:#f1f5f9;color:#334155}button{border:1px solid #cbd5e1;background:#fff;border-radius:6px;padding:6px 10px;margin-right:6px;cursor:pointer}.danger{color:#be123c}.empty{text-align:center;color:#64748b;padding:24px}.pager{display:flex;align-items:center;gap:12px;justify-content:flex-end;margin-top:12px}
</style>
