import api from '@/services/api'
const endpoint = { products: '/products', categories: '/categories', branches: '/branches', locations: '/locations' }
export const catalogoService = {
  list: (kind) => api.get(endpoint[kind]),
  get: (kind, id) => api.get(`${endpoint[kind]}/${id}`),
  create: (kind, payload) => api.post(endpoint[kind], payload),
  update: (kind, id, payload) => api.put(`${endpoint[kind]}/${id}`, payload),
  remove: (kind, id) => api.delete(`${endpoint[kind]}/${id}`),
}
