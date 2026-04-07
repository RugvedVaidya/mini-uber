import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingApi, locationApi } from '../api'

const STATUS_COLORS = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
}

export default function DriverDashboard() {
  const navigate = useNavigate()
  const [rides, setRides] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState({ lat: '18.5204', lng: '73.8567' })
  const email = localStorage.getItem('email')
  const driverId = 'driver-' + email?.split('@')[0]

  useEffect(() => {
    fetchRides()
    const interval = setInterval(fetchRides, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchRides = async () => {
    try {
        const pending = await bookingApi.pendingRides()
        const mine = await bookingApi.myRides()
        const allRides = [...pending.data, ...mine.data]
        const unique = allRides.filter((r, i, a) => a.findIndex(x => x.id === r.id) === i)
        setRides(unique)
    } catch {}
  }

  const acceptRide = async (id) => {
    setLoading(true)
    try {
      await bookingApi.acceptRide(id)
      setMsg('Ride accepted!')
      fetchRides()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed')
    }
    setLoading(false)
  }

  const startRide = async (id) => {
    setLoading(true)
    try {
      await bookingApi.startRide(id)
      setMsg('Ride started!')
      fetchRides()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed')
    }
    setLoading(false)
  }

  const completeRide = async (id) => {
    setLoading(true)
    try {
      await bookingApi.completeRide(id)
      setMsg('Ride completed!')
      fetchRides()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed')
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
      setMsg('Location updated!')
    } catch {
      setMsg('Location update failed')
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const activeRide = rides.find(r => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status))
  const requestedRides = rides.filter(r => r.status === 'REQUESTED')
  const completedRides = rides.filter(r => r.status === 'COMPLETED')

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-800">🚗 MiniUber</span>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Driver</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{email}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {msg && (
          <div className="px-4 py-3 rounded-lg text-sm bg-blue-50 text-blue-700">{msg}</div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-400 mb-1">Pending Rides</div>
            <div className="text-2xl font-bold text-yellow-600">{requestedRides.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-400 mb-1">Active Ride</div>
            <div className="text-2xl font-bold text-blue-600">{activeRide ? 1 : 0}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-400 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">{completedRides.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Update My Location</h2>
          <div className="flex gap-3 items-end">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Latitude</label>
              <input value={location.lat}
                onChange={e => setLocation({...location, lat: e.target.value})}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 w-36"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Longitude</label>
              <input value={location.lng}
                onChange={e => setLocation({...location, lng: e.target.value})}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 w-36"
              />
            </div>
            <button onClick={updateLocation}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
              Update Location
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Driver ID: {driverId}</p>
        </div>

        {activeRide && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-base font-semibold text-blue-800">Active Ride</h2>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[activeRide.status]}`}>
                {activeRide.status}
              </span>
            </div>
            <div className="text-sm text-blue-700 mb-4">
              {activeRide.pickupAddress} → {activeRide.dropoffAddress}
            </div>
            <div className="flex gap-2">
              {activeRide.status === 'ACCEPTED' && (
                <button onClick={() => startRide(activeRide.id)} disabled={loading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
                  Start Ride
                </button>
              )}
              {activeRide.status === 'IN_PROGRESS' && (
                <button onClick={() => completeRide(activeRide.id)} disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                  Complete Ride
                </button>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-slate-800">
              Pending Requests ({requestedRides.length})
            </h2>
            <button onClick={fetchRides} className="text-xs text-slate-500 hover:text-slate-700">
              ↻ Refresh
            </button>
          </div>

          {requestedRides.length === 0 && (
            <div className="text-center text-slate-400 py-8 text-sm">
              No pending ride requests
            </div>
          )}

          <div className="space-y-3">
            {requestedRides.map(ride => (
              <div key={ride.id} className="border border-slate-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-slate-700">
                    {ride.pickupAddress} → {ride.dropoffAddress}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {new Date(ride.requestedAt).toLocaleTimeString()}
                  </div>
                </div>
                <button onClick={() => acceptRide(ride.id)} disabled={loading || !!activeRide}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-40">
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>

        {completedRides.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">
              Completed Rides ({completedRides.length})
            </h2>
            <div className="space-y-3">
              {completedRides.map(ride => (
                <div key={ride.id} className="border border-slate-100 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-slate-700">
                      {ride.pickupAddress} → {ride.dropoffAddress}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Completed at {ride.completedAt ? new Date(ride.completedAt).toLocaleTimeString() : '—'}
                    </div>
                  </div>
                  <div className="text-green-600 font-semibold text-sm">₹{ride.fareAmount}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}