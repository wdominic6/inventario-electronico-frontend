import { defineStore } from 'pinia'
import { ref } from 'vue'
import { catalogoService } from '@/services/catalogo.service'
export const useCatalogoStore = defineStore('catalogo', () => {
 const data = ref({})
 async function load(kind) { const res = await catalogoService.list(kind); data.value[kind] = res?.data ?? res ?? []; return data.value[kind] }
 return { data, load }
})
