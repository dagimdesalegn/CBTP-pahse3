import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || '/api'
// If the URL already includes /api, use as-is. Otherwise append /api
const baseURL = apiUrl.endsWith('/api') || apiUrl === '/api' ? apiUrl : `${apiUrl}/api`

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
