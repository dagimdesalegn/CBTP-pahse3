import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import Toast from '../../components/Toast'
import api from '../../services/api'

export default function Notifications() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const handleSend = async (e) => {
    e.preventDefault()

    if (!title || !message) {
      setToast({ type: 'error', message: 'Please fill all fields' })
      return
    }

    setLoading(true)

    try {
      await api.post('/notifications/broadcast', {
        title,
        message,
      })

      setToast({
        type: 'success',
        message: 'Notification sent to all members!',
      })

      setTitle('')
      setMessage('')
    } catch (err) {
      setToast({
        type: 'error',
        message: 'Failed to send notification',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Broadcast Notification</h1>

            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSend} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., New Products Available"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
                >
                  {loading ? 'Sending...' : 'Send to All Members'}
                </button>
              </form>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li>This notification will be sent to all members</li>
                  <li>Members will receive it in their dashboard and Telegram (if linked)</li>
                  <li>Keep messages clear and concise</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
  )
}
