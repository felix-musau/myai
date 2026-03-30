import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser } from 'react-icons/fi'
import { AuthContext } from '../App'
import api from '../services/api'

export default function Profile() {
  const { user, logout } = useContext(AuthContext)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [changeError, setChangeError] = useState('')
  const [changeSuccess, setChangeSuccess] = useState('')
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      console.error('logout error', e)
    }
    logout()
    navigate('/login', { replace: true })
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setChangeError('')
    setChangeSuccess('')

    if (newPassword !== confirmNewPassword) {
      setChangeError('New passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setChangeError('New password must be at least 8 characters')
      return
    }

    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      })
      setChangeSuccess(res.data.message || 'Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setShowChangePassword(false)
    } catch (err) {
      setChangeError(err.response?.data?.error || 'Failed to update password')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <div className="flex items-center gap-2 mb-4">
          <FiUser className="text-2xl text-blue-600" />
          <h2 className="text-xl font-bold">My Profile</h2>
        </div>
        <p className="mb-2"><strong>Username:</strong> {user?.username}</p>
        <p className="mb-4"><strong>Email:</strong> {user?.email || 'N/A'}</p>

        {changeError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {changeError}
          </div>
        )}

        {changeSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            {changeSuccess}
          </div>
        )}

        {!showChangePassword ? (
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md mb-3"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-3 mb-3">
            <input
              type="password"
              placeholder="Current password"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md">Save</button>
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md"
        >
          Logout
        </button>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  )
}