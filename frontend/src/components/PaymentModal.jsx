import { useState } from 'react'
import { paymentApi } from '../api'

const METHODS = [
  {
    id: 'UPI',
    icon: '📱',
    label: 'UPI',
    desc: 'Google Pay, PhonePe, Paytm',
    color: 'border-violet-300 bg-violet-50 dark:bg-violet-900/20',
    selected: 'border-violet-500 bg-violet-50 dark:bg-violet-900/30',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
  },
  {
    id: 'CARD',
    icon: '💳',
    label: 'Card',
    desc: 'Credit or Debit Card',
    color: 'border-blue-300 bg-blue-50 dark:bg-blue-900/20',
    selected: 'border-blue-500 bg-blue-50 dark:bg-blue-900/30',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  {
    id: 'CASH',
    icon: '💵',
    label: 'Cash',
    desc: 'Pay driver directly',
    color: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20',
    selected: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  },
]

export default function PaymentModal({ ride, onSuccess, onClose }) {
  const [method, setMethod] = useState('UPI')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('select')

  const handlePay = async () => {
    setLoading(true)
    setError('')
    setStep('processing')
    try {
      const res = await paymentApi.initiate({
        rideId: ride.id,
        amount: ride.fareAmount,
        method,
      })

      if (method !== 'CASH' && window.Razorpay) {
        const options = {
          key: 'rzp_test_YOUR_KEY_HERE',
          amount: Math.round(ride.fareAmount * 100),
          currency: 'INR',
          name: 'MiniUber',
          description: `${ride.pickupAddress} → ${ride.dropoffAddress}`,
          handler: async function () {
            const processed = await paymentApi.process(res.data.id)
            setStep('success')
            setTimeout(() => onSuccess(processed.data), 1500)
          },
          prefill: { email: localStorage.getItem('email') },
          theme: { color: '#4f46e5' },
          modal: { ondismiss: () => { setLoading(false); setStep('select') } }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        const processed = await paymentApi.process(res.data.id)
        setStep('success')
        setTimeout(() => onSuccess(processed.data), 1500)
      }
    } catch {
      setError('Payment failed. Please try again.')
      setStep('select')
    }
    setLoading(false)
  }

  const selectedMethod = METHODS.find(m => m.id === method)

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.6)', zIndex: 9999, backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up"
        style={{ zIndex: 10000 }}>

        <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>

        {step === 'success' ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Payment Successful!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              ₹{ride.fareAmount} paid via {method}
            </p>
          </div>
        ) : step === 'processing' ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Processing Payment
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Please wait...
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    Complete Payment
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ride.pickupAddress?.split(',')[0]} → {ride.dropoffAddress?.split(',')[0]}
                  </p>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                  ✕
                </button>
              </div>

              <div className="mt-4 bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-4 text-white">
                <div className="text-xs text-brand-200 mb-1">Total Amount</div>
                <div className="text-3xl font-bold">₹{ride.fareAmount}</div>
              </div>
            </div>

            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Choose Payment Method
              </p>

              <div className="space-y-2">
                {METHODS.map(m => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      method === m.id ? m.selected + ' border-opacity-100' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${m.badge}`}>
                      {m.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {m.label}
                      </div>
                      <div className="text-xs text-slate-400">{m.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      method === m.id
                        ? 'border-brand-500 bg-brand-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {method === m.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl border border-red-200 dark:border-red-800">
                  ⚠ {error}
                </div>
              )}

              <button onClick={handlePay} disabled={loading}
                className="mt-4 w-full btn-primary py-4 text-base flex items-center justify-center gap-2">
                {loading
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...</>
                  : <>{selectedMethod?.icon} Pay ₹{ride.fareAmount} via {method}</>
                }
              </button>

              <p className="text-center text-xs text-slate-400 mt-3 pb-2">
                🔒 Secured by MiniUber Pay
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}