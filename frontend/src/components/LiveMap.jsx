import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useState, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { locationApi } from '../api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const createPinIcon = (color, emoji) => L.divIcon({
  className: '',
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3))">
      <div style="
        background:${color};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        width:40px;height:40px;
        display:flex;align-items:center;justify-content:center;
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
      ">
        <span style="transform:rotate(45deg);font-size:18px">${emoji}</span>
      </div>
      <div style="width:8px;height:8px;background:${color};border-radius:50%;margin-top:2px;opacity:0.4"></div>
    </div>`,
  iconSize: [40, 52],
  iconAnchor: [20, 52],
  popupAnchor: [0, -52],
})

const createCarIcon = () => L.divIcon({
  className: '',
  html: `
    <div style="
      width:44px;height:44px;
      background:white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      border:3px solid #4f46e5;
      box-shadow:0 4px 12px rgba(79,70,229,0.5);
      font-size:22px;
    ">🚗</div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
})

const createNearbyCarIcon = () => L.divIcon({
  className: '',
  html: `
    <div style="
      width:36px;height:36px;
      background:white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      border:2px solid #10b981;
      box-shadow:0 2px 8px rgba(16,185,129,0.4);
      font-size:18px;
    ">🚗</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
})

const pickupIcon = createPinIcon('#4f46e5', '📍')
const dropoffIcon = createPinIcon('#ef4444', '🏁')

function AutoFit({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (!positions || positions.length === 0) return
    if (positions.length === 1) {
      map.setView(positions[0], 14)
      return
    }
    try {
      const bounds = L.latLngBounds(positions.filter(p => p))
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      }
    } catch {}
  }, [JSON.stringify(positions)])
  return null
}

export default function LiveMap({
  pickupLat, pickupLng,
  dropoffLat, dropoffLng,
  pickupAddress, dropoffAddress,
  driverId,
  showNearby = false,
  height = '280px',
  rideStatus,
}) {
  const [driverLoc, setDriverLoc] = useState(null)
  const [nearbyDrivers, setNearbyDrivers] = useState([])
  const [connected, setConnected] = useState(false)
  const clientRef = useRef(null)

  const pickup = pickupLat && pickupLng && !isNaN(parseFloat(pickupLat))
    ? [parseFloat(pickupLat), parseFloat(pickupLng)]
    : null

  const dropoff = dropoffLat && dropoffLng && !isNaN(parseFloat(dropoffLat))
    ? [parseFloat(dropoffLat), parseFloat(dropoffLng)]
    : null

  useEffect(() => {
    if (!driverId) return

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8083/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
        client.subscribe(`/topic/driver/${driverId}`, (message) => {
          try {
            const data = JSON.parse(message.body)
            if (data.latitude && data.longitude) {
              setDriverLoc([parseFloat(data.latitude), parseFloat(data.longitude)])
            }
          } catch {}
        })
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    })

    client.activate()
    clientRef.current = client

    return () => {
      if (clientRef.current) clientRef.current.deactivate()
    }
  }, [driverId])

  useEffect(() => {
    if (!showNearby || !pickup) return

    const fetchNearby = async () => {
      try {
        const res = await locationApi.getNearby(pickup[0], pickup[1], 5)
        setNearbyDrivers(res.data || [])
      } catch {
        setNearbyDrivers([])
      }
    }

    fetchNearby()
    const interval = setInterval(fetchNearby, 10000)
    return () => clearInterval(interval)
  }, [showNearby, pickupLat, pickupLng])

  if (!pickup) return null

  const center = pickup
  const fitPositions = [pickup, dropoff, driverLoc].filter(Boolean)

  const distance = pickup && dropoff
    ? (Math.sqrt(
        Math.pow(dropoff[0] - pickup[0], 2) +
        Math.pow(dropoff[1] - pickup[1], 2)
      ) * 111).toFixed(1)
    : null

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
      style={{ height, position: 'relative', zIndex: 0 }}>

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}>

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoFit positions={fitPositions} />

        {pickup && (
          <Marker position={pickup} icon={pickupIcon}>
            <Popup>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>
                📍 {pickupAddress || 'Pickup'}
              </div>
            </Popup>
          </Marker>
        )}

        {dropoff && (
          <Marker position={dropoff} icon={dropoffIcon}>
            <Popup>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>
                🏁 {dropoffAddress || 'Dropoff'}
              </div>
            </Popup>
          </Marker>
        )}

        {pickup && dropoff && (
          <Polyline
            positions={[pickup, dropoff]}
            pathOptions={{
              color: '#4f46e5',
              weight: 3,
              opacity: 0.5,
              dashArray: '8 6',
              lineCap: 'round',
            }}
          />
        )}

        {driverLoc && (
          <Marker position={driverLoc} icon={createCarIcon()}>
            <Popup>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>
                🚗 Your Driver
              </div>
            </Popup>
          </Marker>
        )}

        {driverLoc && pickup && rideStatus === 'ACCEPTED' && (
          <Polyline
            positions={[driverLoc, pickup]}
            pathOptions={{
              color: '#10b981',
              weight: 3,
              opacity: 0.8,
              dashArray: '6 4',
              lineCap: 'round',
            }}
          />
        )}

        {driverLoc && dropoff && rideStatus === 'IN_PROGRESS' && (
          <Polyline
            positions={[driverLoc, dropoff]}
            pathOptions={{
              color: '#8b5cf6',
              weight: 3,
              opacity: 0.8,
              lineCap: 'round',
            }}
          />
        )}

        {showNearby && nearbyDrivers.map((driver, i) => (
          driver.latitude && driver.longitude ? (
            <Marker
              key={driver.driverId || i}
              position={[parseFloat(driver.latitude), parseFloat(driver.longitude)]}
              icon={createNearbyCarIcon()}>
              <Popup>
                <div style={{ fontSize: '12px' }}>
                  <div style={{ fontWeight: 600 }}>🚗 Available Driver</div>
                  {driver.distanceKm && (
                    <div style={{ color: '#6b7280' }}>
                      {parseFloat(driver.distanceKm).toFixed(1)} km away
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>

      <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none">
        <div className="flex gap-2 flex-wrap">
          {pickup && (
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0"></div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-24">
                {pickupAddress?.split(',')[0] || 'Pickup'}
              </span>
            </div>
          )}
          {dropoff && (
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-24">
                {dropoffAddress?.split(',')[0] || 'Dropoff'}
              </span>
            </div>
          )}
          {distance && (
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                {distance} km
              </span>
            </div>
          )}
          {driverId && (
            <div className={`backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg ${
              connected
                ? 'bg-emerald-600/95'
                : 'bg-slate-500/95'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full bg-white ${connected ? 'animate-pulse' : ''}`}></div>
              <span className="text-xs font-medium text-white">
                {connected ? 'Driver Live' : 'Connecting...'}
              </span>
            </div>
          )}
          {showNearby && nearbyDrivers.length > 0 && (
            <div className="ml-auto bg-emerald-600/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
              <span className="text-xs font-bold text-white">
                {nearbyDrivers.length} driver{nearbyDrivers.length > 1 ? 's' : ''} nearby
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}