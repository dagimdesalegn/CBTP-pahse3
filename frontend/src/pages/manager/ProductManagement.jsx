import { useEffect, useState } from 'react'
import { Edit2, ImagePlus, PackagePlus, Plus, Trash2, X } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import { Button, DataTable, EmptyState, PageHeader, SectionCard, StockBadge } from '../../components/ui'
import { formatBirr } from '../../utils/currency'
import api from '../../services/api'

export default function ProductManagement() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [formData, setFormData] = useState({ name: '', description: '', price: '', discount_price: '', quantity: '', category: '', supplier_id: '', image: null })
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        api.get('/products?page=1&per_page=100'),
        api.get('/suppliers?per_page=100'),
      ])
      setProducts(productsRes.data.data || [])
      setSuppliers(suppliersRes.data.data || [])
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch products' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', description: '', price: '', discount_price: '', quantity: '', category: '', supplier_id: '', image: null })
    setImagePreview('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) payload.append(key, value)
      })
      if (editingId) {
        payload.append('_method', 'PUT')
        await api.post(`/products/${editingId}`, payload)
        setToast({ type: 'success', message: 'Product updated successfully' })
      } else {
        await api.post('/products', payload)
        setToast({ type: 'success', message: 'Product created successfully' })
      }
      fetchProducts()
      resetForm()
    } catch (err) {
      const validationErrors = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : null
      setToast({ type: 'error', message: validationErrors || err.response?.data?.message || err.response?.data?.error || 'Failed to save product' })
    }
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      discount_price: product.discount_price || '',
      quantity: product.quantity || '',
      category: product.category || '',
        supplier_id: product.supplier_id || '',
        image: null,
      })
    setImagePreview(product.image_path || '')
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null
    setFormData(prev => ({ ...prev, image: file }))
    setImagePreview(file ? URL.createObjectURL(file) : '')
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`)
        setToast({ type: 'success', message: 'Product deleted successfully' })
        fetchProducts()
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to delete product' })
      }
    }
  }

  if (loading) return <LoadingSpinner />

  const columns = [
    { key: 'name', header: 'Product', render: p => <div><p className="font-bold text-slate-950">{p.name}</p><p className="line-clamp-1 text-xs text-slate-500">{p.description}</p></div> },
    { key: 'category', header: 'Category', render: p => <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{p.category}</span> },
    { key: 'supplier', header: 'Supplier', render: p => p.supplier?.company_name || '-' },
    { key: 'price', header: 'Price', cellClassName: 'text-right font-bold text-slate-950', render: p => <div>{formatBirr(p.effective_price ?? p.price)}{p.discount_price && <p className="text-xs text-slate-400 line-through">{formatBirr(p.price)}</p>}</div> },
    { key: 'quantity', header: 'Stock', render: p => <div className="flex items-center gap-2"><span className="font-bold">{p.quantity}</span><StockBadge quantity={p.quantity} /></div> },
    {
      key: 'actions',
      header: 'Actions',
      cellClassName: 'text-right',
      render: p => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" className="px-3 py-2" onClick={() => handleEdit(p)}><Edit2 size={15} /> Edit</Button>
          <Button variant="danger" className="px-3 py-2" onClick={() => handleDelete(p.id)}><Trash2 size={15} /></Button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Catalog"
        title="Product Management"
        description="Maintain the storefront catalog, pricing, categories, and product availability."
        actions={
          <Button onClick={() => { setShowForm(true); setEditingId(null) }}>
            <Plus size={17} />
            Add Product
          </Button>
        }
      />

      {showForm && (
        <SectionCard
          title={editingId ? 'Edit product' : 'Add new product'}
          description="Use concise names, clear categories, and accurate stock counts."
          actions={<Button variant="ghost" onClick={resetForm}><X size={17} /> Close</Button>}
          className="mb-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {['name', 'category', 'price', 'discount_price', 'quantity'].map(field => (
                <label key={field}>
                  <span className="ui-label capitalize">{field.replace('_', ' ')}</span>
                  <input
                    type={field === 'price' || field === 'discount_price' || field === 'quantity' ? 'number' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                    step={field === 'price' || field === 'discount_price' ? '0.01' : undefined}
                    required={field !== 'discount_price'}
                    className="ui-input"
                  />
                </label>
              ))}
              <label>
                <span className="ui-label">Supplier</span>
                <select name="supplier_id" value={formData.supplier_id} onChange={(e) => setFormData(prev => ({ ...prev, supplier_id: e.target.value }))} className="ui-input">
                  <option value="">No supplier</option>
                  {suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.company_name}</option>)}
                </select>
              </label>
            </div>
            <label>
              <span className="ui-label">Product Image</span>
              <div className="grid gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:grid-cols-[160px_1fr] sm:items-center">
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-white">
                  {imagePreview ? (
                    <img src={imagePreview.startsWith('/storage') ? `${(import.meta.env.VITE_API_URL || '').replace(/\/api$/, '') || 'http://127.0.0.1:8000'}${imagePreview}` : imagePreview} alt="Product preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="text-slate-400" size={34} />
                  )}
                </div>
                <div>
                  <input type="file" accept="image/jpeg,image/png,image/jpg,image/gif,image/webp" onChange={handleImageChange} className="ui-input bg-white" />
                  <p className="mt-2 text-xs font-semibold text-slate-500">Upload a clear product photo. JPG, PNG, GIF, or WebP up to 2MB.</p>
                </div>
              </div>
            </label>
            <label>
              <span className="ui-label">Description</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows="3"
                className="ui-input"
              />
            </label>
            <div className="flex gap-2">
              <Button type="submit"><PackagePlus size={17} /> Save Product</Button>
              <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </SectionCard>
      )}

      <DataTable columns={columns} rows={products} empty={<EmptyState title="No products yet" description="Add your first product to populate the storefront." />} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
