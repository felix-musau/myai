import React, { useEffect, useState } from 'react'
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
                <h2 className="text-lg font-semibold text-slate-800">Active Users</h2>
                <p className="text-sm text-gray-500 mt-1">Total registered users</p>
                <div className="mt-4 text-4xl font-bold text-blue-600">{users.length}</div>
              </div>
              <div className="rounded-xl bg-white shadow p-6">
                <h2 className="text-lg font-semibold text-slate-800">Consultations</h2>
                <p className="text-sm text-gray-500 mt-1">Total recorded consultations</p>
                <div className="mt-4 text-4xl font-bold text-blue-600">{consultations.length}</div>
              </div>
              <div className="rounded-xl bg-white shadow p-6">
                <h2 className="text-lg font-semibold text-slate-800">Doctor Requests</h2>
                <p className="text-sm text-gray-500 mt-1">Total requests submitted</p>
                <div className="mt-4 text-4xl font-bold text-blue-600">{requests.length}</div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl bg-white shadow p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Activity Metrics (last 7 days)</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <SmallBarChart data={(metrics?.signups || [])} label="User Signups" />
                  <SmallBarChart data={(metrics?.consultations || [])} label="Consultations" />
                  <SmallBarChart data={(metrics?.doctorRequests || [])} label="Doctor Requests" />
                </div>
              </div>

              <div className="rounded-xl bg-white shadow p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Requests</h2>
                {requests.length === 0 ? (
                  <p className="text-gray-500">No doctor requests yet.</p>
                ) : (
                  <div className="space-y-3">
                    {requests.slice(0, 6).map((req) => (
                      <div key={req.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{req.full_name || req.email}</div>
                            <div className="text-xs text-gray-500">{req.urgency || 'Normal'}</div>
                          </div>
                          <div className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{req.symptoms}</p>
                      </div>
                    ))}
                    {requests.length > 6 && (
                      <div className="text-sm text-blue-600">Showing latest 6 requests.</div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-xl bg-white shadow p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Username</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {users.slice(0, 10).map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-3 text-sm text-slate-700">{user.username}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 capitalize">{user.isAdmin ? 'admin' : 'user'}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{formatDate(user.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length > 10 && (
                  <div className="mt-2 text-sm text-gray-500">Showing latest 10 users.</div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
