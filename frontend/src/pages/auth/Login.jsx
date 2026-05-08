import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Toast from '../../components/Toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Login failed',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Google OAuth will be implemented via backend
     setToast({
       type: 'info',
       message: 'Google login coming soon',
     })
  }

  return (
     <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4 py-8">
       <div className="w-full max-w-sm">
         {/* Card Container - Professional sizing */}
         <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
           {/* Header with gradient - Optimized height */}
           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12">
            <div className="text-center">
               <div className="text-5xl mb-3">🏪</div>
               <h1 className="text-4xl font-bold text-white mb-2">Coop Store</h1>
               <p className="text-blue-100 text-sm font-medium">Member Portal</p>
            </div>
          </div>

           {/* Form Content - Better spacing */}
           <div className="px-8 py-10">
             <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                 <label className="block text-sm font-bold text-gray-800 mb-2.5">
                   📧 Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                   className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium placeholder-gray-400"
                />
              </div>

              {/* Password Input */}
              <div>
                 <label className="block text-sm font-bold text-gray-800 mb-2.5">
                   🔐 Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                   className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium"
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="#"
                   className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

               {/* Login Button - Larger, more prominent */}
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
                     Signing in...
                  </span>
                ) : (
                   'Sign In'
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
              onClick={handleGoogleLogin}
               className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-bold text-gray-800"
            >
               <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
               <span>Google</span>
            </button>

            {/* Register Link */}
             <p className="text-center text-gray-700 mt-8 text-sm font-medium">
              Don't have an account?{' '}
               <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                 Create one
              </Link>
            </p>
          </div>

           {/* Footer Info Box - Professional styling */}
           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-t-2 border-gray-100">
             <p className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wider">📝 Demo Accounts</p>
             <div className="space-y-2 text-xs text-gray-700">
               <p>👨‍💼 <span className="font-mono bg-gray-200 px-2 py-1 rounded">admin@example.com</span> / <span className="font-mono bg-gray-200 px-2 py-1 rounded">admin@123456</span></p>
               <p>👔 <span className="font-mono bg-gray-200 px-2 py-1 rounded">manager@example.com</span> / <span className="font-mono bg-gray-200 px-2 py-1 rounded">manager@123456</span></p>
               <p>👤 <span className="font-mono bg-gray-200 px-2 py-1 rounded">member@example.com</span> / <span className="font-mono bg-gray-200 px-2 py-1 rounded">member@123456</span></p>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
