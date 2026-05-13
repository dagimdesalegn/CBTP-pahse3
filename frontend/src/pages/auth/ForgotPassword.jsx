import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import Toast from '../../components/Toast'
import { Button } from '../../components/ui'
import BrandLogo from '../../components/BrandLogo'
import api from '../../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/password/forgot', { email: email.trim() })
      setSent(true)
      setToast({ type: 'success', message: response.data.message })
    } catch (error) {
      const validationErrors = error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(' ') : null
      setToast({ type: 'error', message: validationErrors || 'Could not send reset link.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-20 w-52 items-center justify-center"><BrandLogo tone="light" className="h-full w-full" /></div>
            <h1 className="mt-4 text-3xl font-black text-slate-950">Forgot password</h1>
            <p className="mt-2 text-sm text-slate-600">Enter your email and we will send a password reset link.</p>
          </div>

          {sent ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              Check your email for the reset link. It expires in 60 minutes.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <label>
                <span className="ui-label">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="ui-input pl-10" placeholder="you@example.com" />
                </span>
              </label>
              <Button type="submit" disabled={loading} className="w-full">{loading ? 'Sending...' : 'Send reset link'}</Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-600">
            Remember your password? <Link to="/login" className="font-black text-amber-700">Sign in</Link>
          </p>
        </div>
      </main>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
