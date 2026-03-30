import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiAlertTriangle, FiPhone, FiMessageCircle, FiCalendar, FiInfo } from 'react-icons/fi'
import { FaAmbulance, FaHospital, FaShieldAlt, FaFireExtinguisher, FaHeartbeat, FaUser } from 'react-icons/fa'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import emergencyData from '../data/emergency.json'

export default function Emergency() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex flex-col relative">
      
      {/* Emergency Banner - Vibrant Stop Sign Red */}
      <div className="bg-red-600 text-white py-6 px-6 relative z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="text-5xl animate-pulse" />
            <div>
              <h1 className="text-3xl font-bold font-medical">Medical Emergency?</h1>
              <p className="text-red-100">If you or someone else is in immediate danger, call for help now</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a
              href={`tel:${emergencyData.emergencyNumber}`}
              className="bg-white text-red-600 font-bold px-8 py-4 rounded-xl text-lg flex items-center gap-2 hover:bg-red-50 transition-all transform hover:scale-105 shadow-lg"
            >
              <FiPhone className="text-2xl" />
              Call {emergencyData.emergencyNumber}
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6 relative z-10">
        {/* Emergency Instructions */}
        <Card padding="md" shadow="md" className="glass-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <FiInfo className="text-white text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 font-medical">What to Do in an Emergency</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {emergencyData.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-600">
                <span className="bg-red-600 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">{index + 1}</span>
                <span className="text-gray-700">{instruction}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Emergency Symptoms */}
        <Card padding="md" shadow="md" className="glass-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <FaHeartbeat className="text-white text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 font-medical">Emergency Warning Signs</h2>
          </div>
          <p className="text-gray-600 mb-4 font-medical">Seek immediate medical attention if you experience any of these symptoms:</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyData.symptoms.map((symptom) => (
              <div
                key={symptom.id}
                className="bg-white border-2 border-red-200 rounded-xl p-4 hover:shadow-lg hover:border-red-600 transition-all transform hover:scale-105"
              >
                <div className="text-4xl mb-3">{symptom.icon}</div>
                <h3 className="font-bold text-red-600 font-medical">{symptom.title}</h3>
                <p className="text-sm text-gray-700 mt-1">{symptom.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Kenyan Emergency Numbers */}
        <Card padding="md" shadow="md" className="glass-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FiPhone className="text-white text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 font-medical">Kenya Emergency Numbers</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <a
              href={`tel:${emergencyData.kenyanEmergency.police}`}
              className="bg-blue-600 text-white rounded-xl p-4 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <FaShieldAlt className="text-3xl mb-2" />
              <span className="font-bold block">Police</span>
              <span className="block text-sm mt-1">{emergencyData.kenyanEmergency.police}</span>
            </a>
            <a
              href={`tel:${emergencyData.kenyanEmergency.ambulance}`}
              className="bg-red-600 text-white rounded-xl p-4 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <FaAmbulance className="text-3xl mb-2" />
              <span className="font-bold block">Ambulance</span>
              <span className="block text-sm mt-1">{emergencyData.kenyanEmergency.ambulance}</span>
            </a>
            <a
              href={`tel:${emergencyData.kenyanEmergency.fire}`}
              className="bg-orange-600 text-white rounded-xl p-4 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <FaFireExtinguisher className="text-3xl mb-2" />
              <span className="font-bold block">Fire</span>
              <span className="block text-sm mt-1">{emergencyData.kenyanEmergency.fire}</span>
            </a>
            <a
              href={`tel:${emergencyData.kenyanEmergency.redCross}`}
              className="bg-red-700 text-white rounded-xl p-4 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <FaHeartbeat className="text-3xl mb-2" />
              <span className="font-bold block">Red Cross</span>
              <span className="block text-sm mt-1">{emergencyData.kenyanEmergency.redCross}</span>
            </a>
            <a
              href={`tel:${emergencyData.kenyanEmergency.generalEmergency}`}
              className="bg-green-600 text-white rounded-xl p-4 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <FaHospital className="text-3xl mb-2" />
              <span className="font-bold block">General</span>
              <span className="block text-sm mt-1">{emergencyData.kenyanEmergency.generalEmergency}</span>
            </a>
          </div>
        </Card>

        {/* Kenyan Hospitals */}
        <Card padding="md" shadow="md" className="glass-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <FaHospital className="text-white text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 font-medical">Major Kenya Hospitals</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyData.kenyanHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white border border-gray-300 rounded-xl p-4 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800 font-medical flex-1">{hospital.name}</h3>
                  {hospital.open24Hours && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                      24/7
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-start gap-2 text-gray-600">
                    <span className="text-blue-600 text-lg">📍</span>
                    <span>{hospital.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiPhone className="text-blue-600" />
                    <span>{hospital.phone}</span>
                  </div>
                  <div className="text-gray-500 text-xs">Type: {hospital.type}</div>
                </div>
                <Button
                  variant="glassPrimary"
                  size="sm"
                  onClick={() => window.location.href = `tel:${hospital.phone}`}
                  className="w-full"
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
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <FiMessageCircle className="text-3xl text-white" />
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
                >
                  Start Chat
                </Button>
              </div>
            </div>
          </Card>

          {/* Request Non-Emergency Doctor */}
          <Card padding="md" shadow="md" className="glass-card">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <FiCalendar className="text-3xl text-white" />
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
                >
                  Request Appointment
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border-2 border-yellow-600 rounded-xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <FiAlertTriangle className="text-yellow-600 text-2xl" />
            </div>
            <div>
              <h4 className="font-bold text-yellow-800 font-medical">Important Disclaimer</h4>
              <p className="text-yellow-800 text-sm mt-1">
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
