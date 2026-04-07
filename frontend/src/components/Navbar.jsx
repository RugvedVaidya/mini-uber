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
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-slate-800 dark:text-white">🚗 MiniUber</span>
        {role && (
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            role === 'DRIVER'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          }`}>
            {role}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {localStorage.getItem('email')}
        </span>
        <button
          onClick={() => setDark(!dark)}
          className="text-xl hover:scale-110 transition-transform"
          title="Toggle dark mode">
          {dark ? '☀️' : '🌙'}
        </button>
        <button
          onClick={logout}
          className="text-sm text-red-500 hover:text-red-700 dark:text-red-400">
          Logout
        </button>
      </div>
    </nav>
  )
}