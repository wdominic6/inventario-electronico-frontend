import { defineStore } from 'pinia'
import { ref } from 'vue'
import { movimientosService } from '@/services/movimientos.service'
export const useMovimientosStore = defineStore('movimientos', () => {
 const rows = ref([])
 async function load() { const res = await movimientosService.list(); rows.value = res?.data ?? []; return rows.value }
 return { rows, load }
})
