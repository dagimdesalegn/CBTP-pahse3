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
        className={`relative rounded-lg p-2 text-white transition-all hover:bg-white/10 ${unreadCount > 0 ? 'ring-2 ring-amber-300 ring-offset-1 ring-offset-slate-900' : ''}`}
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
        <div className="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-lg border border-slate-200 bg-white text-slate-900 shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell size={16} />
              <span className="font-semibold">Notifications</span>
            </div>
            <button onClick={() => { markAll(); setShowDropdown(false) }} className="text-xs font-bold text-amber-700 hover:text-amber-800">Mark all</button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-600">No notifications</div>
          ) : (
            <div className="divide-y">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => { markAsRead(notif.id); setShowDropdown(false) }}
                  className={`flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-slate-50 ${notif.is_read ? 'bg-white' : 'bg-amber-50'}`}
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
