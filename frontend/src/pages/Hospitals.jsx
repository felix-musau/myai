import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import hospitalsData from '../data/emergency.json'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// distance helper
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lon1)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function Hospitals() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  // for new layout we compute user center and nearby hospitals
  const [center, setCenter] = useState(null)
  const [nearby, setNearby] = useState([])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const defaultZoom = 13

  // obtain location with fallback
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter([pos.coords.latitude, pos.coords.longitude])
        },
        (err) => {
          console.warn('Geolocation error:', err.message)
          if (hospitalsData.kenyanHospitals && hospitalsData.kenyanHospitals.length > 0) {
            const h = hospitalsData.kenyanHospitals[0]
            setCenter([h.lat, h.lng])
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      if (hospitalsData.kenyanHospitals && hospitalsData.kenyanHospitals.length > 0) {
        const h = hospitalsData.kenyanHospitals[0]
        setCenter([h.lat, h.lng])
      }
    }
  }, [])

  // compute nearby whenever center updates
  useEffect(() => {
    if (center) {
      const [lat, lng] = center
      const sorted = hospitalsData.kenyanHospitals
        .map((h) => ({ ...h, distance: getDistance(lat, lng, h.lat, h.lng) }))
        .sort((a, b) => a.distance - b.distance)
      setNearby(sorted)
      // if the closest hospital is extremely far (e.g. >500km), location is probably wrong
      if (sorted.length && sorted[0].distance > 500) {
        console.warn('Location seems outside expected area, using default hospital instead')
        const h = hospitalsData.kenyanHospitals[0]
        setCenter([h.lat, h.lng])
      }
    }
  }, [center])


  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex flex-col relative">
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80">
            <span className="text-2xl">📍</span>
            <h1 className="text-xl font-bold text-gray-800">MyAI Healthcare</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 hidden sm:block">Welcome, {user?.username}</span>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 font-medium">
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Breadcrumb */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-blue-600 hover:underline">Home</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">My Location</span>
        </div>
      </div>

      {/* Main content - sidebar + map */}
      <div className="flex-1 flex" style={{ height: 'calc(100vh - 112px)' }}>
        {/* sidebar 1/3 */}
        <div className="w-1/3 border-r border-gray-300 p-4 overflow-y-auto" onWheel={e=>e.stopPropagation()}>
          <h2 className="text-lg font-semibold mb-3">Nearby Hospitals</h2>
          {!center && <p>Waiting for location permission...</p>}
          {center && nearby.length === 0 && <p>No hospitals found</p>}
          {center &&
            nearby.map((h) => (
              <div key={h.id} className="mb-4 pb-2 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <strong>{h.name}</strong>
                  {h.open24Hours ? (
                    <span className="text-green-600 text-sm">Open 24h</span>
                  ) : (
                    <span className="text-red-600 text-sm">Closed</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">{h.type || ''}</div>
                <div className="text-sm">{h.address}</div>
                <div className="text-sm">{h.phone}</div>
                <div className="text-xs text-gray-500">
                  {h.distance ? `${h.distance.toFixed(2)} km` : ''}
                </div>
              </div>
            ))}
        </div>

        {/* map 2/3 */}
        <div className="w-2/3">
          {center ? (
            <MapContainer center={center} zoom={defaultZoom} className="w-full h-full"
              whenCreated={map=>{map.getContainer().addEventListener('wheel', e=>e.stopPropagation(), {passive:true})}}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={center}>
                <Popup>Your location</Popup>
              </Marker>
              {nearby.map((h) => (
                <Marker key={h.id} position={[h.lat, h.lng]}>
                  <Popup>
                    {h.name}
                    <br />
                    {h.phone}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600">Loading map…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  )
}
