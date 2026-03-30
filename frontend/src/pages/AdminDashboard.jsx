import React, { useEffect, useState } from 'react'
import { FiUsers, FiMessageCircle, FiClock } from 'react-icons/fi'
import { FaChartBar } from 'react-icons/fa'
import api from '../services/api'

function formatDate(dateString) {
  const d = new Date(dateString)
  return d.toLocaleString()
}

function SmallBarChart({ data, label }) {
  // data: [{ day: '2026-03-01', count: 5 }, ...]
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-400">No data available.</p>
  }

  const max = Math.max(...data.map((p) => p.count))

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="flex items-end gap-2">
        {data.map((item) => {
          const height = max === 0 ? 4 : Math.max(4, (item.count / max) * 80)
          return (
            <div key={item.day} className="flex flex-col items-center">
              <div
                className="w-7 bg-blue-500 rounded-t"
                style={{ height: `${height}px` }}
                title={`${item.day}: ${item.count}`}
              />
              <span className="text-[10px] text-gray-500 mt-1">{item.day.slice(-2)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [consultations, setConsultations] = useState([])
  const [requests, setRequests] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError('')
      try {
        const [usersRes, consultRes, reqRes, metricsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/consultations'),
          api.get('/admin/doctor-requests'),
          api.get('/admin/metrics')
        ])
        setUsers(usersRes.data.users || [])
        setConsultations(consultRes.data.consultations || [])
        setRequests(reqRes.data.requests || [])
        setMetrics(metricsRes.data || null)
      } catch (err) {
        console.error('Admin dashboard load error:', err)
        setError(err.response?.data?.error || 'Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="min-h-[calc(100vh-64px)] bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">View users, consultations, and doctor requests in one place.</p>
          </div>
          <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</div>
        </header>

        {loading && (
          <div className="rounded-xl bg-white p-8 shadow">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 bg-slate-200 rounded" />
              <div className="h-4 w-64 bg-slate-200 rounded" />
              <div className="h-40 bg-slate-200 rounded" />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl bg-white shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FiUsers className="text-3xl text-blue-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">Active Users</h2>
                    <p className="text-sm text-gray-500">Total registered users</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-blue-600">{users.length}</div>
              </div>
              <div className="rounded-xl bg-white shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FiMessageCircle className="text-3xl text-purple-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">Consultations</h2>
                    <p className="text-sm text-gray-500">Total recorded consultations</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-purple-600">{consultations.length}</div>
              </div>
              <div className="rounded-xl bg-white shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl text-green-600">☎️</span>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">Doctor Requests</h2>
                    <p className="text-sm text-gray-500">Total requests submitted</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-green-600">{requests.length}</div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl bg-white shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaChartBar className="text-2xl text-orange-600" />
                  <h2 className="text-lg font-semibold text-slate-800">Activity Metrics (last 7 days)</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <SmallBarChart data={(metrics?.signups || [])} label="User Signups" />
                  <SmallBarChart data={(metrics?.consultations || [])} label="Consultations" />
                  <SmallBarChart data={(metrics?.doctorRequests || [])} label="Doctor Requests" />
                </div>
              </div>

              <div className="rounded-xl bg-white shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FiUsers className="text-2xl text-blue-600" />
                  <h2 className="text-lg font-semibold text-slate-800">Consultation Summary by User</h2>
                </div>
                {consultations.length === 0 ? (
                  <p className="text-gray-500">No consultations yet.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(() => {
                      const consultationsByUser = {}
                      consultations.forEach((c) => {
                        const username = c.username || 'Unknown'
                        if (!consultationsByUser[username]) {
                          consultationsByUser[username] = { count: 0, user_id: c.user_id }
                        }
                        consultationsByUser[username].count++
                      })
                      
                      return Object.entries(consultationsByUser)
                        .sort(([, a], [, b]) => b.count - a.count)
                        .slice(0, 8)
                        .map(([username, data]) => (
                          <div key={username} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition">
                            <div>
                              <div className="text-sm font-semibold text-slate-700">{username}</div>
                              <div className="text-xs text-gray-500">User ID: {data.user_id || 'N/A'}</div>
                            </div>
                            <div className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                              {data.count} chat{data.count !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ))
                    })()}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-xl bg-white shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl text-red-600">☎️</span>
                <h2 className="text-lg font-semibold text-slate-800">All Doctor Requests</h2>
              </div>
              {requests.length === 0 ? (
                <p className="text-gray-500">No doctor requests submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {requests.slice(0, 15).map((req) => (
                    <div key={req.id} className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-800">{req.full_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            📧 {req.email} | 📱 {req.phone}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            🏥 Specialty: {req.specialty || 'Not specified'} | Urgency: <span className={`font-semibold ${
                              req.urgency === 'High' ? 'text-red-600' :
                              req.urgency === 'Medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>{req.urgency || 'Normal'}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-2 bg-blue-50 p-2 rounded border-l-2 border-blue-500">
                            <strong>Symptoms:</strong> {req.symptoms}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            📅 Preferred: {req.preferred_date} at {req.preferred_time}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">{new Date(req.created_at).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {requests.length > 15 && (
                    <div className="text-sm text-blue-600 text-center py-2">Showing latest 15 of {requests.length} requests.</div>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
