import { useEffect, useState } from 'react'
import { Edit2, Plus, Trash2, X } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import { Button, DataTable, EmptyState, PageHeader, SectionCard } from '../../components/ui'
import api from '../../services/api'

const initialForm = {
  company_name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  contract_terms: '',
}

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialForm)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers?per_page=100')
      setSuppliers(response.data.data || [])
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch suppliers' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(initialForm)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, formData)
        setToast({ type: 'success', message: 'Supplier updated successfully' })
      } else {
        await api.post('/suppliers', formData)
        setToast({ type: 'success', message: 'Supplier created successfully' })
      }
      resetForm()
      fetchSuppliers()
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to save supplier' })
    }
  }

  const handleEdit = (supplier) => {
    setEditingId(supplier.id)
    setFormData({
      company_name: supplier.company_name || '',
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      contract_terms: supplier.contract_terms || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier? Products linked to it will keep working without a supplier.')) return
    try {
      await api.delete(`/suppliers/${id}`)
      setToast({ type: 'success', message: 'Supplier deleted successfully' })
      fetchSuppliers()
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete supplier' })
    }
  }

  if (loading) return <LoadingSpinner />

  const columns = [
    { key: 'company_name', header: 'Supplier', render: s => <div><p className="font-bold text-slate-950">{s.company_name}</p><p className="text-xs text-slate-500">{s.contact_person || 'No contact person'}</p></div> },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'products_count', header: 'Products', cellClassName: 'text-center font-bold', render: s => s.products_count || 0 },
    {
      key: 'actions',
      header: 'Actions',
      render: s => (
        <div className="flex gap-2">
          <Button variant="secondary" className="px-3 py-2" onClick={() => handleEdit(s)}><Edit2 size={15} /> Edit</Button>
          <Button variant="danger" className="px-3 py-2" onClick={() => handleDelete(s.id)}><Trash2 size={15} /></Button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Suppliers"
        title="Supplier Management"
        description="Track supplier contact details, contract terms, and the products connected to each supplier."
        actions={<Button onClick={() => setShowForm(true)}><Plus size={17} /> Add Supplier</Button>}
      />

      {showForm && (
        <SectionCard title={editingId ? 'Edit supplier' : 'Add supplier'} actions={<Button variant="ghost" onClick={resetForm}><X size={17} /> Close</Button>} className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['company_name', 'Company Name'],
                ['contact_person', 'Contact Person'],
                ['phone', 'Phone'],
                ['email', 'Email'],
                ['address', 'Address'],
              ].map(([field, label]) => (
                <label key={field}>
                  <span className="ui-label">{label}</span>
                  <input value={formData[field]} onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))} required={field === 'company_name'} className="ui-input" />
                </label>
              ))}
            </div>
            <label>
              <span className="ui-label">Contract Terms</span>
              <textarea value={formData.contract_terms} onChange={(e) => setFormData(prev => ({ ...prev, contract_terms: e.target.value }))} rows="3" className="ui-input" />
            </label>
            <Button type="submit">{editingId ? 'Update Supplier' : 'Create Supplier'}</Button>
          </form>
        </SectionCard>
      )}

      <DataTable columns={columns} rows={suppliers} empty={<EmptyState title="No suppliers yet" description="Add suppliers so products can be traced to their sources." />} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
