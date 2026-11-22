import api from '@/services/api'
export const movimientosService = {
  list: () => api.get('/movements'),
  get: (id) => api.get(`/movements/${id}`),
  submit: (type, payload) => {
    if (!['entry', 'exit', 'transfer'].includes(type)) throw new Error('Tipo de movimiento no válido')
    return api.post(`/movements/${type}`, payload)
  },
}
