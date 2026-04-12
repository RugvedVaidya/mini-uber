import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ role }) {
  const { dark, setDark } = useTheme()
  const navigate = useNavigate()

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
            <span className="text-sm">🚗</span>
          </div>
          <span className="text-lg font-bold text-slate-800 dark:text-white">MiniUber</span>
          {role && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              role === 'DRIVER'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                : 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400'
            }`}>
              {role === 'DRIVER' ? '🚗 Driver' : '🧑 Rider'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
            {localStorage.getItem('email')}
          </span>
          <button onClick={() => setDark(!dark)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            <span className="text-base">{dark ? '☀️' : '🌙'}</span>
          </button>
          <button onClick={logout}
            className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}