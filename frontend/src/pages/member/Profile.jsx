import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../hooks/useAuth'
import { Shield, Mail, Phone } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600 text-sm mt-1">{user?.role.toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-b pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone size={20} className="text-primary" />
                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                  </div>
                  <p className="text-gray-900 ml-8">{user?.phone}</p>
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield size={20} className="text-primary" />
                    <label className="text-sm font-semibold text-gray-700">Kebele ID</label>
                  </div>
                  <p className="text-gray-900 ml-8">{user?.kebele_id}</p>
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield size={20} className={user?.is_verified ? 'text-green-500' : 'text-red-500'} />
                    <label className="text-sm font-semibold text-gray-700">Verification Status</label>
                  </div>
                  <div className="ml-8">
                    {user?.is_verified ? (
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        ⦿ Pending Verification
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Mail size={20} className="text-primary" />
                    <label className="text-sm font-semibold text-gray-700">Account Type</label>
                  </div>
                  <p className="text-gray-900 ml-8 capitalize">{user?.role} Account</p>
                </div>
              </div>
            </div>

            {user?.role === 'member' && !user?.is_verified && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Your account is pending verification by an administrator. You won't be able to place orders until your account is verified.
                  Please ensure your Kebele ID is correct and valid.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
