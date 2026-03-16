import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import emergencyData from '../data/emergency.json'

export default function Emergency() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex flex-col relative">
      
      {/* Emergency Banner - Brightest thin red */}
      <div className="bg-red-300/98 backdrop-blur-sm text-white py-4 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h1 className="text-2xl font-bold font-medical">Medical Emergency?</h1>
              <p className="text-red-50">If you or someone else is in immediate danger, call for help now</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a
              href={`tel:${emergencyData.emergencyNumber}`}
              className="glass-button-primary px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2"
            >
              <span className="text-2xl">📞</span>
              Call {emergencyData.emergencyNumber}
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6 relative z-10">
        {/* Emergency Instructions */}
        <Card padding="md" shadow="md" className="glass-card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📋</span>
            <h2 className="text-xl font-bold text-gray-800 font-medical">What to Do in an Emergency</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {emergencyData.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-red-50/95 backdrop-blur rounded-lg">
                <span className="text-red-400 font-bold">{index + 1}.</span>
                <span className="text-gray-700">{instruction}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Emergency Symptoms */}
        <Card padding="md" shadow="md" className="glass-card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🚨</span>
            <h2 className="text-xl font-bold text-gray-800 font-medical">Emergency Warning Signs</h2>
          </div>
          <p className="text-gray-600 mb-4 font-medical">Seek immediate medical attention if you experience any of these symptoms:</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyData.symptoms.map((symptom) => (
              <div
                key={symptom.id}
                className="bg-red-50/95 backdrop-blur border border-red-300/70 rounded-xl p-4 hover:shadow-md transition"
              >
                <span className="text-3xl block mb-2">{symptom.icon}</span>
                <h3 className="font-bold text-red-500 font-medical">{symptom.title}</h3>
                <p className="text-sm text-red-400 mt-1">{symptom.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Kenyan Emergency Numbers */}
        <Card padding="md" shadow="md" className="glass-card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🇰🇪</span>
            <h2 className="text-xl font-bold text-gray-800 font-medical">Kenya Emergency Numbers</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <a
              href={`tel:${emergencyData.kenyanEmergency.police}`}
              className="bg-blue-600/80 backdrop-blur text-white rounded-xl p-4 hover:shadow-md transition text-center"
            >
              <span className="text-2xl block mb-1">👮</span>
              <span className="font-bold">Police</span>
              <span className="block text-lg">{emergencyData.kenyanEmergency.police}</span>
            </a>
            <a
              href={`tel:${emergencyData.kenyanEmergency.ambulance}`}
              className="bg-red-300/95 backdrop-blur text-white rounded-xl p-4 hover:shadow-md transition text-center"
            >
              <span className="text-2xl block mb-1">🚑</span>
              <span className="font-bold">Ambulance</span>
              <span className="block text-lg">{emergencyData.kenyanEmergency.ambulance}</span>
            </a>
            <a
              href={`tel:${emergencyData.kenyanEmergency.fire}`}
              className="bg-orange-600/80 backdrop-blur text-white rounded-xl p-4 hover:shadow-md transition text-center"
            >
              <span className="text-2xl block mb-1">🔥</span>
              <span className="font-bold">Fire</span>
              <span className="block text-lg">{emergencyData.kenyanEmergency.fire}</span>
            </a>
            <a
              href={`tel:${emergencyData.kenyanEmergency.redCross}`}
              className="bg-red-400/98 backdrop-blur text bg-red-500 rounded-xl p-4 hover:shadow-md transition text-center"
            >
              <span className="text-2xl block mb-1">🟥</span>
              <span className="font-bold">Red Cross</span>
              <span className="block text-lg">{emergencyData.kenyanEmergency.redCross}</span>
            </a>
            <a
              href={`tel:${emergencyData.kenyanEmergency.generalEmergency}`}
              className="bg-green-600/80 backdrop-blur text-white rounded-xl p-4 hover:shadow-md transition text-center"
            >
              <span className="text-2xl block mb-1">⚡</span>
              <span className="font-bold">General</span>
              <span className="block text-lg">{emergencyData.kenyanEmergency.generalEmergency}</span>
            </a>
          </div>
        </Card>

        {/* Kenyan Hospitals */}
        <Card padding="md" shadow="md" className="glass-card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏥</span>
            <h2 className="text-xl font-bold text-gray-800 font-medical">Major Kenya Hospitals</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyData.kenyanHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white/60 backdrop-blur border border-gray-200/50 rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 font-medical">{hospital.name}</h3>
                  {hospital.open24Hours && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                      24/7
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-1">📍 {hospital.address}</p>
                <p className="text-gray-600 text-sm mb-1">📞 {hospital.phone}</p>
                <p className="text-gray-500 text-xs mb-3">🏷️ {hospital.type}</p>
                <Button
                  variant="glassPrimary"
                  size="sm"
                  onClick={() => window.location.href = `tel:${hospital.phone}`}
                >
                  Call Now
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Chat with AI Assistant */}
          <Card padding="md" shadow="md" className="glass-card">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600/80 backdrop-blur rounded-full flex items-center justify-center">
                <span className="text-3xl">🤖</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg font-medical">Not sure if it's an emergency?</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Chat with our AI assistant to help assess your symptoms
                </p>
                <Button
                  variant="glassPrimary"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/home')}
                  icon="💬"
                >
                  Start Chat
                </Button>
              </div>
            </div>
          </Card>

          {/* Request Non-Emergency Doctor */}
          <Card padding="md" shadow="md" className="glass-card">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-600/80 backdrop-blur rounded-full flex items-center justify-center">
                <span className="text-3xl">👨‍⚕️</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg font-medical">Need a Doctor Soon?</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Schedule a non-emergency consultation with our specialists
                </p>
                <Button
                  variant="glassSuccess"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/request-doctor')}
                  icon="📅"
                >
                  Request Appointment
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50/80 backdrop-blur border border-yellow-200/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h4 className="font-bold text-yellow-800 font-medical">Important Disclaimer</h4>
              <p className="text-yellow-700 text-sm mt-1">
                This information is for general guidance only. If you believe you're experiencing a medical emergency, 
                call {emergencyData.emergencyNumber} or go to your nearest emergency room immediately. 
                Do not delay seeking emergency care based on this information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
