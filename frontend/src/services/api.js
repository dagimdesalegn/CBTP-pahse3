import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || '/api'

const resolveBaseUrl = () => {
  if (apiUrl !== '/api') {
    return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`
  }

  if (typeof window === 'undefined') {
    return '/api'
  }

  const { protocol, hostname, port } = window.location

  if (hostname.includes('.app.github.dev')) {
    const hostParts = hostname.split('.')
    const subdomain = hostParts[0]
    const updatedSubdomain = subdomain.replace(/-5173$/, '-8000')
    return `${protocol}//${updatedSubdomain}.${hostParts.slice(1).join('.')}/api`
  }

  if (port === '5173') {
    return `${protocol}//${hostname}:8000/api`
  }

  return '/api'
}

const baseURL = resolveBaseUrl()

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
