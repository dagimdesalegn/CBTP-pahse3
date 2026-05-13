import { createContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) return null

    try {
      const response = await api.get('/me')
      updateUser(response.data)
      return response.data
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      }
      return null
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    refreshUser().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user) return undefined

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUser()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    const refreshInterval = setInterval(refreshUser, 30000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(refreshInterval)
    }
  }, [user?.id])

  const register = async (data) => {
    try {
      setError(null)
      const response = await api.post('/register', data)
      const { user, token } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      return user
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed'
      setError(message)
      throw err
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await api.post('/login', { email, password })
      const { user, token } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      return user
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed'
      setError(message)
      throw err
    }
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
