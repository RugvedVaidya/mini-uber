import { useState, useEffect } from 'react'
import { bookingApi, locationApi } from '../api'
import Navbar from '../components/Navbar'
import RideMap from '../components/RideMap'

const STATUS_CONFIG = {
  REQUESTED: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400', label: 'Requested' },
  ACCEPTED: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400', label: 'Accepted' },
  IN_PROGRESS: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400', label: 'In Progress' },
  COMPLETED: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400', label: 'Completed' },
}

export default function DriverDashboard() {
  const [rides, setRides] = useState([])
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState({ lat: '18.5204', lng: '73.8567' })
  const email = localStorage.getItem('email')
  const driverId = 'driver-' + email?.split('@')[0]

  useEffect(() => {
    fetchRides()
    const interval = setInterval(fetchRides, 5000)
    return () => clearInterval(interval)
  }, [])

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 4000)
  }

  const fetchRides = async () => {
    try {
      const pending = await bookingApi.pendingRides()
      const mine = await bookingApi.myRides()
      const all = [...pending.data, ...mine.data]
      const unique = all.filter((r, i, a) => a.findIndex(x => x.id === r.id) === i)
      setRides(unique)
    } catch {}
  }

  const acceptRide = async (id) => {
    setLoading(true)
    try {
      await bookingApi.acceptRide(id)
      showMsg('Ride accepted! Head to pickup location.')
      fetchRides()
    } catch (err) {
      showMsg(err.response?.data?.error || 'Failed to accept ride', 'error')
    }
    setLoading(false)
  }

  const startRide = async (id) => {
    setLoading(true)
    try {
      await bookingApi.startRide(id)
      showMsg('Ride started! Have a safe journey.')
      fetchRides()
    } catch (err) {
      showMsg(err.response?.data?.error || 'Failed', 'error')
    }
    setLoading(false)
  }

  const completeRide = async (id) => {
    setLoading(true)
    try {
      await bookingApi.completeRide(id)
      showMsg('Ride completed! Great job.')
      fetchRides()
    } catch (err) {
      showMsg(err.response?.data?.error || 'Failed', 'error')
    }
    setLoading(false)
  }

  const updateLocation = async () => {
    try {
      await locationApi.update({
        driverId,
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lng),
      })
      showMsg('Location updated!')
    } catch {
      showMsg('Location update failed', 'error')
    }
  }

  const activeRide = rides.find(r => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status))
  const requestedRides = rides.filter(r => r.status === 'REQUESTED')
  const completedRides = rides.filter(r => r.status === 'COMPLETED')

  const totalEarnings = completedRides.reduce((sum, r) => sum + (parseFloat(r.fareAmount) || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar role="DRIVER" />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {msg.text && (
          <div className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in ${
            msg.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
              : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
          }`}>
            <span>{msg.type === 'error' ? '⚠' : '✓'}</span>
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pending', value: requestedRides.length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: '⏳' },
            { label: 'Active', value: activeRide ? 1 : 0, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: '🚗' },
            { label: 'Earned', value: `₹${totalEarnings.toFixed(0)}`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: '💰' },
          ].map(s => (
            <div key={s.label} className={`card p-4 ${s.bg} border-0`}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {activeRide && (
          <div className="card overflow-hidden animate-slide-up">
            <div className={`px-5 py-3 flex items-center justify-between ${
              activeRide.status === 'ACCEPTED'
                ? 'bg-blue-600'
                : 'bg-purple-600'
            }`}>
              <div className="flex items-center gap-2 text-white">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">
                  {activeRide.status === 'ACCEPTED' ? 'Head to Pickup' : 'Ride In Progress'}
                </span>
              </div>
              <span className="text-white/80 text-sm font-bold">
                ₹{activeRide.fareAmount || '—'}
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3 h-3 rounded-full bg-brand-500 border-2 border-white dark:border-slate-900 shadow"></div>
                  <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700 my-1"></div>
                  <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white dark:border-slate-900 shadow"></div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800 dark:text-white mb-1">
                    {activeRide.pickupAddress}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {activeRide.dropoffAddress}
                  </div>
                </div>
              </div>

              <RideMap
                pickupLat={activeRide.pickupLat} pickupLng={activeRide.pickupLng}
                dropoffLat={activeRide.dropoffLat} dropoffLng={activeRide.dropoffLng}
                pickupAddress={activeRide.pickupAddress} dropoffAddress={activeRide.dropoffAddress}
              />

              <div className="flex gap-3 mt-4">
                {activeRide.status === 'ACCEPTED' && (
                  <button onClick={() => startRide(activeRide.id)} disabled={loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl py-3 text-sm transition-all active:scale-95 disabled:opacity-50">
                    🚗 Start Ride
                  </button>
                )}
                {activeRide.status === 'IN_PROGRESS' && (
                  <button onClick={() => completeRide(activeRide.id)} disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl py-3 text-sm transition-all active:scale-95 disabled:opacity-50">
                    ✓ Complete Ride
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            📍 My Location
            <span className="text-xs text-slate-400 font-normal">ID: {driverId}</span>
          </h3>
          <div className="flex gap-3 items-end mb-4 flex-wrap">
            <div className="flex-1 min-w-24">
              <label className="text-xs text-slate-400 mb-1 block">Latitude</label>
              <input value={location.lat}
                onChange={e => setLocation({ ...location, lat: e.target.value })}
                className="input text-sm" />
            </div>
            <div className="flex-1 min-w-24">
              <label className="text-xs text-slate-400 mb-1 block">Longitude</label>
              <input value={location.lng}
                onChange={e => setLocation({ ...location, lng: e.target.value })}
                className="input text-sm" />
            </div>
            <button onClick={updateLocation}
              className="btn-primary py-3 flex-shrink-0">
              Update
            </button>
          </div>
          <RideMap
            pickupLat={location.lat} pickupLng={location.lng}
            dropoffLat={parseFloat(location.lat) + 0.005}
            dropoffLng={parseFloat(location.lng) + 0.005}
            pickupAddress="Your Location" dropoffAddress=""
          />
        </div>

        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Pending Requests ({requestedRides.length})
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400">Auto-refreshing</span>
            </div>
          </div>

          {requestedRides.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm text-slate-400">No pending ride requests</p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                New rides will appear automatically
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requestedRides.map(ride => (
                <div key={ride.id}
                  className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 hover:border-brand-200 dark:hover:border-brand-800 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0"></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {ride.pickupAddress}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                        <span className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {ride.dropoffAddress}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                        {new Date(ride.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button onClick={() => acceptRide(ride.id)}
                      disabled={loading || !!activeRide}
                      className="btn-primary text-xs py-2 ml-3 flex-shrink-0 disabled:opacity-40">
                      Accept
                    </button>
                  </div>
                  <RideMap
                    pickupLat={ride.pickupLat} pickupLng={ride.pickupLng}
                    dropoffLat={ride.dropoffLat} dropoffLng={ride.dropoffLng}
                    pickupAddress={ride.pickupAddress} dropoffAddress={ride.dropoffAddress}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {completedRides.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Completed Rides ({completedRides.length})
            </h3>
            <div className="space-y-2">
              {completedRides.map(ride => (
                <div key={ride.id}
                  className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                      {ride.pickupAddress} → {ride.dropoffAddress}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {ride.completedAt
                        ? new Date(ride.completedAt).toLocaleString([], {
                            hour: '2-digit', minute: '2-digit',
                            month: 'short', day: 'numeric'
                          })
                        : '—'}
                    </div>
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm ml-3">
                    +₹{ride.fareAmount}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-sm text-slate-500">Total Earnings</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ₹{totalEarnings.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}