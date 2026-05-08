import { Link, useLocation } from 'react-router-dom'
import { Home, Package, ShoppingCart, Users, BarChart3, Settings } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname.startsWith(path)

  const navItems = {
    member: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Package, label: 'Products', path: '/member/products' },
      { icon: ShoppingCart, label: 'My Orders', path: '/member/orders' },
    ],
    manager: [
      { icon: Home, label: 'Dashboard', path: '/manager/dashboard' },
      { icon: Package, label: 'Products', path: '/manager/products' },
      { icon: ShoppingCart, label: 'Orders', path: '/manager/orders' },
      { icon: Settings, label: 'Inventory', path: '/manager/inventory' },
    ],
    admin: [
      { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: Users, label: 'Users', path: '/admin/users' },
      { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
      { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    ],
  }

  const items = navItems[user?.role] || navItems.member

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-200 border-r border-gray-300 h-screen sticky top-0">
      <div className="p-4 border-b border-gray-300">
        <h2 className="text-lg font-bold text-primary">Menu</h2>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {items.map((item, idx) => {
          const Icon = item.icon
          return (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 border-l-4 transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-100 border-primary text-primary'
                  : 'border-transparent text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
