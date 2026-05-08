import { Link, useNavigate } from 'react-router-dom'
import { Menu, LogOut, Bell, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import NotificationsPanel from './NotificationsPanel'
import api from '../services/api'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            🏪 Coop Store
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setNotificationsOpen(true)}
              className="hover:bg-blue-700 px-3 py-2 rounded-md relative"
              aria-label="Open notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <Link to="/profile" className="hover:bg-blue-700 px-3 py-2 rounded-md flex items-center gap-2">
              <User size={20} />
              <span>{user?.name}</span>
            </Link>
            <button onClick={handleLogout} className="hover:bg-blue-700 px-3 py-2 rounded-md flex items-center gap-2">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={24} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <button
              onClick={() => setNotificationsOpen(true)}
              className="w-full text-left hover:bg-blue-700 px-3 py-2 rounded-md flex items-center justify-between"
            >
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <Link to="/profile" className="block hover:bg-blue-700 px-3 py-2 rounded-md">
              {user?.name}
            </Link>
            <button onClick={handleLogout} className="w-full text-left hover:bg-blue-700 px-3 py-2 rounded-md">
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
