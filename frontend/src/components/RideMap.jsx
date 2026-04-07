import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

export default function RideMap({ pickupLat, pickupLng, dropoffLat, dropoffLng, pickupAddress, dropoffAddress }) {
  const center = [
    (parseFloat(pickupLat) + parseFloat(dropoffLat)) / 2,
    (parseFloat(pickupLng) + parseFloat(dropoffLng)) / 2,
  ]

  const polyline = [
    [parseFloat(pickupLat), parseFloat(pickupLng)],
    [parseFloat(dropoffLat), parseFloat(dropoffLng)],
  ]

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700" style={{ height: '280px' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[parseFloat(pickupLat), parseFloat(pickupLng)]} icon={pickupIcon}>
          <Popup>{pickupAddress || 'Pickup'}</Popup>
        </Marker>
        <Marker position={[parseFloat(dropoffLat), parseFloat(dropoffLng)]} icon={dropoffIcon}>
          <Popup>{dropoffAddress || 'Dropoff'}</Popup>
        </Marker>
        <Polyline positions={polyline} color="#6366f1" weight={3} dashArray="8" />
      </MapContainer>
    </div>
  )
}