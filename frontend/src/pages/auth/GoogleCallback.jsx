import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const finishLogin = async () => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')

      if (!token) {
        setError('Google login failed. Please try again.')
        return
      }

      try {
        localStorage.setItem('token', token)
        const response = await api.get('/me')
        localStorage.setItem('user', JSON.stringify(response.data))
        navigate('/dashboard')
      } catch (err) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setError('Unable to complete Google login. Please try again.')
      }
    }

    finishLogin()
  }, [navigate])

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
