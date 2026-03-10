import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// this view only shows the user's current location on the map; available hospitals list is managed separately

export default function Hospitals() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  // location state only
  const [locationRequested, setLocationRequested] = useState(false);

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // start with null until we have geolocation; map will not render until we set a real center
  const [mapCenter, setMapCenter] = useState(null)
  const defaultZoom = 13

  useEffect(() => {
    if (locationRequested && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const userLoc = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(userLoc);
        },
        err => console.warn('Location permission denied or error', err.message),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }, [locationRequested])

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

      {/* Map or consent flow */}
      <div className="flex-1">
        {!locationRequested ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-xl text-gray-700">This page needs your location to show nearby hospitals.</p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => setLocationRequested(true)}
            >Allow location access</button>
          </div>
        ) : mapCenter ? (
          <MapContainer
            center={mapCenter}
            zoom={defaultZoom}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={mapCenter}>
              <Popup>Your current location</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">Determining your location…</p>
          </div>
        )}
      </div>
    </div>
  </div>
  )
}
