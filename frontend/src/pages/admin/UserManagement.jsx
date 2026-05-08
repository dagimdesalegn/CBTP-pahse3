import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import api from '../../services/api'
import { Check, X } from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [search])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)

      const response = await api.get(`/users?${params}`)
      setUsers(response.data.data || [])
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch users' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (userId, isVerified) => {
    try {
      await api.put(`/users/${userId}/verify`, { is_verified: !isVerified })
      setToast({
        type: 'success',
        message: isVerified ? 'User unverified' : 'User verified',
      })
      fetchUsers()
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update user' })
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Kebele ID</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-center">Verified</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                      <td className="px-4 py-3">{user.kebele_id}</td>
                      <td className="px-4 py-3 capitalize">{user.role}</td>
                      <td className="px-4 py-3 text-center">
                        {user.is_verified ? (
                          <Check className="text-green-600 mx-auto" size={20} />
                        ) : (
                          <X className="text-red-600 mx-auto" size={20} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {user.role === 'member' && (
                            <button
                              onClick={() => handleVerify(user.id, user.is_verified)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                user.is_verified
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {user.is_verified ? 'Unverify' : 'Verify'}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setSelectedUser(null)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">New Registration Details</h2>
                <p className="text-blue-100 text-sm">Review member information</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-xl font-bold hover:text-blue-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs uppercase tracking-wider text-gray-500">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">{selectedUser.name}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-xs uppercase tracking-wider text-blue-600">Email Address</p>
                <p className="text-lg font-semibold text-blue-900">{selectedUser.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Kebele ID</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedUser.kebele_id}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Role</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{selectedUser.role}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs uppercase tracking-wider text-gray-500">Verification Status</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                  selectedUser.is_verified
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedUser.is_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
