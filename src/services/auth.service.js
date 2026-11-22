import api, { tokenStorage } from '@/services/api'
export const authService = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  tokenStorage,
}
