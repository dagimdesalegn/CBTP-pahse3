import { useEffect, useState } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import { Button, DataTable, EmptyState, PageHeader, StockBadge } from '../../components/ui'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../hooks/useAuth'

const adjustmentLabels = {
  receive: 'Receive stock',
  damage: 'Damage / loss',
  correction: 'Correction',
  transfer_request: 'Transfer request note',
}

export default function InventoryManagement() {
  const { t, productName } = useLanguage()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [movementData, setMovementData] = useState(null)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [adjustmentMode, setAdjustmentMode] = useState('receive')
  const [filters, setFilters] = useState({ search: '', category: '', stockStatus: '' })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchProducts(1)
    fetchMovementHistory()
  }, [filters])

  const fetchProducts = async (page = pagination.current_page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, per_page: 20 })
      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category)
      if (filters.stockStatus) params.append('stock_status', filters.stockStatus)
      const response = await api.get(`/products?${params}`)
      setProducts(response.data.data || [])
      setPagination({
        current_page: response.data.current_page || page,
        last_page: response.data.last_page || 1,
      })
    } catch (err) {
      setToast({ type: 'error', message: t('products.fetchFailed') })
    } finally {
      setLoading(false)
    }
  }

  const fetchMovementHistory = async () => {
    try {
      const response = await api.get('/inventory/logs')
      setMovementData(response.data)
    } catch (err) {
      setMovementData(null)
    }
  }

  const handleUpdateInventory = async (productId) => {
    if (!quantity || !reason) {
      setToast({ type: 'error', message: t('admin.fillAll') })
      return
    }

    const product = products.find(item => item.id === productId)
    const nextQuantity = resolveNextQuantity(product, Number(quantity), adjustmentMode)

    try {
      await api.put(`/inventory/${productId}`, {
        quantity: nextQuantity,
        reason: `${adjustmentLabels[adjustmentMode]}: ${reason}`,
        type: adjustmentMode,
      })
      setToast({ type: 'success', message: t('inventory.updated') })
      setEditingId(null)
      setQuantity('')
      setReason('')
      setAdjustmentMode('receive')
      fetchProducts()
      fetchMovementHistory()
    } catch (err) {
      setToast({ type: 'error', message: t('inventory.updateFailed') })
    }
  }

  if (loading) return <LoadingSpinner />

  const columns = [
    { key: 'name', header: t('common.product'), render: p => <p className="font-bold text-slate-950">{productName(p)}</p> },
    { key: 'kebele', header: 'Kebele', render: p => p.kebele || 'Not assigned' },
    { key: 'category', header: t('common.category'), render: p => p.category || '-' },
    { key: 'quantity', header: t('inventory.currentStock'), cellClassName: 'font-bold text-slate-950', render: p => p.quantity },
    { key: 'status', header: t('inventory.status'), render: p => <StockBadge quantity={p.quantity} /> },
    {
      key: 'action',
      header: t('inventory.action'),
      render: p => editingId === p.id ? (
        <div className="flex min-w-[620px] flex-wrap items-center gap-2">
          <select value={adjustmentMode} onChange={(e) => setAdjustmentMode(e.target.value)} className="ui-input w-44">
            {Object.entries(adjustmentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={adjustmentMode === 'correction' ? 'New qty' : 'Qty'} className="ui-input w-24" />
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('inventory.reason')} className="ui-input" />
          <Button className="px-3 py-2" onClick={() => handleUpdateInventory(p.id)}><Save size={15} /></Button>
          <Button variant="secondary" className="px-3 py-2" onClick={() => setEditingId(null)}><X size={15} /></Button>
        </div>
      ) : (
        <Button variant="secondary" className="px-3 py-2" onClick={() => { setEditingId(p.id); setQuantity(''); setReason(''); setAdjustmentMode('receive') }}>
          <Edit2 size={15} /> {t('inventory.adjust')}
        </Button>
      ),
    },
  ]

  return (
    <AppLayout>
      <PageHeader
        eyebrow={t('nav.inventory')}
        title={t('inventory.title')}
        description={t('inventory.desc')}
      />
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
        Assigned Kebele: {user?.manager_kebele || 'All Kebeles for admin users'}
      </div>

      <div className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <input value={filters.search} onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))} placeholder="Search products" className="ui-input" />
        <input value={filters.category} onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))} placeholder="Category" className="ui-input" />
        <select value={filters.stockStatus} onChange={e => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))} className="ui-input">
          <option value="">All stock</option>
          <option value="in_stock">Healthy stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
        <Button variant="secondary" onClick={() => setFilters({ search: '', category: '', stockStatus: '' })}>Clear filters</Button>
      </div>

      <DataTable columns={columns} rows={products} empty={<EmptyState title={t('inventory.noRecords')} description={t('inventory.noRecordsDesc')} />} />
      <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700">
        <Button variant="secondary" disabled={pagination.current_page <= 1} onClick={() => fetchProducts(pagination.current_page - 1)}>Previous</Button>
        <span>Page {pagination.current_page} of {pagination.last_page}</span>
        <Button variant="secondary" disabled={pagination.current_page >= pagination.last_page} onClick={() => fetchProducts(pagination.current_page + 1)}>Next</Button>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-black text-slate-950">Recent stock movements</h2>
        <DataTable columns={movementColumns(productName)} rows={movementData?.data || []} empty={<EmptyState title="No recent stock movements" />} />
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}

function resolveNextQuantity(product, amount, mode) {
  const current = Number(product?.quantity || 0)
  if (mode === 'receive') return current + amount
  if (mode === 'damage') return Math.max(0, current - amount)
  if (mode === 'transfer_request') return current
  return Math.max(0, amount)
}

function movementColumns(productName) {
  return [
    { key: 'product', header: 'Product', render: log => <p className="font-bold text-slate-950">{productName(log.product)}</p> },
    { key: 'type', header: 'Movement', render: log => <span className="capitalize">{String(log.type || 'adjustment').replaceAll('_', ' ')}</span> },
    { key: 'change_amount', header: 'Change', cellClassName: 'text-right font-black', render: log => Number(log.change_amount) > 0 ? `+${log.change_amount}` : log.change_amount },
    { key: 'quantity', header: 'Before / After', render: log => `${log.previous_quantity ?? '-'} -> ${log.new_quantity ?? '-'}` },
    { key: 'reason', header: 'Reason', render: log => log.reason || '-' },
    { key: 'created_at', header: 'Date', render: log => new Date(log.created_at).toLocaleString() },
  ]
}
