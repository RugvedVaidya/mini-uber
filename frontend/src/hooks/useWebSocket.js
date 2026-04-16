import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useDriverLocation(driverId) {
  const [location, setLocation] = useState(null)
  const clientRef = useRef(null)

  useEffect(() => {
    if (!driverId) return

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8083/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/driver/${driverId}`, (message) => {
          try {
            const data = JSON.parse(message.body)
            setLocation(data)
          } catch {}
        })
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame)
      }
    })

    client.activate()
    clientRef.current = client

    return () => {
      if (clientRef.current) clientRef.current.deactivate()
    }
  }, [driverId])

  return location
}

export function useNearbyDrivers(lat, lng, enabled = true) {
  const [drivers, setDrivers] = useState([])
  const clientRef = useRef(null)

  useEffect(() => {
    if (!enabled || !lat || !lng) return

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8083/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/drivers/nearby', (message) => {
          try {
            const data = JSON.parse(message.body)
            setDrivers(data)
          } catch {}
        })
      }
    })

    client.activate()
    clientRef.current = client

    return () => {
      if (clientRef.current) clientRef.current.deactivate()
    }
  }, [lat, lng, enabled])

  return drivers
}