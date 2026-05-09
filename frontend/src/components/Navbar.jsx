import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, LogOut, Bell, User, Home, Package, ShoppingCart, Users, BarChart3, Settings } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import NotificationsPanel from './NotificationsPanel'
import api from '../services/api'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const response = await api.get('/notifications/unread')
        setUnreadCount(response.data.unread_count || 0)
      } catch (err) {
        setUnreadCount(0)
      }
    }

    fetchUnread()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = {
    member: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Package, label: 'Products', path: '/member/products' },
      { icon: ShoppingCart, label: 'Orders', path: '/member/orders' },
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
    ],
  }

  const items = navItems[user?.role] || navItems.member
  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <nav className="bg-gradient-to-r from-white via-slate-50 to-blue-50 text-slate-900 shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            🏪 Coop Store
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setNotificationsOpen(true)}
              className="hover:bg-slate-200 px-2.5 py-2 rounded-full relative"
              aria-label="Open notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <Link to="/profile" className="hover:bg-slate-200 px-3 py-2 rounded-full flex items-center gap-2 text-sm font-semibold">
              <User size={16} />
              <span className="max-w-[140px] truncate">{user?.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="hover:bg-slate-200 px-3 py-2 rounded-full flex items-center gap-2 text-sm font-semibold"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={22} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <button
              onClick={() => setNotificationsOpen(true)}
              className="w-full text-left bg-white border border-slate-200 px-3 py-2 rounded-lg flex items-center justify-between text-sm font-semibold"
            >
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <Link to="/profile" className="block bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-semibold">
              {user?.name}
            </Link>
            <button onClick={handleLogout} className="w-full text-left bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-semibold">
              Logout
            </button>
          </div>
        )}
      </div>

      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => {
          setNotificationsOpen(false)
          setUnreadCount(0)
        }}
      />
    </nav>
  )
}
