import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, Bell, Home, LogOut, Mail, Menu, Package, Settings, ShoppingCart, Truck, User, Users, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import NotificationBell from './NotificationBell'
import BrandLogo from './BrandLogo'

export default function Navbar({ cartCount = 0, onCartClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = {
    member: [
      { icon: Home, label: 'Dashboard', path: '/member/dashboard' },
      { icon: Package, label: 'Products', path: '/member/products' },
      { icon: ShoppingCart, label: 'Orders', path: '/member/orders' },
      { icon: Mail, label: 'Messages', path: '/messages' },
    ],
    manager: [
      { icon: Home, label: 'Dashboard', path: '/manager/dashboard' },
      { icon: Package, label: 'Products', path: '/manager/products' },
      { icon: ShoppingCart, label: 'Orders', path: '/manager/orders' },
      { icon: Settings, label: 'Inventory', path: '/manager/inventory' },
      { icon: Truck, label: 'Suppliers', path: '/manager/suppliers' },
      { icon: Mail, label: 'Messages', path: '/messages' },
    ],
    admin: [
      { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: Users, label: 'Users', path: '/admin/users' },
      { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
      { icon: Truck, label: 'Suppliers', path: '/admin/suppliers' },
      { icon: Bell, label: 'Broadcasts', path: '/admin/notifications' },
      { icon: Mail, label: 'Messages', path: '/messages' },
    ],
  }

  const items = navItems[user?.role] || navItems.member
  const isActive = (path) => {
    if (path === '/member/dashboard') return location.pathname === path || location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-40 shadow-md">
      <div className="bg-navy text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/10">
            <span className="flex h-11 w-32 items-center justify-center sm:h-12 sm:w-36">
              <BrandLogo tone="dark" className="h-full w-full" />
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">{user?.role || 'Portal'}</p>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${
                  isActive(item.path)
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-100 hover:bg-white/10'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {user?.role === 'member' && onCartClick && (
              <button
                onClick={onCartClick}
                className="relative hidden items-center gap-2 rounded-lg bg-amber-400 px-3 py-2 text-sm font-black text-slate-950 hover:bg-amber-300 sm:flex"
              >
                <ShoppingCart size={17} />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-black text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            )}
            {user?.role === 'member' && onCartClick && (
              <button
                onClick={onCartClick}
                className="relative rounded-lg border border-amber-400 p-2 text-white transition hover:bg-white/10 sm:hidden"
                aria-label="Open cart"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-black text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            )}
            <NotificationBell />
            <Link to="/profile" className="hidden items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold text-white hover:bg-white/10 md:flex">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user?.name || 'Profile'} className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <User size={16} />
                </span>
              )}
              <span className="max-w-[140px] truncate">{user?.name}</span>
            </Link>
            <button onClick={handleLogout} className="hidden rounded-lg p-2 text-slate-200 hover:bg-white/10 hover:text-white md:block" aria-label="Logout">
              <LogOut size={20} />
            </button>
            <button className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden bg-navylight text-white lg:block">
        <div className="mx-auto flex h-10 max-w-7xl items-center gap-4 px-4 text-xs font-semibold sm:px-6 lg:px-8">
          <span className="text-amber-300">Professional Shemachoch commerce portal</span>
          <span className="text-slate-300">Orders, inventory, verification, and reports in one workspace</span>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-navylight p-4 text-white lg:hidden">
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-bold ${
                  isActive(item.path) ? 'bg-amber-400 text-slate-950' : 'bg-white/5 text-white'
                }`}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            ))}
            {user?.role === 'member' && onCartClick && (
              <button
                onClick={() => {
                  onCartClick()
                  setMenuOpen(false)
                }}
                className="flex items-center justify-between rounded-lg bg-amber-400 px-3 py-3 text-sm font-black text-slate-950 sm:col-span-2"
              >
                <span className="flex items-center gap-2"><ShoppingCart size={17} /> Cart</span>
                <span>{cartCount}</span>
              </button>
            )}
            <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-3 text-sm font-bold">
              <User size={17} />
              Profile
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-3 text-left text-sm font-bold">
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
