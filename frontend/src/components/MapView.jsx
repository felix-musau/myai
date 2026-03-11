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
  // we will center on user location if available; otherwise fall back to first hospital
  const [center, setCenter] = useState(null)
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
          // fallback: use the first hospital from our dataset
          if (hospitalsData.kenyanHospitals && hospitalsData.kenyanHospitals.length > 0) {
            const h = hospitalsData.kenyanHospitals[0]
            setCenter([h.lat, h.lng])
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      // no geolocation support
      if (hospitalsData.kenyanHospitals && hospitalsData.kenyanHospitals.length > 0) {
        const h = hospitalsData.kenyanHospitals[0]
        setCenter([h.lat, h.lng])
      }
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
      if (sorted.length && sorted[0].distance > 500) {
        // incorrect location, fallback to first hospital
        const h = hospitalsData.kenyanHospitals[0]
        setCenter([h.lat, h.lng])
      }
    }
  }, [center])

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* sidebar (1/3 width) */}
      <div
        style={{
          width: '33.33%',
          minWidth: '200px',
          borderRight: '1px solid #ccc',
          padding: '8px',
          overflowY: 'auto',
        }}
        onWheel={e => e.stopPropagation()} // keep scroll inside sidebar
      >
        <h3>Nearby Hospitals</h3>
        {!center && <p>Waiting for location permission...</p>}
        {center && nearby.length === 0 && <p>No hospitals found</p>}
        {center &&
          nearby.map((h) => (
            <div key={h.id} style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
              <strong>{h.name}</strong> {h.open24Hours ? <span style={{color:'green'}}>(Open 24h)</span> : <span style={{color:'red'}}>(Closed)</span>}
              <br />
              {h.address}
              <br />
              {h.phone}
              <br />
              {h.type && <em>{h.type}</em>}
              <br />
              Distance: {h.distance.toFixed(2)} km
            </div>
          ))}
      </div>

      <MapContainer
        center={center || [0, 0]}
        zoom={center ? 13 : 2}
        style={{ height: '100%', width: '66.66%' }}
        // prevent wheel from bubbling up to parent containers
        whenCreated={map => {
          map.getContainer().addEventListener('wheel', e => e.stopPropagation(), { passive: true })
        }}
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
