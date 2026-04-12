import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const createIcon = (color, label) => L.divIcon({
  className: '',
  html: `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
    ">
      <div style="
        background: ${color};
        color: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">${label}</span>
      </div>
      <div style="
        width: 8px;
        height: 8px;
        background: ${color};
        border-radius: 50%;
        margin-top: 2px;
        opacity: 0.5;
      "></div>
    </div>
  `,
  iconSize: [36, 48],
  iconAnchor: [18, 48],
  popupAnchor: [0, -48],
})

const pickupIcon = createIcon('#4f46e5', '🟢')
const dropoffIcon = createIcon('#ef4444', '🔴')

function FitBounds({ pickup, dropoff }) {
  const map = useMap()
  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds([pickup, dropoff])
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [pickup, dropoff, map])
  return null
}

export default function RideMap({
  pickupLat, pickupLng, dropoffLat, dropoffLng,
  pickupAddress, dropoffAddress,
  height = '220px'
}) {
  const pickup = [parseFloat(pickupLat), parseFloat(pickupLng)]
  const dropoff = [parseFloat(dropoffLat), parseFloat(dropoffLng)]
  const center = [
    (pickup[0] + dropoff[0]) / 2,
    (pickup[1] + dropoff[1]) / 2,
  ]

  const isValidCoord = (c) => c.every(v => !isNaN(v) && isFinite(v))
  if (!isValidCoord(pickup) || !isValidCoord(dropoff)) return null

  const distance = (Math.sqrt(
    Math.pow(dropoff[0] - pickup[0], 2) +
    Math.pow(dropoff[1] - pickup[1], 2)
  ) * 111).toFixed(1)

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
      style={{ height, position: 'relative', zIndex: 0 }}>

      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}>

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds pickup={pickup} dropoff={dropoff} />

        <Marker position={pickup} icon={pickupIcon}>
          <Popup className="custom-popup">
            <div className="text-xs font-medium p-1">
              📍 {pickupAddress || 'Pickup'}
            </div>
          </Popup>
        </Marker>

        <Marker position={dropoff} icon={dropoffIcon}>
          <Popup className="custom-popup">
            <div className="text-xs font-medium p-1">
              🏁 {dropoffAddress || 'Dropoff'}
            </div>
          </Popup>
        </Marker>

        <Polyline
          positions={[pickup, dropoff]}
          pathOptions={{
            color: '#4f46e5',
            weight: 4,
            opacity: 0.8,
            dashArray: '10 8',
            lineCap: 'round',
          }}
        />
      </MapContainer>

      <div className="absolute bottom-2 left-2 right-2 z-10 flex gap-2 pointer-events-none">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-brand-500"></div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-24">
            {pickupAddress?.split(',')[0] || 'Pickup'}
          </span>
        </div>
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-24">
            {dropoffAddress?.split(',')[0] || 'Dropoff'}
          </span>
        </div>
        <div className="ml-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
            {distance} km
          </span>
        </div>
      </div>
    </div>
  )
}