import { useState, useEffect, useRef } from 'react'

export default function AddressSearch({ label, value, onChange, onCoordinatesChange }) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      return
    }
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
        setShowDropdown(true)
      } catch {}
      setLoading(false)
    }, 500)
  }, [query])

  const select = (place) => {
    const address = place.display_name.split(',').slice(0, 3).join(',')
    setQuery(address)
    onChange(address)
    onCoordinatesChange(parseFloat(place.lat), parseFloat(place.lon))
    setShowDropdown(false)
    setResults([])
  }

  return (
    <div className="relative">
      <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">{label}</label>
      <div className="relative">
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value) }}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={`Search ${label}...`}
          className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
          {results.map((place, i) => (
            <button key={i} onMouseDown={() => select(place)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <div className="font-medium text-xs">
                {place.display_name.split(',').slice(0, 2).join(',')}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {place.display_name.split(',').slice(2, 4).join(',')}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}