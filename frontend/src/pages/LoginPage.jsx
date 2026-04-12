import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useTheme } from '../context/ThemeContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { dark, setDark } = useTheme()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'RIDER'
  })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isLogin) {
        const res = await authApi.login({ email: form.email, password: form.password })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('role', res.data.role)
        localStorage.setItem('email', form.email)
        navigate(res.data.role === 'DRIVER' ? '/driver' : '/rider')
      } else {
        await authApi.register(form)
        setIsLogin(true)
        setError('Account created! Please login.')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 flex items-center justify-center p-4">

      <button onClick={() => setDark(!dark)}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
        {dark ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-md animate-slide-up">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <span className="text-3xl">🚗</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">MiniUber</h1>
          <p className="text-brand-200 text-sm">Your ride, your way</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8">

          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
            <button onClick={() => { setIsLogin(true); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}>
              Login
            </button>
            <button onClick={() => { setIsLogin(false); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}>
              Register
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                    Full Name
                  </label>
                  <input name="name" placeholder="John Doe" value={form.name}
                    onChange={handle} required className="input" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                    Phone Number
                  </label>
                  <input name="phone" placeholder="9876543210" value={form.phone}
                    onChange={handle} required className="input" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['RIDER', 'DRIVER'].map(r => (
                      <button key={r} type="button"
                        onClick={() => setForm({ ...form, role: r })}
                        className={`py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                          form.role === r
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}>
                        {r === 'RIDER' ? '🧑 Rider' : '🚗 Driver'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                Email
              </label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email}
                onChange={handle} required className="input" />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                Password
              </label>
              <input name="password" type="password" placeholder="••••••••" value={form.password}
                onChange={handle} required className="input" />
            </div>

            {error && (
              <div className={`text-sm px-4 py-3 rounded-xl flex items-center gap-2 ${
                error.includes('created') || error.includes('success')
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}>
                <span>{error.includes('created') ? '✓' : '⚠'}</span>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 text-base mt-2">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Please wait...
                  </span>
                : isLogin ? 'Login to MiniUber' : 'Create Account'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}