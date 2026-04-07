import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'

export default function LoginPage() {
  const navigate = useNavigate()
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
        setError('Registered! Please login.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-slate-800 mb-1">🚗 MiniUber</div>
          <p className="text-slate-500 text-sm">Your ride, your way</p>
        </div>

        <div className="flex rounded-lg border border-slate-200 p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              isLogin ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700'
            }`}>
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              !isLogin ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700'
            }`}>
            Register
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                name="name" placeholder="Full Name" value={form.name}
                onChange={handle} required
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              />
              <input
                name="phone" placeholder="Phone Number" value={form.phone}
                onChange={handle} required
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              />
              <select
                name="role" value={form.role} onChange={handle}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-slate-400 bg-white">
                <option value="RIDER">Rider</option>
                <option value="DRIVER">Driver</option>
              </select>
            </>
          )}

          <input
            name="email" type="email" placeholder="Email" value={form.email}
            onChange={handle} required
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-slate-400"
          />
          <input
            name="password" type="password" placeholder="Password" value={form.password}
            onChange={handle} required
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-slate-400"
          />

          {error && (
            <div className={`text-sm px-4 py-2 rounded-lg ${
              error.includes('Registered') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-600'
            }`}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50">
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}