import { useState, useEffect, useRef } from 'react'

export default function AddressSearch({ label, value, onChange, onCoordinatesChange, icon }) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selected, setSelected] = useState(false)
  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (selected) return
    if (query.length < 3) { setResults([]); return }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()
        setResults(data)
        setShowDropdown(data.length > 0)
      } catch {}
      setLoading(false)
    }, 500)
  }, [query, selected])

  const select = (place) => {
    const address = place.display_name.split(',').slice(0, 3).join(', ')
    setQuery(address)
    onChange(address)
    onCoordinatesChange(parseFloat(place.lat), parseFloat(place.lon))
    setShowDropdown(false)
    setResults([])
    setSelected(true)
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
    onChange(e.target.value)
    setSelected(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none">
          {icon}
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={`Search ${label}...`}
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-10 py-3 text-sm outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/30 transition-all placeholder:text-slate-400"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading
            ? <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
            : selected
              ? <span className="text-emerald-500 text-sm">✓</span>
              : null
          }
        </div>
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl mt-2 shadow-xl overflow-hidden">
          {results.map((place, i) => (
            <button key={i} onMouseDown={() => select(place)}
              className="w-full text-left px-4 py-3 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0 flex items-start gap-3">
              <span className="text-slate-400 mt-0.5 flex-shrink-0">📍</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {place.display_name.split(',').slice(0, 2).join(',')}
                </div>
                <div className="text-xs text-slate-400 truncate mt-0.5">
                  {place.display_name.split(',').slice(2, 5).join(',')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}