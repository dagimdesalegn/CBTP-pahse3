import { ShoppingCart, Heart } from 'lucide-react'

export default function ProductCard({ product, onAddToCart }) {
  const handleAddToCart = () => {
    onAddToCart(product)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-200">
        {product.image_path ? (
          <img src={product.image_path} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Package size={48} />
          </div>
        )}
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
        {product.quantity > 0 && product.quantity <= 10 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm">
            Low Stock
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-primary">${product.price}</span>
          <span className="text-sm text-gray-500">{product.quantity} in stock</span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.quantity === 0}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingCart size={18} />
          Add to Cart
        </button>
      </div>
    </div>
  )
}

import { Package } from 'lucide-react'
