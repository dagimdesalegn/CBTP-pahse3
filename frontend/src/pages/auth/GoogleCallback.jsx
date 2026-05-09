import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const { updateUser } = useAuth()

  useEffect(() => {
    const finishLogin = async () => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')

      if (!token) {
        setError('Google login failed. Please try again.')
        return
      }

      // updateUser is obtained from hook above

      try {
        localStorage.setItem('token', token)
        // set axios default Authorization header correctly
        if (api.defaults && api.defaults.headers) {
          api.defaults.headers.common = api.defaults.headers.common || {}
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }

        // attempt to fetch user; retry once if first call fails
        let response
        try {
          response = await api.get('/me')
        } catch (firstErr) {
          // small delay then retry once
          await new Promise((r) => setTimeout(r, 300))
          response = await api.get('/me')
        }

        localStorage.setItem('user', JSON.stringify(response.data))
        // update Auth context so app components recognize the user immediately
        if (typeof updateUser === 'function') updateUser(response.data)
        navigate('/dashboard', { replace: true })
      } catch (err) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setError('Unable to complete Google login. Please try again.')
      }
    }

    finishLogin()
  }, [navigate, updateUser])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
          <p className="text-lg font-semibold text-gray-800 mb-2">Login Error</p>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
        <p className="text-lg font-semibold text-gray-800 mb-2">Signing you in...</p>
        <p className="text-sm text-gray-600">Please wait.</p>
      </div>
    </div>
  )
}
