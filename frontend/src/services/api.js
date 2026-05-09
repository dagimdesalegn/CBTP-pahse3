import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || '/api'
// If the URL already includes /api, use as-is. Otherwise append /api
const baseURL = apiUrl.endsWith('/api') || apiUrl === '/api' ? apiUrl : `${apiUrl}/api`

const api = axios.create({
  baseURL: baseURL,
  headers: {
    Accept: 'application/json',
  }
})

api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {}
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Let the browser set multipart boundaries for FormData uploads
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
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
