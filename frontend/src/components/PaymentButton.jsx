import { useState } from 'react'
import { paymentApi } from '../api'

export default function PaymentButton({ ride, onSuccess }) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      const res = await paymentApi.initiate({
        rideId: ride.id,
        amount: ride.fareAmount,
        method: 'RAZORPAY'
      })
      const paymentId = res.data.id

      const options = {
        key: 'rzp_test_SbEt6lfSFHuQ6c',
        amount: Math.round(ride.fareAmount * 100),
        currency: 'INR',
        name: 'MiniUber',
        description: `Ride: ${ride.pickupAddress} → ${ride.dropoffAddress}`,
        handler: async function(response) {
          const processed = await paymentApi.process(paymentId)
          onSuccess(processed.data)
        },
        prefill: {
          email: localStorage.getItem('email'),
        },
        theme: { color: '#1e293b' },
        modal: {
          ondismiss: () => setLoading(false)
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      setLoading(false)
    }
  }

  return (
    <button onClick={handlePayment} disabled={loading}
      className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
      {loading ? 'Opening...' : `Pay ₹${ride.fareAmount} via Razorpay`}
    </button>
  )
}