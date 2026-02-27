import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapView(){
  const center = [20.5937, 78.9629] // India center as example
  return (
    <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Example marker */}
      <Marker position={center}>
        <Popup>Map Center</Popup>
      </Marker>
    </MapContainer>
  )
}
