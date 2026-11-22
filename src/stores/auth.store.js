import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
const unpack = (body) => body?.data ?? body
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const busy = ref(false)
  const authenticated = computed(() => !!user.value && !!authService.tokenStorage.get())
  async function restore() {
    if (!authService.tokenStorage.get()) { user.value = null; return false }
    try {
      const result = unpack(await authService.me())
      user.value = result?.user ?? result
      return !!user.value?.role
    } catch {
      authService.tokenStorage.clear(); user.value = null; return false
    }
  }
  async function login(email, password) {
    busy.value = true
    try {
      const response = unpack(await authService.login({ email, password }))
      const token = response?.token ?? response?.access_token ?? response?.plainTextToken
      if (!token) throw new Error('La API no devolvió un token de acceso')
      authService.tokenStorage.set(token)
      if (!(await restore())) throw new Error('No se pudo verificar la sesión')
      return user.value
    } catch (error) {
      authService.tokenStorage.clear(); user.value = null
      throw error
    } finally { busy.value = false }
  }
  async function logout() {
    try { if (authService.tokenStorage.get()) await authService.logout() }
    finally { authService.tokenStorage.clear(); user.value = null }
  }
  return { user, busy, authenticated, restore, login, logout }
})
