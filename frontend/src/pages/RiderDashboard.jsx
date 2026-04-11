import { useState, useEffect } from 'react'
import { bookingApi, paymentApi } from '../api'
import Navbar from '../components/Navbar'
import RideMap from '../components/RideMap'
import AddressSearch from '../components/AddressSearch'

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
    pickupLat: '19.0760',
    pickupLng: '72.8777',
    dropoffLat: '19.1136',
    dropoffLng: '72.8697',
    pickupAddress: 'Mumbai CST',
    dropoffAddress: 'Bandra Station'
  })

  useEffect(() => {
    fetchRides()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (tab === 'rides') fetchRides()
    }, 5000)
    return () => clearInterval(interval)
  }, [tab])

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

  const handlePayment = async (ride) => {
    setLoading(true)
    try {
      const res = await paymentApi.initiate({
        rideId: ride.id,
        amount: ride.fareAmount,
        method: 'UPI'
      })
      const paymentId = res.data.id

      if (window.Razorpay) {
        const options = {
          key: 'rzp_test_YOUR_KEY_HERE',
          amount: Math.round(ride.fareAmount * 100),
          currency: 'INR',
          name: 'MiniUber',
          description: `${ride.pickupAddress} → ${ride.dropoffAddress}`,
          handler: async function (response) {
            const processed = await paymentApi.process(paymentId)
            setPayment({ ...processed.data, rideId: ride.id })
            setMsg(`Payment ${processed.data.status}! ₹${processed.data.amount}`)
            fetchRides()
          },
          prefill: { email: localStorage.getItem('email') },
          theme: { color: '#1e293b' },
          modal: { ondismiss: () => setLoading(false) }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        const processed = await paymentApi.process(paymentId)
        setPayment({ ...processed.data, rideId: ride.id })
        setMsg(`Payment ${processed.data.status}! ₹${processed.data.amount}`)
        fetchRides()
      }
    } catch {
      setMsg('Payment failed. Please try again.')
    }
    setLoading(false)
  }

  const fareEstimate = () => {
    const distance = Math.sqrt(
      Math.pow(parseFloat(form.dropoffLat) - parseFloat(form.pickupLat), 2) +
      Math.pow(parseFloat(form.dropoffLng) - parseFloat(form.pickupLng), 2)
    ) * 111
    return Math.max(50, Math.round(distance * 12))
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
            msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error')
              ? 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
              : 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
          }`}>
            {msg}
          </div>
        )}

        {tab === 'book' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">
              Book a Ride
            </h2>

            <form onSubmit={bookRide} className="space-y-4">

              <AddressSearch
                label="Pickup Location"
                value={form.pickupAddress}
                onChange={v => setForm({ ...form, pickupAddress: v })}
                onCoordinatesChange={(lat, lng) =>
                  setForm({ ...form, pickupLat: lat.toString(), pickupLng: lng.toString() })
                }
              />

              <AddressSearch
                label="Dropoff Location"
                value={form.dropoffAddress}
                onChange={v => setForm({ ...form, dropoffAddress: v })}
                onCoordinatesChange={(lat, lng) =>
                  setForm({ ...form, dropoffLat: lat.toString(), dropoffLng: lng.toString() })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-xs text-slate-500 dark:text-slate-400">
                  <div className="font-medium mb-1">Pickup Coordinates</div>
                  <div>{parseFloat(form.pickupLat).toFixed(4)}, {parseFloat(form.pickupLng).toFixed(4)}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-xs text-slate-500 dark:text-slate-400">
                  <div className="font-medium mb-1">Dropoff Coordinates</div>
                  <div>{parseFloat(form.dropoffLat).toFixed(4)}, {parseFloat(form.dropoffLng).toFixed(4)}</div>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900 rounded-lg px-4 py-3 flex justify-between items-center">
                <div>
                  <div className="text-xs text-indigo-500 dark:text-indigo-300 mb-1">Estimated Fare</div>
                  <div className="text-xl font-bold text-indigo-700 dark:text-indigo-200">
                    ₹{fareEstimate()}
                  </div>
                </div>
                <div className="text-xs text-indigo-400 dark:text-indigo-300 text-right">
                  <div>Base fare: ₹50</div>
                  <div>Per km: ₹12</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                {showMap ? 'Hide Map Preview' : 'Show Map Preview'}
              </button>

              {showMap && (
                <RideMap
                  pickupLat={form.pickupLat}
                  pickupLng={form.pickupLng}
                  dropoffLat={form.dropoffLat}
                  dropoffLng={form.dropoffLng}
                  pickupAddress={form.pickupAddress}
                  dropoffAddress={form.dropoffAddress}
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-800 dark:bg-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-slate-700 dark:hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {loading ? 'Booking...' : `Request Ride — ₹${fareEstimate()}`}
              </button>
            </form>
          </div>
        )}

        {tab === 'rides' && (
          <div className="space-y-4">

            <div className="flex items-center justify-between">
              <button
                onClick={fetchRides}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 flex items-center gap-1">
                ↻ Refresh
              </button>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Auto-refreshing every 5s
                </span>
              </div>
            </div>

            {rides.length === 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="text-4xl mb-3">🚗</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm">
                  No rides yet. Book your first ride!
                </div>
              </div>
            )}

            {rides.map(ride => (
              <div key={ride.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-medium text-slate-800 dark:text-white">
                      {ride.pickupAddress} → {ride.dropoffAddress}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-mono">{ride.id}</div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[ride.status]}`}>
                    {ride.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mb-4">
                  <RideMap
                    pickupLat={ride.pickupLat}
                    pickupLng={ride.pickupLng}
                    dropoffLat={ride.dropoffLat}
                    dropoffLng={ride.dropoffLng}
                    pickupAddress={ride.pickupAddress}
                    dropoffAddress={ride.dropoffAddress}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Fare</div>
                    <div className="font-semibold text-slate-800 dark:text-white">
                      {ride.fareAmount ? `₹${ride.fareAmount}` : '—'}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Requested</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {ride.requestedAt
                        ? new Date(ride.requestedAt).toLocaleTimeString()
                        : '—'}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Completed</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {ride.completedAt
                        ? new Date(ride.completedAt).toLocaleTimeString()
                        : '—'}
                    </div>
                  </div>
                </div>

                {ride.status === 'ACCEPTED' && (
                  <div className="bg-blue-50 dark:bg-blue-900 rounded-lg px-4 py-3 mb-3 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Driver accepted! They are on the way to pickup.
                  </div>
                )}

                {ride.status === 'IN_PROGRESS' && (
                  <div className="bg-purple-50 dark:bg-purple-900 rounded-lg px-4 py-3 mb-3 text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    Ride in progress...
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => refreshRide(ride.id)}
                    className="text-xs border border-slate-200 dark:border-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                    Refresh Status
                  </button>

                  {ride.status === 'COMPLETED' && ride.fareAmount && (
                    <button
                      onClick={() => handlePayment(ride)}
                      disabled={loading}
                      className="text-xs bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1">
                      {loading ? 'Processing...' : `Pay ₹${ride.fareAmount}`}
                    </button>
                  )}
                </div>

                {payment && payment.rideId === ride.id && (
                  <div className={`mt-3 text-sm px-4 py-3 rounded-lg flex items-center gap-2 ${
                    payment.status === 'SUCCESS'
                      ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
                  }`}>
                    <span>{payment.status === 'SUCCESS' ? '✓' : '✗'}</span>
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