import { readFileSync } from 'node:fs'

const safeRead = (path) => {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return ''
  }
}

const files = {
  auth: readFileSync(new URL('../src/context/AuthContext.jsx', import.meta.url), 'utf8'),
  api: readFileSync(new URL('../src/services/api.js', import.meta.url), 'utf8'),
  app: readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8'),
  cartContext: safeRead(new URL('../src/context/CartContext.jsx', import.meta.url)),
  dashboard: readFileSync(new URL('../src/pages/member/Dashboard.jsx', import.meta.url), 'utf8'),
  products: readFileSync(new URL('../src/pages/member/Products.jsx', import.meta.url), 'utf8'),
  detail: readFileSync(new URL('../src/pages/member/ProductDetail.jsx', import.meta.url), 'utf8'),
  toast: readFileSync(new URL('../src/components/Toast.jsx', import.meta.url), 'utf8'),
  drawer: readFileSync(new URL('../src/components/CartDrawer.jsx', import.meta.url), 'utf8'),
}

const expectations = [
  [files.auth, 'safeStoredUser', 'AuthContext should safely parse stored user JSON.'],
  [files.auth, 'auth:expired', 'AuthContext should handle global auth expiry events.'],
  [files.api, "window.dispatchEvent(new Event('auth:expired'))", 'API 401 handling should dispatch an event instead of forcing window.location.'],
  [files.app, 'const ROOT_PATHS = new Set', 'Telegram root paths should be a stable module-level constant.'],
  [files.app, '<CartProvider>', 'App should wrap routes in CartProvider.'],
  [files.cartContext, 'export function CartProvider', 'CartProvider should exist.'],
  [files.dashboard, 'useCart()', 'Dashboard should use shared cart state.'],
  [files.products, 'useCart()', 'Products should use shared cart state.'],
  [files.detail, 'useCart()', 'ProductDetail should use shared cart state.'],
  [files.toast, "role={type === 'error' ? 'alert' : 'status'}", 'Toast should announce messages to assistive tech.'],
  [files.toast, 'aria-label="Dismiss notification"', 'Toast close button should have an accessible name.'],
  [files.drawer, 'Escape', 'Cart drawer should close on Escape.'],
  [files.drawer, 'role="dialog"', 'Cart drawer should expose dialog semantics.'],
]

for (const [contents, needle, message] of expectations) {
  if (!contents.includes(needle)) {
    throw new Error(message)
  }
}

console.log('Frontend stability wiring is present.')
