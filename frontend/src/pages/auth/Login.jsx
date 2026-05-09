import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Mail, Store } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Toast from '../../components/Toast'
import { Button } from '../../components/ui'

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
      setToast({ type: 'error', message: error.response?.data?.error || 'Login failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_URL || ''
    const base = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase
    window.location.href = `${base}/api/auth/google/redirect`
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-400 text-slate-950"><Store size={24} /></span>
            <div>
              <p className="text-2xl font-black">Shemachoch</p>
              <p className="text-sm font-semibold text-slate-400">Professional ecommerce portal</p>
            </div>
          </div>
          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-300">Member commerce</p>
            <h1 className="mt-4 text-5xl font-black leading-tight">Shop, verify, and manage orders from one polished workspace.</h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">A dense, operational experience for members, managers, and administrators.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {['Live inventory', 'Secure checkout', 'Admin reports'].map(item => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4 font-bold text-slate-200">{item}</div>
            ))}
          </div>
        </section>

        <main className="flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-amber-400 text-slate-950 lg:hidden"><Store size={28} /></div>
              <h1 className="mt-4 text-3xl font-black text-slate-950">Sign in</h1>
              <p className="mt-2 text-sm text-slate-600">Access your Shemachoch workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label>
                <span className="ui-label">Email Address</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required className="ui-input pl-10" />
                </span>
              </label>
              <label>
                <span className="ui-label">Password</span>
                <span className="relative block">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="ui-input pl-10" />
                </span>
              </label>
              <Button type="submit" disabled={loading} className="w-full">{loading ? 'Signing in...' : 'Sign In'}</Button>
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
              Do not have an account? <Link to="/register" className="font-black text-amber-700">Create one</Link>
            </p>

            <div className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
              <p className="font-black uppercase tracking-wide text-slate-800">Demo Accounts</p>
              <p className="mt-2"><span className="font-mono">admin@gmail.com</span> / <span className="font-mono">admin@123456</span></p>
              <p className="mt-1"><span className="font-mono">manager@gmail.com</span> / <span className="font-mono">manager@123456</span></p>
            </div>
          </div>
        </main>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
