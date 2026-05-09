import { Link, useLocation } from 'react-router-dom'
import { Home, Package, ShoppingCart, User, Users, BarChart3, Truck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import BrandLogo from './BrandLogo'

export default function AppFooter({ cartCount = 0, onCartClick }) {
  const { user } = useAuth()
  const location = useLocation()
  const year = new Date().getFullYear()

  const navItems = {
    member: [
      { icon: Home, label: 'Home', path: '/member/dashboard' },
      { icon: Package, label: 'Products', path: '/member/products' },
      { icon: ShoppingCart, label: 'Orders', path: '/member/orders' },
      { icon: User, label: 'Profile', path: '/profile' },
    ],
    manager: [
      { icon: Home, label: 'Home', path: '/manager/dashboard' },
      { icon: Package, label: 'Products', path: '/manager/products' },
      { icon: ShoppingCart, label: 'Orders', path: '/manager/orders' },
      { icon: Truck, label: 'Supply', path: '/manager/suppliers' },
    ],
    admin: [
      { icon: Home, label: 'Home', path: '/admin/dashboard' },
      { icon: Users, label: 'Users', path: '/admin/users' },
      { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
      { icon: Truck, label: 'Supply', path: '/admin/suppliers' },
    ],
  }

  const items = navItems[user?.role] || navItems.member
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path)

  return (
    <>
      <footer className="hidden border-t border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 sm:block">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-12 w-36 items-center justify-center">
              <BrandLogo tone="light" className="h-full w-full" />
            </span>
            <div>
              <p className="font-black text-slate-950">Shemachoch</p>
              <p className="text-xs text-slate-500">Products, orders, inventory, and member service.</p>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500">© {year} Shemachoch. All rights reserved.</p>
        </div>
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-1.5 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur sm:hidden">
        <div className="grid grid-cols-4 gap-1">
          {items.slice(0, 4).map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center rounded-lg px-1 py-1.5 text-[10px] font-black ${
                  isActive(item.path) ? 'bg-slate-900 text-white' : 'text-slate-500'
                }`}
              >
                <Icon size={18} />
                <span className="mt-0.5">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
