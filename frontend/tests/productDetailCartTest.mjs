import { readFileSync } from 'node:fs'

const detail = readFileSync(new URL('../src/pages/member/ProductDetail.jsx', import.meta.url), 'utf8')

const expectations = [
  ['import CartDrawer', 'Product detail should import CartDrawer.'],
  ['const [cart, setCart]', 'Product detail should keep cart state.'],
  ['const [showCartModal, setShowCartModal]', 'Product detail should control cart drawer visibility.'],
  ['const handleAddToCart =', 'Product detail should add product to cart instead of ordering immediately.'],
  ['<AppLayout cartCount={cart.length} onCartClick={() => setShowCartModal(true)}>', 'Product detail should show the top cart button.'],
  ['<CartDrawer', 'Product detail should render CartDrawer.'],
  ['items: cart.map', 'Product detail checkout should submit cart items.'],
  ["t('products.addToCart')", 'Product detail button should say Add to Cart.'],
]

for (const [needle, message] of expectations) {
  if (!detail.includes(needle)) {
    throw new Error(message)
  }
}

console.log('Product detail cart wiring is present.')
