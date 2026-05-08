import { useEffect, useState } from 'react'
import api from '../../services/api'
import Toast from './Toast'

export default function NotificationsPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await api.get('/notifications')
      setNotifications(response.data.data || [])
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load notifications' })
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread')
      setUnreadCount(response.data.unread_count || 0)
    } catch (err) {
      console.error('Failed to fetch unread count')
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      fetchNotifications()
      fetchUnreadCount()
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to mark as read' })
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read')
      fetchNotifications()
      fetchUnreadCount()
      setToast({ type: 'success', message: 'All notifications marked as read' })
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to mark all as read' })
    }
  }

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      fetchNotifications()
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete notification' })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-md h-screen bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 border-b-4 border-blue-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">🔔 Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-blue-100 text-sm mt-1">{unreadCount} unread</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-2xl hover:text-blue-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {notifications.length > 0 && unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-blue-100 hover:text-white transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin text-blue-600 text-2xl">⚙️</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">📭</p>
              <p className="text-gray-600 font-medium">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 transition-all ${
                    !notification.read_at
                      ? 'bg-blue-50 border-blue-500 border-l-4'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <h3 className={`font-bold ${!notification.read_at ? 'text-blue-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm mt-1 ${!notification.read_at ? 'text-blue-700' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      {!notification.read_at && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors p-1"
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors p-1"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
