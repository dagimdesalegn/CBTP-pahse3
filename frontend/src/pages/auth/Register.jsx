import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Mail, Store, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Toast from '../../components/Toast'
import { Button } from '../../components/ui'

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_URL || ''
    const base = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase
    window.location.href = `${base}/api/auth/google/redirect`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreedToTerms) {
      setToast({ type: 'error', message: 'Please agree to the Terms of Service and Privacy Policy' })
      return
    }
    if (formData.password !== formData.password_confirmation) {
      setToast({ type: 'error', message: 'Passwords do not match' })
      return
    }
    setLoading(true)
    try {
      await register({ ...formData, name: formData.name.trim(), email: formData.email.trim() })
      setToast({ type: 'success', message: 'Registration successful! Redirecting...' })
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (error) {
      const validationErrors = error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(' ') : null
      setToast({ type: 'error', message: validationErrors || error.response?.data?.error || 'Registration failed' })
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Amanuel Bekele' },
    { name: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'amanuel@example.com' },
    { name: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: 'Min 8 characters' },
    { name: 'password_confirmation', label: 'Confirm Password', icon: Lock, type: 'password', placeholder: 'Re-enter password' },
  ]

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <main className="flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-7 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-amber-400 text-slate-950"><Store size={28} /></div>
              <h1 className="mt-4 text-3xl font-black text-slate-950">Create account</h1>
              <p className="mt-2 text-sm text-slate-600">Join Shemachoch and start your verification.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(field => {
                const Icon = field.icon
                return (
                  <label key={field.name}>
                    <span className="ui-label">{field.label}</span>
                    <span className="relative block">
                      <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        placeholder={field.placeholder}
                        required
                        className="ui-input pl-10"
                      />
                    </span>
                  </label>
                )
              })}

              <label className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-sm text-slate-700">
                <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" required />
                <span>I agree to the <span className="font-bold text-slate-950">Terms of Service</span> and <span className="font-bold text-slate-950">Privacy Policy</span>.</span>
              </label>

              <Button type="submit" disabled={loading} className="w-full">{loading ? 'Creating account...' : 'Create Account'}</Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs font-bold text-slate-400">
              <div className="h-px flex-1 bg-slate-200" /> OR <div className="h-px flex-1 bg-slate-200" />
            </div>
            <button type="button" onClick={handleGoogleLogin} className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account? <Link to="/login" className="font-black text-amber-700">Sign in</Link>
            </p>
          </div>
        </main>

        <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-300">Shemachoch commerce</p>
          <h2 className="mt-4 max-w-xl text-5xl font-black leading-tight">A professional shopping and operations portal for the whole store.</h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">Create an account, submit verification, and access member pricing once approved.</p>
        </section>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
