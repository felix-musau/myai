import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// pull in the default hospital list - will be replaced when location detected
import hospitalsData from '../data/emergency.json'

// simple haversine distance calculation in kilometres
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371 // earth radius km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function MapView(){
  const [center, setCenter] = useState(null) // null until we get permission
  const [nearby, setNearby] = useState([])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude]
          setCenter(coords)
        },
        (err) => {
          console.warn('Geolocation error:', err.message)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }, [])

  // whenever center changes compute distances
  useEffect(() => {
    if (center) {
      const [lat, lng] = center
      const sorted = hospitalsData.kenyanHospitals
        .map((h) => ({
          ...h,
          distance: getDistance(lat, lng, h.lat, h.lng),
        }))
        .sort((a, b) => a.distance - b.distance)
      setNearby(sorted)
    }
  }, [center])

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* sidebar */}
      <div
        style={{
          width: '250px',
          borderRight: '1px solid #ccc',
          padding: '8px',
          overflowY: 'auto',
        }}
      >
        <h3>Nearby Hospitals</h3>
        {!center && <p>Waiting for location permission...</p>}
        {center && nearby.length === 0 && <p>No hospitals found</p>}
        {center &&
          nearby.map((h) => (
            <div key={h.id} style={{ marginBottom: '8px' }}>
              <strong>{h.name}</strong>
              <br />
              {h.address}
              <br />
              {h.phone}
              <br />
              Distance: {h.distance.toFixed(2)} km
            </div>
          ))}
      </div>

      <MapContainer
        center={center || [0, 0]}
        zoom={center ? 13 : 2}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {center && (
          <Marker position={center}>
            <Popup>Your location (if allowed)</Popup>
          </Marker>
        )}
        {center &&
          nearby.map((h) => (
            <Marker key={h.id} position={[h.lat, h.lng]}>
              <Popup>
                {h.name}
                <br />
                {h.phone}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  )
}
