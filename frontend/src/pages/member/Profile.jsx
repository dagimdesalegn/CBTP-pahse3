import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../../components/AppLayout'
import { useAuth } from '../../hooks/useAuth'
import { CreditCard, Shield, Mail, Phone } from 'lucide-react'
import api from '../../services/api'
import Toast from '../../components/Toast'
import { SectionCard, StatCard } from '../../components/ui'
import { formatBirr } from '../../utils/currency'
import { getCitySuggestions, getKebeleSuggestions, getRegionSuggestions, getWoredaSuggestions } from '../../data/ethiopiaLocations'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [verificationData, setVerificationData] = useState({
    verification_region: '',
    verification_city: '',
    verification_woreda_subcity: '',
    verification_kebele: '',
    kebele_id_image: null,
    coupon_id_image: null,
    phone: '',
  })
  const [selectedFileName, setSelectedFileName] = useState('')
  const [selectedCouponFileName, setSelectedCouponFileName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [wallet, setWallet] = useState(null)
  const kebeleDisplay = user?.kebele_id?.startsWith('PENDING-') || user?.kebele_id?.startsWith('GOOGLE-')
    ? 'Not provided'
    : user?.kebele_id
  const regionSuggestions = useMemo(() => getRegionSuggestions(verificationData.verification_region), [verificationData.verification_region])
  const citySuggestions = useMemo(
    () => getCitySuggestions(verificationData.verification_region, verificationData.verification_city),
    [verificationData.verification_region, verificationData.verification_city]
  )
  const woredaSuggestions = useMemo(
    () => getWoredaSuggestions(verificationData.verification_region, verificationData.verification_city, verificationData.verification_woreda_subcity),
    [verificationData.verification_region, verificationData.verification_city, verificationData.verification_woreda_subcity]
  )
  const kebeleSuggestions = useMemo(
    () => getKebeleSuggestions(
      verificationData.verification_region,
      verificationData.verification_city,
      verificationData.verification_woreda_subcity,
      verificationData.verification_kebele
    ),
    [
      verificationData.verification_region,
      verificationData.verification_city,
      verificationData.verification_woreda_subcity,
      verificationData.verification_kebele,
    ]
  )

  useEffect(() => {
    api.get('/wallet').then(res => setWallet(res.data)).catch(() => {})
  }, [])

  const handleVerificationChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'kebele_id_image' || name === 'coupon_id_image') {
      const file = files?.[0] || null
      setVerificationData((prev) => ({ ...prev, [name]: file }))
      const label = file ? `${file.name} (${Math.ceil(file.size / 1024)} KB)` : ''
      if (name === 'kebele_id_image') {
        setSelectedFileName(label)
      } else {
        setSelectedCouponFileName(label)
      }
      return
    }
    setVerificationData((prev) => ({ ...prev, [name]: value }))
  }

  const handleVerificationSubmit = async (e) => {
    e.preventDefault()

    if (!verificationData.kebele_id_image || !(verificationData.kebele_id_image instanceof File)) {
      setToast({
        type: 'error',
        message: 'Please upload a Kebele ID, Fayda, or plan document image.',
      })
      return
    }

    if (!verificationData.coupon_id_image || !(verificationData.coupon_id_image instanceof File)) {
      setToast({
        type: 'error',
        message: 'Please upload a coupon ID image.',
      })
      return
    }

    if (verificationData.kebele_id_image.size > 10 * 1024 * 1024) {
      setToast({
        type: 'error',
        message: 'Kebele ID / Fayda / Plan document must be 10MB or less',
      })
      return
    }

    if (verificationData.coupon_id_image.size > 10 * 1024 * 1024) {
      setToast({
        type: 'error',
        message: 'Coupon ID image must be 10MB or less',
      })
      return
    }

    // phone validation - Ethiopian format (international +251, local 0, or bare digits)
    const phoneRaw = (verificationData.phone || '').trim()
    const normalizedPhone = phoneRaw.replace(/[\s-]/g, '')
    if (normalizedPhone) {
      const ethioRegex = /^(\+251[79]\d{8}|0[79]\d{8}|[79]\d{8})$/
      if (!ethioRegex.test(normalizedPhone)) {
        setToast({ type: 'error', message: 'Invalid phone format. Use +2519xxxxxxxx, 09xxxxxxxx, or 9xxxxxxxx.' })
        return
      }
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('verification_region', verificationData.verification_region.trim())
      formData.append('verification_city', verificationData.verification_city.trim())
      formData.append('verification_woreda_subcity', verificationData.verification_woreda_subcity.trim())
      formData.append('verification_kebele', verificationData.verification_kebele.trim())
      if (normalizedPhone) formData.append('phone', normalizedPhone)
      formData.append('kebele_id_image', verificationData.kebele_id_image)
      formData.append('coupon_id_image', verificationData.coupon_id_image)

      const response = await api.post('/users/verification', formData)

      updateUser(response.data.user)
      setToast({ type: 'success', message: 'Verification submitted. Please wait for admin approval.' })
      setVerificationData({
        verification_region: '',
        verification_city: '',
        verification_woreda_subcity: '',
        verification_kebele: '',
        kebele_id_image: null,
        coupon_id_image: null,
        phone: '',
      })
      setSelectedFileName('')
      setSelectedCouponFileName('')
    } catch (error) {
      const validationErrors = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : null

      setToast({
        type: 'error',
        message: validationErrors || error.response?.data?.error || 'Verification submission failed',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <AppLayout maxWidth="max-w-2xl">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-8">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user?.name || 'Avatar'} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
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
                    <p className="text-gray-900 ml-8">{kebeleDisplay}</p>
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

              {user?.role === 'member' && (
                <div className="mt-6 space-y-4">
                  <StatCard title="Wallet balance" value={formatBirr(wallet?.balance || user?.account_balance || 0)} icon={CreditCard} tone="amber" hint={`Status: ${wallet?.membership_status || user?.membership_status || 'active'}`} />
                  <SectionCard title="Recent wallet activity">
                    {wallet?.transactions?.length ? (
                      <div className="divide-y divide-slate-100">
                        {wallet.transactions.slice(0, 5).map(transaction => (
                          <div key={transaction.id} className="flex items-center justify-between gap-3 py-3">
                            <div>
                              <p className="text-sm font-bold capitalize text-slate-950">{transaction.type.replace('_', ' ')}</p>
                              <p className="text-xs text-slate-500">{transaction.description || 'Wallet transaction'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-950">{formatBirr(transaction.amount)}</p>
                              <p className="text-xs text-slate-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-600">No wallet transactions yet.</p>
                    )}
                  </SectionCard>
                </div>
              )}

              {user?.role === 'member' && !user?.is_verified && (
                <div className="mt-6 space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      Your account is pending verification by an administrator. You won't be able to place orders until your account is verified.
                    </p>
                    {user?.verification_submitted_at ? (
                      <p className="text-yellow-700 text-sm mt-2">
                        Verification submitted. Please wait for approval.
                      </p>
                    ) : (
                      <p className="text-yellow-700 text-sm mt-2">
                        Submit your address, identity document, and coupon ID image to begin verification.
                      </p>
                    )}
                  </div>

                  {!user?.verification_submitted_at && (
                    <form onSubmit={handleVerificationSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                      <h2 className="text-lg font-bold text-gray-900">Verification Request</h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Region</label>
                          <input
                            type="text"
                            name="verification_region"
                            value={verificationData.verification_region}
                            onChange={handleVerificationChange}
                            placeholder="Start typing region"
                            list="verification-region-options"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <datalist id="verification-region-options">
                            {regionSuggestions.map(region => <option key={region} value={region} />)}
                          </datalist>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                          <input
                            type="text"
                            name="verification_city"
                            value={verificationData.verification_city}
                            onChange={handleVerificationChange}
                            placeholder="Start typing city"
                            list="verification-city-options"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <datalist id="verification-city-options">
                            {citySuggestions.map(city => <option key={city} value={city} />)}
                          </datalist>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Woreda/Sub-city</label>
                          <input
                            type="text"
                            name="verification_woreda_subcity"
                            value={verificationData.verification_woreda_subcity}
                            onChange={handleVerificationChange}
                            placeholder="Start typing woreda or sub-city"
                            list="verification-woreda-options"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <datalist id="verification-woreda-options">
                            {woredaSuggestions.map(woreda => <option key={woreda} value={woreda} />)}
                          </datalist>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Kebele</label>
                          <input
                            type="text"
                            name="verification_kebele"
                            value={verificationData.verification_kebele}
                            onChange={handleVerificationChange}
                            placeholder="Start typing kebele"
                            list="verification-kebele-options"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <datalist id="verification-kebele-options">
                            {kebeleSuggestions.map(kebele => <option key={kebele} value={kebele} />)}
                          </datalist>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">🇪🇹 Phone Number (Optional)</label>
                        <input
                          type="tel"
                          name="phone"
                          value={verificationData.phone}
                          onChange={handleVerificationChange}
                          placeholder="0912345678 or 912345678 or +251912345678"
                          pattern="(\+251[79][0-9]{8}|0[79][0-9]{8}|[79][0-9]{8})"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: +2519xxxxxxxx, 09xxxxxxxx, or 9xxxxxxxx</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Kebele ID / Fayda / Plan</label>
                        <input
                          type="file"
                          name="kebele_id_image"
                          accept="image/*,application/pdf,.heic,.heif,.webp"
                          onChange={handleVerificationChange}
                          required
                          className="w-full text-sm text-gray-600"
                        />
                        {selectedFileName && (
                          <p className="text-xs text-gray-500 mt-1">Selected: {selectedFileName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Coupon ID Image</label>
                        <input
                          type="file"
                          name="coupon_id_image"
                          accept="image/*,application/pdf,.heic,.heif,.webp"
                          onChange={handleVerificationChange}
                          required
                          className="w-full text-sm text-gray-600"
                        />
                        {selectedCouponFileName && (
                          <p className="text-xs text-gray-500 mt-1">Selected: {selectedCouponFileName}</p>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          'Submit Verification'
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
      </AppLayout>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  )
}
