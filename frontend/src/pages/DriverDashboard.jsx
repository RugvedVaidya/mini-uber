import { useState, useEffect } from 'react'
import { bookingApi, locationApi } from '../api'
import Navbar from '../components/Navbar'
import RideMap from '../components/RideMap'

const STATUS_COLORS = {
  REQUESTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ACCEPTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
}

export default function DriverDashboard() {
  const [rides, setRides] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState({ lat: '18.5204', lng: '73.8567' })
  const email = localStorage.getItem('email')
  const driverId = 'driver-' + email?.split('@')[0]

  useEffect(() => {
    fetchRides()
    const interval = setInterval(fetchRides, 5000)
    return () => clearInterval(interval)
  }, [])

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
      setMsg('Ride accepted!')
      fetchRides()
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed')
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
      setMsg(err.response?.data?.error || 'Failed')
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
      setMsg(err.response?.data?.error || 'Failed')
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

  const activeRide = rides.find(r => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status))
  const requestedRides = rides.filter(r => r.status === 'REQUESTED')
  const completedRides = rides.filter(r => r.status === 'COMPLETED')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Navbar role="DRIVER" />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {msg && (
          <div className="px-4 py-3 rounded-lg text-sm bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            {msg}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending Rides', value: requestedRides.length, color: 'text-yellow-600 dark:text-yellow-400' },
            { label: 'Active Ride', value: activeRide ? 1 : 0, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Completed', value: completedRides.length, color: 'text-green-600 dark:text-green-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="text-xs text-slate-400 mb-1">{label}</div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Update My Location</h2>
          <div className="flex gap-3 items-end flex-wrap">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Latitude</label>
              <input value={location.lat} onChange={e => setLocation({...location, lat: e.target.value})}
                className="border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none w-36" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Longitude</label>
              <input value={location.lng} onChange={e => setLocation({...location, lng: e.target.value})}
                className="border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none w-36" />
            </div>
            <button onClick={updateLocation}
              className="bg-slate-800 dark:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 dark:hover:bg-indigo-700">
              Update Location
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Driver ID: {driverId}</p>
          <div className="mt-4">
            <RideMap
              pickupLat={location.lat} pickupLng={location.lng}
              dropoffLat={parseFloat(location.lat) + 0.01}
              dropoffLng={parseFloat(location.lng) + 0.01}
              pickupAddress="Your Location"
              dropoffAddress=""
            />
          </div>
        </div>

        {activeRide && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-base font-semibold text-blue-800 dark:text-blue-300">Active Ride</h2>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[activeRide.status]}`}>
                {activeRide.status}
              </span>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-400 mb-4">
              {activeRide.pickupAddress} → {activeRide.dropoffAddress}
            </div>
            <div className="mb-4">
              <RideMap
                pickupLat={activeRide.pickupLat} pickupLng={activeRide.pickupLng}
                dropoffLat={activeRide.dropoffLat} dropoffLng={activeRide.dropoffLng}
                pickupAddress={activeRide.pickupAddress} dropoffAddress={activeRide.dropoffAddress}
              />
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

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">
              Pending Requests ({requestedRides.length})
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Auto-refreshing</span>
            </div>
          </div>

          {requestedRides.length === 0 && (
            <div className="text-center text-slate-400 py-8 text-sm">No pending ride requests</div>
          )}

          <div className="space-y-3">
            {requestedRides.map(ride => (
              <div key={ride.id} className="border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {ride.pickupAddress} → {ride.dropoffAddress}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(ride.requestedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <button onClick={() => acceptRide(ride.id)}
                    disabled={loading || !!activeRide}
                    className="bg-slate-800 dark:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 dark:hover:bg-indigo-700 disabled:opacity-40">
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
        </div>

        {completedRides.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">
              Completed Rides ({completedRides.length})
            </h2>
            <div className="space-y-3">
              {completedRides.map(ride => (
                <div key={ride.id} className="border border-slate-100 dark:border-slate-700 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
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