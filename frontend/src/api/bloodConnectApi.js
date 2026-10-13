import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090'
const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const checkHealth = async () => {
  const response = await api.get('/api/health')
  return response.data
}

export const getDonors = async (filters = {}) => {
  const params = {}
  if (filters.bloodGroup && filters.bloodGroup !== 'ALL') {
    params.bloodGroup = filters.bloodGroup
  }
  if (filters.city && filters.city.trim() !== '') {
    params.city = filters.city.trim()
  }
  const response = await api.get('/api/donors', { params })
  return response.data
}

export const registerDonor = async (donorData) => {
  const response = await api.post('/api/donors', donorData)
  return response.data
}

export const getCompatibleDonors = async (bloodGroup, city = '') => {
  const params = { bloodGroup }
  if (city && city.trim() !== '') {
    params.city = city.trim()
  }
  const response = await api.get('/api/donors/compatible', { params })
  return response.data
}

export const getBloodRequests = async (filters = {}) => {
  const params = {}
  if (filters.bloodGroup && filters.bloodGroup !== 'ALL') {
    params.bloodGroup = filters.bloodGroup
  }
  if (filters.status && filters.status !== 'ALL') {
    params.status = filters.status
  }
  const response = await api.get('/api/requests', { params })
  return response.data
}

export const createBloodRequest = async (requestData) => {
  const response = await api.post('/api/requests', requestData)
  return response.data
}

export const acceptBloodRequest = async (requestId, { donorId, notes }) => {
  const response = await api.post(`/api/requests/${requestId}/accept`, {
    donorId,
    notes,
  })
  return response.data
}

export const rejectBloodRequest = async (requestId, { donorId, reason }) => {
  const response = await api.post(`/api/requests/${requestId}/reject`, {
    donorId,
    reason,
  })
  return response.data
}

export const closeBloodRequest = async (requestId) => {
  const response = await api.post(`/api/requests/${requestId}/close`)
  return response.data
}

export const getRequestResponses = async (requestId) => {
  const response = await api.get(`/api/requests/${requestId}/responses`)
  return response.data
}

export default api
