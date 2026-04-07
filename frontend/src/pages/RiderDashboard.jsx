import { useState, useEffect } from 'react'
import { bookingApi, paymentApi } from '../api'
import Navbar from '../components/Navbar'
import RideMap from '../components/RideMap'

const STATUS_COLORS = {
  REQUESTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ACCEPTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export default function RiderDashboard() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [payment, setPayment] = useState(null)
  const [tab, setTab] = useState('book')
  const [showMap, setShowMap] = useState(false)
  const [form, setForm] = useState({
    pickupLat: '19.0760', pickupLng: '72.8777',
    dropoffLat: '19.1136', dropoffLng: '72.8697',
    pickupAddress: 'Mumbai CST',
    dropoffAddress: 'Bandra Station'
  })

  useEffect(() => { fetchRides() }, [])

  const fetchRides = async () => {
    try {
      const res = await bookingApi.myRides()
      setRides(res.data)
    } catch {}
  }

  const bookRide = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      await bookingApi.requestRide({
        pickupLat: parseFloat(form.pickupLat),
        pickupLng: parseFloat(form.pickupLng),
        dropoffLat: parseFloat(form.dropoffLat),
        dropoffLng: parseFloat(form.dropoffLng),
        pickupAddress: form.pickupAddress,
        dropoffAddress: form.dropoffAddress,
      })
      setMsg('Ride requested! Waiting for driver...')
      setTab('rides')
      fetchRides()
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to book ride')
    }
    setLoading(false)
  }

  const refreshRide = async (id) => {
    try {
      const res = await bookingApi.getRide(id)
      setRides(prev => prev.map(r => r.id === id ? res.data : r))
    } catch {}
  }

  const initiatePayment = async (ride) => {
    setLoading(true)
    try {
      const res = await paymentApi.initiate({ rideId: ride.id, amount: ride.fareAmount, method: 'UPI' })
      const processed = await paymentApi.process(res.data.id)
      setPayment(processed.data)
      setMsg(`Payment ${processed.data.status}! ₹${processed.data.amount}`)
    } catch {
      setMsg('Payment failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Navbar role="RIDER" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          {['book', 'rides'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-slate-800 dark:bg-slate-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}>
              {t === 'book' ? 'Book a Ride' : `My Rides (${rides.length})`}
            </button>
          ))}
        </div>

        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            msg.toLowerCase().includes('fail')
              ? 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
              : 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
          }`}>{msg}</div>
        )}

        {tab === 'book' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Book a Ride</h2>

            <form onSubmit={bookRide} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Pickup Address</label>
                  <input value={form.pickupAddress}
                    onChange={e => setForm({...form, pickupAddress: e.target.value})}
                    className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none"
                    placeholder="Pickup location" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Dropoff Address</label>
                  <input value={form.dropoffAddress}
                    onChange={e => setForm({...form, dropoffAddress: e.target.value})}
                    className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none"
                    placeholder="Dropoff location" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Pickup Coordinates</label>
                  <div className="flex gap-2">
                    <input value={form.pickupLat} onChange={e => setForm({...form, pickupLat: e.target.value})}
                      className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none" placeholder="Lat" />
                    <input value={form.pickupLng} onChange={e => setForm({...form, pickupLng: e.target.value})}
                      className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none" placeholder="Lng" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Dropoff Coordinates</label>
                  <div className="flex gap-2">
                    <input value={form.dropoffLat} onChange={e => setForm({...form, dropoffLat: e.target.value})}
                      className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none" placeholder="Lat" />
                    <input value={form.dropoffLng} onChange={e => setForm({...form, dropoffLng: e.target.value})}
                      className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none" placeholder="Lng" />
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => setShowMap(!showMap)}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                {showMap ? 'Hide Map Preview' : 'Show Map Preview'}
              </button>

              {showMap && (
                <RideMap
                  pickupLat={form.pickupLat} pickupLng={form.pickupLng}
                  dropoffLat={form.dropoffLat} dropoffLng={form.dropoffLng}
                  pickupAddress={form.pickupAddress} dropoffAddress={form.dropoffAddress}
                />
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-slate-800 dark:bg-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-slate-700 dark:hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {loading ? 'Booking...' : 'Request Ride'}
              </button>
            </form>
          </div>
        )}

        {tab === 'rides' && (
          <div className="space-y-4">
            <button onClick={fetchRides}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 flex items-center gap-1">
              ↻ Refresh
            </button>

            {rides.length === 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-400">
                No rides yet. Book your first ride!
              </div>
            )}

            {rides.map(ride => (
              <div key={ride.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-medium text-slate-800 dark:text-white">
                      {ride.pickupAddress} → {ride.dropoffAddress}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{ride.id}</div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[ride.status]}`}>
                    {ride.status}
                  </span>
                </div>

                <RideMap
                  pickupLat={ride.pickupLat} pickupLng={ride.pickupLng}
                  dropoffLat={ride.dropoffLat} dropoffLng={ride.dropoffLng}
                  pickupAddress={ride.pickupAddress} dropoffAddress={ride.dropoffAddress}
                />

                <div className="grid grid-cols-3 gap-4 mt-4 mb-4">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Fare</div>
                    <div className="font-semibold text-slate-800 dark:text-white">
                      {ride.fareAmount ? `₹${ride.fareAmount}` : '—'}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Requested</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {ride.requestedAt ? new Date(ride.requestedAt).toLocaleTimeString() : '—'}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Completed</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {ride.completedAt ? new Date(ride.completedAt).toLocaleTimeString() : '—'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => refreshRide(ride.id)}
                    className="text-xs border border-slate-200 dark:border-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                    Refresh Status
                  </button>
                  {ride.status === 'COMPLETED' && ride.fareAmount && (
                    <button onClick={() => initiatePayment(ride)} disabled={loading}
                      className="text-xs bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
                      {loading ? 'Processing...' : `Pay ₹${ride.fareAmount}`}
                    </button>
                  )}
                </div>

                {payment && payment.rideId === ride.id && (
                  <div className={`mt-3 text-sm px-4 py-2 rounded-lg ${
                    payment.status === 'SUCCESS'
                      ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
                  }`}>
                    Payment {payment.status} — ₹{payment.amount} via {payment.method}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}