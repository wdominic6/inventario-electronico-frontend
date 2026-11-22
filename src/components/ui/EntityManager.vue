<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { catalogoService } from '@/services/catalogo.service'
import { useAuthStore } from '@/stores/auth.store'
const props = defineProps({kind:{type:String,required:true},title:{type:String,required:true},fields:{type:Array,required:true},columns:{type:Array,required:true},adminOnly:Boolean})
const auth=useAuthStore()
const canWrite=computed(()=> props.adminOnly ? auth.user?.role==='admin' : ['admin','almacen'].includes(auth.user?.role))
const rows=ref([]), loading=ref(false), saving=ref(false), error=ref(''), notice=ref(''), search=ref(''), open=ref(false), editing=ref(null), model=ref({})
const filtered=computed(()=>rows.value.filter(r=>JSON.stringify(r).toLowerCase().includes(search.value.toLowerCase())))
const normalize=(value)=>Array.isArray(value)?value:(value?.data??[])
async function refresh() {
  loading.value = true
  error.value = ''

  try {
    const response = await catalogoService.list(props.kind)
    rows.value = normalize(response)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
function begin(row=null){editing.value=row;model.value={};for(const f of props.fields)model.value[f.key]=f.type==='json'?JSON.stringify(row?.[f.key]??{},null,2):(row?.[f.key]??(f.type==='checkbox'?true:''));open.value=true;error.value='';notice.value=''}
function payload(){const result={};for(const f of props.fields){if(editing.value&&f.key==='password'&&!model.value[f.key])continue;const val=model.value[f.key];result[f.key]=f.type==='number' || f.type==='select-number' ? (val===''?null:Number(val)) : f.type==='checkbox'?Boolean(val):f.type==='json'?(JSON.parse(val||'{}')):val}return result}
async function submit() {
  saving.value = true
  error.value = ''

  try {
    const body = payload()

    if (editing.value) {
      await catalogoService.update(
        props.kind,
        editing.value.id,
        body
      )
    } else {
      await catalogoService.create(props.kind, body)
    }

    open.value = false
    notice.value = 'Registro guardado correctamente'

    await refresh()
  } catch (e) {
    error.value = e.data?.message || e.message

    if (e.data?.errors) {
      error.value += ': ' +
        Object.values(e.data.errors).flat().join('; ')
    }
  } finally {
    saving.value = false
  }
}
async function remove(row){if(!window.confirm('¿Eliminar este registro?'))return;error.value='';try{await catalogoService.remove(props.kind,row.id);await refresh();notice.value='Registro eliminado'}catch(e){error.value=e.message}}
watch(()=>props.kind,refresh)
onMounted(refresh)
</script>
<template>
 <section class="page"><div class="top"><div><h2>{{title}}</h2><p>Información obtenida de la API del sistema</p></div><BaseButton v-if="canWrite" @click="begin()">+ Nuevo registro</BaseButton></div>
 <p v-if="error" class="error" role="alert">{{ error }}</p><p v-if="notice" class="success" role="status">{{ notice }}</p>
 <div class="panel"><div class="toolbar"><input v-model="search" type="search" placeholder="Buscar en los registros" aria-label="Buscar"/><button @click="refresh" :disabled="loading">{{loading?'Cargando...':'Actualizar'}}</button></div><BaseTable :rows="filtered" :columns="columns" :actions="canWrite" @edit="begin" @remove="remove"/></div>
 <BaseModal :open="open" :title="editing?'Editar registro':'Nuevo registro'" @close="open=false"><form @submit.prevent="submit" class="form"><label v-for="f in fields" :key="f.key">{{f.label}}<input v-if="!f.type||['text','email','password','number'].includes(f.type)" v-model="model[f.key]" :type="f.type||'text'" :required="!!f.required && !(editing&&f.key==='password')" :min="f.min" :max="f.max" :maxlength="f.maxlength"/><select v-else-if="f.type==='select' || f.type==='select-number'" v-model="model[f.key]" :required="!!f.required"><option value="">Seleccionar</option><option v-for="opt in f.options" :value="opt.value" :key="opt.value">{{opt.label}}</option></select><textarea v-else-if="f.type==='json'" v-model="model[f.key]" rows="3" placeholder="{}"></textarea><input v-else-if="f.type==='checkbox'" v-model="model[f.key]" type="checkbox"/></label><p v-if="error" class="error">{{error}}</p><div class="actions"><BaseButton variant="secondary" @click="open=false">Cancelar</BaseButton><BaseButton type="submit" :busy="saving">{{saving?'Guardando...':'Guardar'}}</BaseButton></div></form></BaseModal>
 </section>
</template>
<style scoped>
.page{width:100%}.top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap}.top h2{margin:0;color:#14243a}.top p{color:#64748b;margin:8px 0}.panel{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px;overflow:hidden}.toolbar{display:flex;gap:10px;margin-bottom:18px}.toolbar input{padding:10px;border:1px solid #cbd5e1;border-radius:8px;flex:1;max-width:400px}.toolbar button{padding:10px;border:1px solid #cbd5e1;border-radius:8px;background:#fff}.form{display:grid;gap:14px}.form label{display:grid;gap:6px;font-size:14px;font-weight:600}.form input,.form select,.form textarea{padding:10px;border:1px solid #cbd5e1;border-radius:8px;width:100%;font:inherit}.form input[type=checkbox]{width:20px}.actions{display:flex;justify-content:flex-end;gap:10px}.error{color:#b91c1c}.success{color:#047857}
</style>
