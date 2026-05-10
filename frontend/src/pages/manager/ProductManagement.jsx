import { useEffect, useState } from 'react'
import { Edit2, ImagePlus, PackagePlus, Plus, Trash2, X } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import { Button, DataTable, EmptyState, PageHeader, SectionCard, StockBadge } from '../../components/ui'
import { formatBirr } from '../../utils/currency'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../hooks/useAuth'

export default function ProductManagement() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [formData, setFormData] = useState({ name: '', name_am: '', name_or: '', description: '', description_am: '', description_or: '', price: '', discount_price: '', quantity: '', category: '', kebele: '', supplier_id: '', image: null })
  const [imagePreview, setImagePreview] = useState('')
  const { t, productName, productDescription, categoryLabel } = useLanguage()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

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
      setToast({ type: 'error', message: t('manager.fetchFailed') })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', name_am: '', name_or: '', description: '', description_am: '', description_or: '', price: '', discount_price: '', quantity: '', category: '', kebele: '', supplier_id: '', image: null })
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
        setToast({ type: 'success', message: t('manager.updated') })
      } else {
        await api.post('/products', payload)
        setToast({ type: 'success', message: t('manager.created') })
      }
      fetchProducts()
      resetForm()
    } catch (err) {
      const validationErrors = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : null
      setToast({ type: 'error', message: validationErrors || err.response?.data?.message || err.response?.data?.error || t('manager.saveFailed') })
    }
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name || '',
      name_am: product.name_am || '',
      name_or: product.name_or || '',
      description: product.description || '',
      description_am: product.description_am || '',
      description_or: product.description_or || '',
      price: product.price || '',
      discount_price: product.discount_price || '',
      quantity: product.quantity || '',
      category: product.category || '',
      kebele: product.kebele || '',
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
    if (confirm(t('manager.deleteConfirm'))) {
      try {
        await api.delete(`/products/${id}`)
        setToast({ type: 'success', message: t('manager.deleted') })
        fetchProducts()
      } catch (err) {
        setToast({ type: 'error', message: t('manager.deleteFailed') })
      }
    }
  }

  if (loading) return <LoadingSpinner />

  const columns = [
    { key: 'name', header: t('common.product'), render: p => <div><p className="font-bold text-slate-950">{productName(p)}</p><p className="line-clamp-1 text-xs text-slate-500">{productDescription(p)}</p></div> },
    { key: 'category', header: 'Category', render: p => <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{categoryLabel(p.category)}</span> },
    { key: 'kebele', header: 'Kebele', render: p => <span className="font-semibold text-slate-700">{p.kebele || 'Not assigned'}</span> },
    { key: 'supplier', header: t('manager.supplier'), render: p => p.supplier?.company_name || '-' },
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
        eyebrow={t('manager.catalog')}
        title={t('manager.productManagement')}
        description={t('manager.productManagementDesc')}
        actions={
          <Button onClick={() => { setShowForm(true); setEditingId(null) }}>
            <Plus size={17} />
            {t('manager.addProduct')}
          </Button>
        }
      />

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
        {isAdmin
          ? 'Admin view: products can be managed across Kebeles.'
          : `Assigned Kebele: ${user?.manager_kebele || 'Not assigned. Ask an admin to assign your Kebele before adding products.'}`}
      </div>

      {showForm && (
        <SectionCard
          title={editingId ? t('manager.editProduct') : t('manager.addNewProduct')}
          description={t('manager.productFormDesc')}
          actions={<Button variant="ghost" onClick={resetForm}><X size={17} /> {t('common.close')}</Button>}
          className="mb-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {['name', 'name_am', 'name_or', 'category', 'price', 'discount_price', 'quantity'].map(field => (
                <label key={field}>
                  <span className="ui-label capitalize">{field === 'name_am' ? t('manager.nameAm') : field === 'name_or' ? t('manager.nameOr') : field.replace('_', ' ')}</span>
                  <input
                    type={field === 'price' || field === 'discount_price' || field === 'quantity' ? 'number' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                    step={field === 'price' || field === 'discount_price' ? '0.01' : undefined}
                    required={!['discount_price', 'name_am', 'name_or'].includes(field)}
                    className="ui-input"
                  />
                </label>
              ))}
              <label>
                <span className="ui-label">{t('manager.supplier')}</span>
                <select name="supplier_id" value={formData.supplier_id} onChange={(e) => setFormData(prev => ({ ...prev, supplier_id: e.target.value }))} className="ui-input">
                  <option value="">{t('manager.noSupplier')}</option>
                  {suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.company_name}</option>)}
                </select>
              </label>
              {isAdmin && (
                <label>
                  <span className="ui-label">Kebele</span>
                  <input
                    name="kebele"
                    value={formData.kebele}
                    onChange={(e) => setFormData(prev => ({ ...prev, kebele: e.target.value }))}
                    placeholder="Bosa Addis Kebele"
                    className="ui-input"
                  />
                </label>
              )}
            </div>
            <label>
              <span className="ui-label">{t('manager.productImage')}</span>
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
                  <p className="mt-2 text-xs font-semibold text-slate-500">{t('manager.imageHint')}</p>
                </div>
              </div>
            </label>
            <label>
              <span className="ui-label">{t('manager.descriptionLabel')}</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows="3"
                className="ui-input"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="ui-label">{t('manager.descAm')}</span>
                <textarea
                  name="description_am"
                  value={formData.description_am}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_am: e.target.value }))}
                  rows="3"
                  className="ui-input"
                />
              </label>
              <label>
                <span className="ui-label">{t('manager.descOr')}</span>
                <textarea
                  name="description_or"
                  value={formData.description_or}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_or: e.target.value }))}
                  rows="3"
                  className="ui-input"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit"><PackagePlus size={17} /> {t('manager.saveProduct')}</Button>
              <Button type="button" variant="secondary" onClick={resetForm}>{t('common.cancel')}</Button>
            </div>
          </form>
        </SectionCard>
      )}

      <DataTable columns={columns} rows={products} empty={<EmptyState title={t('manager.noProducts')} description={t('manager.noProductsDesc')} />} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
