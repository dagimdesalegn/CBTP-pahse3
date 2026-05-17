import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => {
      const price = Number(item.product.effective_price ?? item.product.discount_price ?? item.product.price)
      return sum + (price * item.quantity)
    }, 0),
    [cart]
  )

  const removeFromCart = (productId) => {
    setCart(current => current.filter(item => item.product_id !== productId))
  }

  const updateCartQuantity = (productId, quantity) => {
    setCart(current => current.map(item => item.product_id === productId ? { ...item, quantity } : item))
  }

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, setCart, cartTotal, removeFromCart, updateCartQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
