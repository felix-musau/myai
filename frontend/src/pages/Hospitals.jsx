import React, { useState } from 'react'
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

// Sample hospital data
const hospitals = [
  { id: 1, name: "City General Hospital", lat: 40.7128, lng: -74.0060, address: "123 Main St, New York", phone: "(212) 555-0100" },
  { id: 2, name: "St. Mary's Medical Center", lat: 40.7282, lng: -73.9942, address: "456 Park Ave, New York", phone: "(212) 555-0200" },
  { id: 3, name: "University Hospital", lat: 40.7484, lng: -73.9857, address: "789 Medical Blvd, New York", phone: "(212) 555-0300" },
  { id: 4, name: "Children's Hospital", lat: 40.7614, lng: -73.9776, address: "321 Kids Way, New York", phone: "(212) 555-0400" },
  { id: 5, name: "Emergency Care Center", lat: 40.7061, lng: -74.0088, address: "654 Urgent Care Dr, New York", phone: "(212) 555-0500" },
]

export default function Hospitals() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [selectedHospital, setSelectedHospital] = useState(null)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const defaultCenter = [40.7128, -74.0060]
  const defaultZoom = 12

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex flex-col relative">
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80">
            <span className="text-2xl">🏥</span>
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
          <span className="text-gray-600">Find Hospitals</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Map - Major Part */}
        <div className="flex-1 relative">
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {hospitals.map(hospital => (
              <Marker
                key={hospital.id}
                position={[hospital.lat, hospital.lng]}
                eventHandlers={{
                  click: () => setSelectedHospital(hospital),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong className="text-lg">{hospital.name}</strong>
                    <p className="text-gray-600">{hospital.address}</p>
                    <p className="text-blue-600">{hospital.phone}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Map Legend */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
            <h4 className="font-semibold text-sm mb-2">🗺️ Map Legend</h4>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>Hospital</span>
            </div>
          </div>
        </div>

        {/* Hospital List - Sidebar */}
        <div className="w-full lg:w-96 bg-white shadow-xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 px-4 py-3 text-white">
            <h3 className="font-bold text-lg">🏨 Nearby Hospitals</h3>
            <p className="text-xs text-green-100">{hospitals.length} facilities found</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {hospitals.map(hospital => (
              <div
                key={hospital.id}
                onClick={() => setSelectedHospital(hospital)}
                className={`p-4 border-b cursor-pointer transition-colors hover:bg-blue-50 ${
                  selectedHospital?.id === hospital.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <h4 className="font-semibold text-gray-800">{hospital.name}</h4>
                <p className="text-sm text-gray-600 mt-1">📍 {hospital.address}</p>
                <p className="text-sm text-blue-600 mt-1">📞 {hospital.phone}</p>
                <div className="mt-2 flex gap-2">
                  <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Get Directions
                  </button>
                  <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Call Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Back to Home */}
          <div className="p-4 border-t bg-gray-50">
            <Link to="/" className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-center hover:bg-gray-300 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
