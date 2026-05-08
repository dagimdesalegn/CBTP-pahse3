import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
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
      await api.put(`/inventory/${productId}`, {
        quantity: parseInt(quantity),
        reason: reason,
      })
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Inventory Management</h1>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-right">Current Stock</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{product.name}</td>
                      <td className="px-4 py-3 text-right">{product.quantity}</td>
                      <td className="px-4 py-3">
                        {product.quantity === 0 && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Out of Stock</span>
                        )}
                        {product.quantity > 0 && product.quantity <= 10 && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Low Stock</span>
                        )}
                        {product.quantity > 10 && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">In Stock</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingId === product.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              placeholder="New quantity"
                              className="px-2 py-1 border border-gray-300 rounded text-sm w-20"
                            />
                            <input
                              type="text"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder="Reason"
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              onClick={() => handleUpdateInventory(product.id)}
                              className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-gray-400 text-white px-2 py-1 rounded text-sm hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(product.id)
                              setQuantity(product.quantity.toString())
                              setReason('')
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                        )}
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
    </div>
  )
}
