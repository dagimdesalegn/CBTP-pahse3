import { useEffect, useState } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import { Button, DataTable, EmptyState, PageHeader, StockBadge } from '../../components/ui'
import api from '../../services/api'

export default function InventoryManagement() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?page=1&per_page=100')
      setProducts(response.data.data || [])
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch products' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateInventory = async (productId) => {
    if (!quantity || !reason) {
      setToast({ type: 'error', message: 'Please fill all fields' })
      return
    }

    try {
      await api.put(`/inventory/${productId}`, { quantity: parseInt(quantity), reason })
      setToast({ type: 'success', message: 'Inventory updated' })
      setEditingId(null)
      setQuantity('')
      setReason('')
      fetchProducts()
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update inventory' })
    }
  }

  if (loading) return <LoadingSpinner />

  const columns = [
    { key: 'name', header: 'Product', render: p => <p className="font-bold text-slate-950">{p.name}</p> },
    { key: 'quantity', header: 'Current Stock', cellClassName: 'font-bold text-slate-950', render: p => p.quantity },
    { key: 'status', header: 'Status', render: p => <StockBadge quantity={p.quantity} /> },
    {
      key: 'action',
      header: 'Action',
      render: p => editingId === p.id ? (
        <div className="flex min-w-[420px] items-center gap-2">
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="ui-input w-24" />
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="ui-input" />
          <Button className="px-3 py-2" onClick={() => handleUpdateInventory(p.id)}><Save size={15} /></Button>
          <Button variant="secondary" className="px-3 py-2" onClick={() => setEditingId(null)}><X size={15} /></Button>
        </div>
      ) : (
        <Button variant="secondary" className="px-3 py-2" onClick={() => { setEditingId(p.id); setQuantity(p.quantity.toString()); setReason('') }}>
          <Edit2 size={15} /> Adjust
        </Button>
      ),
    },
  ]

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Inventory"
        title="Inventory Management"
        description="Adjust stock quantities and capture a reason for every inventory movement."
      />
      <DataTable columns={columns} rows={products} empty={<EmptyState title="No inventory records" description="Products will appear here after they are created." />} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
