import { useState, useEffect } from 'react'
import { bookingApi, paymentApi } from '../api'
import Navbar from '../components/Navbar'
import RideMap from '../components/RideMap'
import AddressSearch from '../components/AddressSearch'
import PaymentModal from '../components/PaymentModal'

const STATUS_CONFIG = {
  REQUESTED: {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
    icon: '🔍', label: 'Finding Driver'
  },
  ACCEPTED: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    icon: '✓', label: 'Driver Coming'
  },
  IN_PROGRESS: {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400',
    icon: '🚗', label: 'In Progress'
  },
  COMPLETED: {
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
    icon: '✓', label: 'Completed'
  },
  CANCELLED: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
    icon: '✕', label: 'Cancelled'
  },
}

export default function RiderDashboard() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [payment, setPayment] = useState(null)
  const [tab, setTab] = useState('book')
  const [showMap, setShowMap] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedRide, setSelectedRide] = useState(null)
  const [form, setForm] = useState({
    pickupLat: '19.0760', pickupLng: '72.8777',
    dropoffLat: '19.1136', dropoffLng: '72.8697',
    pickupAddress: 'Mumbai CST', dropoffAddress: 'Bandra Station'
  })

  useEffect(() => { fetchRides() }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (tab === 'rides') fetchRides()
    }, 5000)
    return () => clearInterval(interval)
  }, [tab])

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 4000)
  }

  const fetchRides = async () => {
    try {
      const res = await bookingApi.myRides()
      setRides(res.data)
    } catch {}
  }

  const bookRide = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await bookingApi.requestRide({
        pickupLat: parseFloat(form.pickupLat),
        pickupLng: parseFloat(form.pickupLng),
        dropoffLat: parseFloat(form.dropoffLat),
        dropoffLng: parseFloat(form.dropoffLng),
        pickupAddress: form.pickupAddress,
        dropoffAddress: form.dropoffAddress,
      })
      showMsg('Ride requested! Looking for a driver...')
      setTab('rides')
      fetchRides()
    } catch (err) {
      showMsg(err.response?.data?.error || 'Failed to book ride', 'error')
    }
    setLoading(false)
  }

  const cancelRide = async (id) => {
    try {
      await bookingApi.cancelRide(id)
      showMsg('Ride cancelled successfully.')
      fetchRides()
    } catch (err) {
      showMsg(err.response?.data?.error || 'Cannot cancel this ride', 'error')
    }
  }

  const fareEstimate = () => {
    try {
      const dist = Math.sqrt(
        Math.pow(parseFloat(form.dropoffLat) - parseFloat(form.pickupLat), 2) +
        Math.pow(parseFloat(form.dropoffLng) - parseFloat(form.pickupLng), 2)
      ) * 111
      return Math.max(50, Math.round(dist * 12))
    } catch { return 50 }
  }

  const activeRides = rides.filter(r => ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(r.status))
  const pastRides = rides.filter(r => ['COMPLETED', 'CANCELLED'].includes(r.status))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar role="RIDER" />

      <div className="max-w-2xl mx-auto px-4 py-6">

        {msg.text && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in ${
            msg.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
              : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
          }`}>
            <span>{msg.type === 'error' ? '⚠' : '✓'}</span>
            {msg.text}
          </div>
        )}

        <div className="flex gap-2 mb-6 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          {[
            { key: 'book', label: 'Book Ride', icon: '🚕' },
            { key: 'rides', label: `My Rides (${rides.length})`, icon: '📋' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                tab === t.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {tab === 'book' && (
          <div className="card p-6 animate-slide-up">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
              Where are you going?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Search for your pickup and dropoff locations
            </p>

            <form onSubmit={bookRide} className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center mt-3">
                    <div className="w-3 h-3 rounded-full bg-brand-500 border-2 border-white dark:border-slate-800 shadow"></div>
                    <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-600 my-1 border-dashed"></div>
                    <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white dark:border-slate-800 shadow"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <AddressSearch
                      label="Pickup"
                      value={form.pickupAddress}
                      onChange={v => setForm({ ...form, pickupAddress: v })}
                      onCoordinatesChange={(lat, lng) =>
                        setForm({ ...form, pickupLat: lat.toString(), pickupLng: lng.toString() })
                      }
                    />
                    <AddressSearch
                      label="Dropoff"
                      value={form.dropoffAddress}
                      onChange={v => setForm({ ...form, dropoffAddress: v })}
                      onCoordinatesChange={(lat, lng) =>
                        setForm({ ...form, dropoffLat: lat.toString(), dropoffLng: lng.toString() })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-4 flex justify-between items-center text-white">
                <div>
                  <div className="text-xs text-brand-200 mb-1">Estimated Fare</div>
                  <div className="text-3xl font-bold">₹{fareEstimate()}</div>
                  <div className="text-xs text-brand-200 mt-1">Base ₹50 + ₹12/km</div>
                </div>
                <div className="text-right">
                  <div className="text-4xl">🚕</div>
                  <div className="text-xs text-brand-200 mt-1">Standard</div>
                </div>
              </div>

              <button type="button" onClick={() => setShowMap(!showMap)}
                className="w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:border-brand-400 hover:text-brand-600 transition-all">
                {showMap ? '🗺 Hide Map' : '🗺 Preview Route on Map'}
              </button>

              {showMap && (
                <div className="animate-fade-in">
                  <RideMap
                    pickupLat={form.pickupLat} pickupLng={form.pickupLng}
                    dropoffLat={form.dropoffLat} dropoffLng={form.dropoffLng}
                    pickupAddress={form.pickupAddress} dropoffAddress={form.dropoffAddress}
                  />
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Finding your ride...
                    </span>
                  : `🚕 Request Ride — ₹${fareEstimate()}`
                }
              </button>
            </form>
          </div>
        )}

        {tab === 'rides' && (
          <div className="space-y-4 animate-fade-in">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Your Rides</h2>
              <div className="flex items-center gap-3">
                <button onClick={fetchRides}
                  className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 transition-colors">
                  ↻ Refresh
                </button>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-400">Live</span>
                </div>
              </div>
            </div>

            {activeRides.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Active
                </div>
                <div className="space-y-3">
                  {activeRides.map(ride => (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      payment={payment}
                      onCancel={cancelRide}
                      onPay={() => { setSelectedRide(ride); setShowPaymentModal(true) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {pastRides.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 mt-4">
                  Past Rides
                </div>
                <div className="space-y-3">
                  {pastRides.map(ride => (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      payment={payment}
                      onCancel={cancelRide}
                      onPay={() => { setSelectedRide(ride); setShowPaymentModal(true) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {rides.length === 0 && (
              <div className="card p-16 text-center animate-fade-in">
                <div className="text-6xl mb-4">🚕</div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  No rides yet
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  Book your first ride to get started!
                </p>
                <button onClick={() => setTab('book')} className="btn-primary mx-auto">
                  Book a Ride
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showPaymentModal && selectedRide && (
        <PaymentModal
          ride={selectedRide}
          onSuccess={(data) => {
            setPayment({ ...data, rideId: selectedRide.id })
            showMsg(`Payment ${data.status}! ₹${data.amount} via ${data.method}`)
            setShowPaymentModal(false)
            setSelectedRide(null)
            fetchRides()
          }}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedRide(null)
          }}
        />
      )}
    </div>
  )
}

function RideCard({ ride, payment, onCancel, onPay }) {
  const status = STATUS_CONFIG[ride.status] || STATUS_CONFIG.REQUESTED

  return (
    <div className="card p-5 animate-slide-up">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-brand-500"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
              {ride.pickupAddress}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
              {ride.dropoffAddress}
            </span>
          </div>
        </div>
        <span className={`badge ml-3 flex-shrink-0 ${status.color}`}>
          {status.icon} {status.label}
        </span>
      </div>

      {(ride.status === 'ACCEPTED' || ride.status === 'IN_PROGRESS') && (
        <div className={`rounded-xl px-4 py-3 mb-4 flex items-center gap-3 ${
          ride.status === 'ACCEPTED'
            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            : 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            ride.status === 'ACCEPTED' ? 'bg-blue-500' : 'bg-purple-500'
          }`}></div>
          <p className={`text-sm font-medium ${
            ride.status === 'ACCEPTED'
              ? 'text-blue-700 dark:text-blue-400'
              : 'text-purple-700 dark:text-purple-400'
          }`}>
            {ride.status === 'ACCEPTED'
              ? 'Driver accepted! On the way to pickup 🚗'
              : 'Ride in progress... Enjoy your journey! 🎉'
            }
          </p>
        </div>
      )}

      <RideMap
        pickupLat={ride.pickupLat} pickupLng={ride.pickupLng}
        dropoffLat={ride.dropoffLat} dropoffLng={ride.dropoffLng}
        pickupAddress={ride.pickupAddress} dropoffAddress={ride.dropoffAddress}
      />

      <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Fare</div>
          <div className="font-bold text-slate-800 dark:text-white text-sm">
            {ride.fareAmount ? `₹${ride.fareAmount}` : '—'}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Requested</div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {ride.requestedAt ? new Date(ride.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Completed</div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {ride.completedAt ? new Date(ride.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {ride.status === 'REQUESTED' && (
          <button onClick={() => onCancel(ride.id)} className="btn-danger text-xs py-2">
            ✕ Cancel Ride
          </button>
        )}
        {ride.status === 'COMPLETED' && ride.fareAmount && (
          <button onClick={() => onPay(ride)}
            className="btn-primary text-xs py-2 flex items-center gap-1.5">
            💳 Pay ₹{ride.fareAmount}
          </button>
        )}
      </div>

      {payment && payment.rideId === ride.id && (
        <div className={`mt-3 text-sm px-4 py-3 rounded-xl flex items-center gap-2 ${
          payment.status === 'SUCCESS'
            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          <span className="text-lg">{payment.status === 'SUCCESS' ? '✓' : '✗'}</span>
          <div>
            <div className="font-medium">Payment {payment.status}</div>
            <div className="text-xs opacity-75">₹{payment.amount} via {payment.method}</div>
          </div>
        </div>
      )}
    </div>
  )
}