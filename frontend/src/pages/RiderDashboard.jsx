import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingApi, paymentApi } from '../api'

const STATUS_COLORS = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function RiderDashboard() {
  const navigate = useNavigate()
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [activeRide, setActiveRide] = useState(null)
  const [payment, setPayment] = useState(null)
  const [tab, setTab] = useState('book')
  const [form, setForm] = useState({
    pickupLat: '19.0760', pickupLng: '72.8777',
    dropoffLat: '19.1136', dropoffLng: '72.8697',
    pickupAddress: 'Mumbai CST',
    dropoffAddress: 'Bandra Station'
  })

  const email = localStorage.getItem('email')

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
      const res = await bookingApi.requestRide({
        pickupLat: parseFloat(form.pickupLat),
        pickupLng: parseFloat(form.pickupLng),
        dropoffLat: parseFloat(form.dropoffLat),
        dropoffLng: parseFloat(form.dropoffLng),
        pickupAddress: form.pickupAddress,
        dropoffAddress: form.dropoffAddress,
      })
      setActiveRide(res.data)
      setMsg('Ride requested! Waiting for driver...')
      setTab('rides')
      fetchRides()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to book ride')
    }
    setLoading(false)
  }

  const refreshRide = async (id) => {
    try {
      const res = await bookingApi.getRide(id)
      setActiveRide(res.data)
      setRides(prev => prev.map(r => r.id === id ? res.data : r))
    } catch {}
  }

  const initiatePayment = async (ride) => {
    setLoading(true)
    try {
      const res = await paymentApi.initiate({
        rideId: ride.id,
        amount: ride.fareAmount,
        method: 'UPI'
      })
      const processed = await paymentApi.process(res.data.id)
      setPayment(processed.data)
      setMsg(`Payment ${processed.data.status}! ₹${processed.data.amount}`)
    } catch (err) {
      setMsg('Payment failed')
    }
    setLoading(false)
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-800">🚗 MiniUber</span>
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">Rider</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{email}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex gap-2 mb-6">
          {['book', 'rides'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}>
              {t === 'book' ? 'Book a Ride' : `My Rides (${rides.length})`}
            </button>
          ))}
        </div>

        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            msg.includes('fail') || msg.includes('Failed')
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}>{msg}</div>
        )}

        {tab === 'book' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Book a Ride</h2>
            <form onSubmit={bookRide} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Pickup Address</label>
                  <input value={form.pickupAddress}
                    onChange={e => setForm({...form, pickupAddress: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400"
                    placeholder="Pickup location" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Dropoff Address</label>
                  <input value={form.dropoffAddress}
                    onChange={e => setForm({...form, dropoffAddress: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400"
                    placeholder="Dropoff location" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Pickup Coordinates</label>
                  <div className="flex gap-2">
                    <input value={form.pickupLat}
                      onChange={e => setForm({...form, pickupLat: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400"
                      placeholder="Lat" />
                    <input value={form.pickupLng}
                      onChange={e => setForm({...form, pickupLng: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400"
                      placeholder="Lng" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Dropoff Coordinates</label>
                  <div className="flex gap-2">
                    <input value={form.dropoffLat}
                      onChange={e => setForm({...form, dropoffLat: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400"
                      placeholder="Lat" />
                    <input value={form.dropoffLng}
                      onChange={e => setForm({...form, dropoffLng: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400"
                      placeholder="Lng" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-slate-800 text-white py-3 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50">
                {loading ? 'Booking...' : 'Request Ride'}
              </button>
            </form>
          </div>
        )}

        {tab === 'rides' && (
          <div className="space-y-4">
            <button onClick={fetchRides}
              className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1">
              ↻ Refresh
            </button>
            {rides.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                No rides yet. Book your first ride!
              </div>
            )}
            {rides.map(ride => (
              <div key={ride.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-medium text-slate-800">{ride.pickupAddress} → {ride.dropoffAddress}</div>
                    <div className="text-xs text-slate-400 mt-1">{ride.id}</div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[ride.status]}`}>
                    {ride.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Fare</div>
                    <div className="font-semibold text-slate-800">
                      {ride.fareAmount ? `₹${ride.fareAmount}` : '—'}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Requested</div>
                    <div className="text-sm text-slate-700">
                      {ride.requestedAt ? new Date(ride.requestedAt).toLocaleTimeString() : '—'}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Completed</div>
                    <div className="text-sm text-slate-700">
                      {ride.completedAt ? new Date(ride.completedAt).toLocaleTimeString() : '—'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => refreshRide(ride.id)}
                    className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
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
                    payment.status === 'SUCCESS' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
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