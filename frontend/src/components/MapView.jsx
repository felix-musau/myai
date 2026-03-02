import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapView(){
  // world view center
  const center = [0, 0]
  return (
    <MapContainer center={center} zoom={2} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Example marker at origin */}
      <Marker position={center}>
        <Popup>Map Center</Popup>
      </Marker>
    </MapContainer>
  )
}
