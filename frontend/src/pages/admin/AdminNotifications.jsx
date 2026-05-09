import { useState } from 'react'
import { Bell, Send } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import Toast from '../../components/Toast'
import { Button, PageHeader, SectionCard } from '../../components/ui'
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
      await api.post('/notifications/broadcast', { title, message })
      setToast({ type: 'success', message: 'Notification sent to all members!' })
      setTitle('')
      setMessage('')
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to send notification' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout maxWidth="max-w-3xl">
      <PageHeader
        eyebrow="Broadcasts"
        title="Broadcast Notification"
        description="Send concise operational updates to every member dashboard and linked Telegram account."
      />

      <SectionCard title="Message composer" description="Keep member-facing messages short, specific, and action oriented.">
        <form onSubmit={handleSend} className="space-y-5">
          <label>
            <span className="ui-label">Notification Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fresh teff and oil stock available" className="ui-input" />
          </label>
          <label>
            <span className="ui-label">Message</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Dear members, new stock is ready for pickup at the cooperative store." rows="6" className="ui-input" />
          </label>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Bell size={17} /> : <Send size={17} />}
            {loading ? 'Sending...' : 'Send to All Members'}
          </Button>
        </form>
      </SectionCard>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
