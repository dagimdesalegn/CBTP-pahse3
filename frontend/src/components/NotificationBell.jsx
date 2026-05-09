import { Bell } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import api from '../services/api'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef()

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowDropdown(false)
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications')
      const list = response.data.data || []
      setNotifications(list)
      const unread = list.filter(n => !n.is_read).length
      setUnreadCount(unread)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const markAll = async () => {
    try {
      await api.put('/notifications/mark-all-read')
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 hover:bg-gray-100 rounded-lg transition-all ${unreadCount > 0 ? 'ring-2 ring-yellow-300 ring-offset-1' : ''}`}
        aria-label="Open notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="flex items-center gap-2">
              <Bell size={16} />
              <span className="font-semibold">Notifications</span>
            </div>
            <button onClick={() => { markAll(); setShowDropdown(false) }} className="text-xs text-blue-600 hover:underline">Mark all</button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-600">No notifications</div>
          ) : (
            <div className="divide-y">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => { markAsRead(notif.id); setShowDropdown(false) }}
                  className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3 ${notif.is_read ? 'bg-white' : 'bg-yellow-50'}`}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900">{notif.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 py-2 border-t text-right text-xs text-gray-500">Click an item to mark read</div>
        </div>
      )}
    </div>
  )
}
