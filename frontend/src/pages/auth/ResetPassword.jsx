import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import Toast from '../../components/Toast'
import { Button } from '../../components/ui'
import BrandLogo from '../../components/BrandLogo'
import api from '../../services/api'

export default function ResetPassword() {
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token') || ''
  const email = params.get('email') || ''
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (password !== passwordConfirmation) {
      setToast({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/password/reset', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      })
      setToast({ type: 'success', message: response.data.message })
      setTimeout(() => navigate('/login'), 1200)
    } catch (error) {
      const validationErrors = error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(' ') : null
      setToast({ type: 'error', message: validationErrors || error.response?.data?.message || 'Could not reset password.' })
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
            <h1 className="mt-4 text-3xl font-black text-slate-950">Reset password</h1>
            <p className="mt-2 text-sm text-slate-600">Choose a new password for {email || 'your account'}.</p>
          </div>

          {!token || !email ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
              This reset link is missing required information. Please request a new one.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <label>
                <span className="ui-label">New password</span>
                <span className="relative block">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="ui-input pl-10" />
                </span>
              </label>
              <label>
                <span className="ui-label">Confirm new password</span>
                <span className="relative block">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required minLength={8} className="ui-input pl-10" />
                </span>
              </label>
              <Button type="submit" disabled={loading} className="w-full">{loading ? 'Resetting...' : 'Reset password'}</Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link to="/login" className="font-black text-amber-700">Back to sign in</Link>
          </p>
        </div>
      </main>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
