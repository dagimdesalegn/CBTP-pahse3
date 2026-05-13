import { useEffect, useMemo, useState } from 'react'
import { Check, CreditCard, Eye, KeyRound, Search, ShieldCheck, X } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import { Button, DataTable, EmptyState, PageHeader } from '../../components/ui'
import { formatBirr } from '../../utils/currency'
import api from '../../services/api'
import { getKebeleSuggestions } from '../../data/ethiopiaLocations'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [walletAmount, setWalletAmount] = useState('')
  const [walletDescription, setWalletDescription] = useState('')
  const [accessLevel, setAccessLevel] = useState('')
  const [selectedRole, setSelectedRole] = useState('member')
  const [managerKebele, setManagerKebele] = useState('')

  const apiBase = import.meta.env.VITE_API_URL || ''
  const publicBase = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase
  const selectedImageUrl = selectedUser?.kebele_id_image_path ? `${publicBase}/storage/${selectedUser.kebele_id_image_path}` : null
  const selectedCouponImageUrl = selectedUser?.coupon_id_image_path ? `${publicBase}/storage/${selectedUser.coupon_id_image_path}` : null
  const managerKebeleSuggestions = useMemo(() => {
    const kebeles = getKebeleSuggestions('', '', '', managerKebele)
    const values = ['Bosa Addis Kebele', ...kebeles, ...kebeles.map(kebele => `${kebele} Kebele`)]
    return [...new Set(values)].filter(kebele => kebele.toLowerCase().includes(managerKebele.toLowerCase()))
  }, [managerKebele])

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
      setToast({ type: 'success', message: isVerified ? 'User unverified' : 'User verified' })
      fetchUsers()
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update user' })
    }
  }

  const openDetails = (user) => {
    setSelectedUser(user)
    setSelectedRole(user.role || 'member')
    setAccessLevel(user.access_level || 'super_admin')
    setManagerKebele(user.manager_kebele || '')
    setWalletAmount('')
    setWalletDescription('')
  }

  const updateAccess = async () => {
    try {
      await api.put(`/users/${selectedUser.id}/access`, {
        role: selectedRole,
        access_level: selectedRole === 'admin' ? accessLevel : selectedUser.access_level,
        membership_status: selectedUser.membership_status || 'active',
        manager_kebele: selectedRole === 'manager' ? managerKebele.trim() : '',
      })
      setToast({ type: 'success', message: 'Access updated' })
      setSelectedUser(prev => prev ? { ...prev, role: selectedRole, access_level: selectedRole === 'admin' ? accessLevel : prev.access_level, manager_kebele: selectedRole === 'manager' ? managerKebele.trim() : '' } : prev)
      fetchUsers()
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update access' })
    }
  }

  const adjustWallet = async () => {
    try {
      await api.post('/wallet/adjust', {
        user_id: selectedUser.id,
        amount: Number(walletAmount),
        description: walletDescription || 'Admin wallet adjustment',
      })
      setToast({ type: 'success', message: 'Wallet updated' })
      setWalletAmount('')
      setWalletDescription('')
      fetchUsers()
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to adjust wallet' })
    }
  }

  if (loading) return <LoadingSpinner />

  const columns = [
    {
      key: 'name',
      header: 'Member',
      render: user => (
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{user.name?.charAt(0)?.toUpperCase()}</span>
          )}
          <div>
            <p className="font-bold text-slate-950">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: user => <span className="capitalize">{user.role}</span> },
    { key: 'manager_kebele', header: 'Manager Kebele', render: user => user.role === 'manager' ? (user.manager_kebele || 'Not assigned') : '-' },
    {
      key: 'verified',
      header: 'Verified',
      cellClassName: 'text-center',
      render: user => user.is_verified ? <Check className="mx-auto text-emerald-600" size={20} /> : <X className="mx-auto text-red-600" size={20} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: user => (
        <div className="flex flex-wrap gap-2">
          {user.role === 'member' && (
            <Button
              variant={user.is_verified ? 'danger' : 'success'}
              className="px-3 py-2"
              onClick={() => handleVerify(user.id, user.is_verified)}
            >
              <ShieldCheck size={15} />
              {user.is_verified ? 'Unverify' : 'Verify'}
            </Button>
          )}
          <Button variant="secondary" className="px-3 py-2" onClick={() => openDetails(user)}>
            <Eye size={15} />
            Details
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Members"
        title="User Management"
        description="Search members, verify accounts, and inspect submitted verification documents."
      />

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="relative block max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="ui-input pl-10" />
        </label>
      </div>

      <DataTable columns={columns} rows={users} empty={<EmptyState title="No users found" description="Try a different search term." />} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-slate-950/55" onClick={() => setSelectedUser(null)} aria-label="Close details" />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="flex items-start justify-between bg-slate-900 p-5 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Verification review</p>
                <h2 className="mt-1 text-2xl font-black">Member Details</h2>
              </div>
              <button onClick={() => setSelectedUser(null)} className="rounded-lg p-2 hover:bg-white/10"><X size={20} /></button>
            </div>
            <div className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Full Name" value={selectedUser.name} />
                <Info label="Email Address" value={selectedUser.email} />
                <Info label="Phone" value={selectedUser.phone || 'Not provided'} />
                <Info label="Role" value={selectedUser.role} />
                <Info label="Access Level" value={selectedUser.access_level || (selectedUser.role === 'admin' ? 'super_admin' : 'Standard')} />
                <Info label="Wallet Balance" value={formatBirr(selectedUser.account_balance || 0)} />
                <Info label="Membership" value={selectedUser.membership_status || 'active'} />
                <Info label="Manager Kebele" value={selectedUser.manager_kebele || 'Not assigned'} />
                <Info label="Region" value={selectedUser.verification_region || 'Not provided'} />
                <Info label="City" value={selectedUser.verification_city || 'Not provided'} />
                <Info label="Woreda/Sub-city" value={selectedUser.verification_woreda_subcity || 'Not provided'} />
                <Info label="Kebele" value={selectedUser.verification_kebele || 'Not provided'} />
                <Info label="Kebele ID" value={selectedUser.kebele_id?.startsWith('PENDING-') || selectedUser.kebele_id?.startsWith('GOOGLE-') ? 'Not provided' : selectedUser.kebele_id} />
                <Info label="Verification" value={selectedUser.is_verified ? 'Verified' : 'Pending'} />
                <Info label="Submitted At" value={selectedUser.verification_submitted_at ? new Date(selectedUser.verification_submitted_at).toLocaleString() : 'Not submitted'} />
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <KeyRound size={18} className="text-amber-700" />
                  <p className="text-sm font-black text-slate-950">Role assignment</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <select name="role" value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="ui-input">
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button type="button" onClick={updateAccess}>Save role</Button>
                </div>
              </div>
              {selectedRole === 'admin' && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <KeyRound size={18} className="text-amber-700" />
                    <p className="text-sm font-black text-slate-950">Admin access level</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <select value={accessLevel} onChange={e => setAccessLevel(e.target.value)} className="ui-input">
                      <option value="super_admin">Super admin - all features</option>
                      <option value="operations_admin">Operations admin - users, orders, products, inventory</option>
                      <option value="report_admin">Report admin - reports and messages</option>
                      <option value="support_admin">Support admin - users, orders, wallet, messages</option>
                    </select>
                    <Button type="button" onClick={updateAccess}>Save access</Button>
                  </div>
                </div>
              )}
              {selectedRole === 'manager' && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <KeyRound size={18} className="text-amber-700" />
                    <p className="text-sm font-black text-slate-950">Manager Kebele assignment</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      value={managerKebele}
                      onChange={e => setManagerKebele(e.target.value)}
                      placeholder="Bosa Addis Kebele"
                      list="manager-kebele-options"
                      className="ui-input"
                    />
                    <datalist id="manager-kebele-options">
                      {managerKebeleSuggestions.map(kebele => <option key={kebele} value={kebele} />)}
                    </datalist>
                    <Button type="button" onClick={updateAccess}>Save Kebele</Button>
                  </div>
                </div>
              )}
              {selectedUser.role === 'member' && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <CreditCard size={18} className="text-amber-700" />
                    <p className="text-sm font-black text-slate-950">Wallet adjustment</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[160px_1fr_auto]">
                    <input type="number" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} placeholder="+500 or -100" className="ui-input" />
                    <input value={walletDescription} onChange={e => setWalletDescription(e.target.value)} placeholder="Reason" className="ui-input" />
                    <Button type="button" onClick={adjustWallet} disabled={!walletAmount}>Apply</Button>
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Kebele ID / Fayda ID</p>
                {selectedImageUrl ? (
                  <div className="mt-3 space-y-2">
                    <img src={selectedImageUrl} alt="Kebele ID / Fayda ID" className="max-h-72 w-full rounded-lg border border-slate-200 object-contain" />
                    <a href={selectedImageUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-amber-700">Open full image</a>
                  </div>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-slate-700">Not uploaded</p>
                )}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Coupon ID Image</p>
                {selectedCouponImageUrl ? (
                  <div className="mt-3 space-y-2">
                    <img src={selectedCouponImageUrl} alt="Coupon ID" className="max-h-72 w-full rounded-lg border border-slate-200 object-contain" />
                    <a href={selectedCouponImageUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-amber-700">Open coupon image</a>
                  </div>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-slate-700">Not uploaded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-950">{value}</p>
    </div>
  )
}
