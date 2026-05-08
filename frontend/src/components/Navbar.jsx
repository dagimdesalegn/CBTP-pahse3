import { Link, useNavigate } from 'react-router-dom'
import { Menu, LogOut, Bell, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

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
            <Link to="/notifications" className="hover:bg-blue-700 px-3 py-2 rounded-md">
              <Bell size={20} />
            </Link>
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
            <Link to="/notifications" className="block hover:bg-blue-700 px-3 py-2 rounded-md">
              Notifications
            </Link>
            <Link to="/profile" className="block hover:bg-blue-700 px-3 py-2 rounded-md">
              {user?.name}
            </Link>
            <button onClick={handleLogout} className="w-full text-left hover:bg-blue-700 px-3 py-2 rounded-md">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
