import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Toast from '../../components/Toast'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    kebele_id: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!agreedToTerms) {
      setToast({
        type: 'error',
        message: 'Please agree to the Terms of Service and Privacy Policy',
      })
      return
    }

    if (formData.password !== formData.password_confirmation) {
      setToast({
        type: 'error',
        message: 'Passwords do not match',
      })
      return
    }

    setLoading(true)

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        kebele_id: formData.kebele_id.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      })
      setToast({
        type: 'success',
        message: 'Registration successful! Redirecting...',
      })
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (error) {
      const validationErrors = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : null

      setToast({
        type: 'error',
        message: validationErrors || error.response?.data?.error || 'Registration failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-sm">
        {/* Card Container - Professional sizing */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12">
            <div className="text-center">
              <div className="text-5xl mb-3">🏪</div>
              <h1 className="text-4xl font-bold text-white mb-2">Join Coop Store</h1>
              <p className="text-blue-100 text-sm font-medium">Create your member account</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-10 max-h-[calc(100vh-220px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2.5">
                  👤 Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2.5">
                  📧 Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium"
                />
              </div>

              {/* Kebele ID Input */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2.5">
                  🪪 Kebele ID
                </label>
                <input
                  type="text"
                  name="kebele_id"
                  value={formData.kebele_id}
                  onChange={handleChange}
                  placeholder="Your Kebele ID"
                  required
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2.5">
                  🔐 Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  required
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium"
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2.5">
                  🔒 Confirm Password
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1 cursor-pointer"
                  required
                />
                <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 cursor-pointer">
                  I agree to the <span className="font-semibold text-blue-600">Terms of Service</span> and{' '}
                  <span className="font-semibold text-blue-600">Privacy Policy</span>
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-600 font-semibold">OR</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-bold text-gray-800"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-700 mt-8 text-sm font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
