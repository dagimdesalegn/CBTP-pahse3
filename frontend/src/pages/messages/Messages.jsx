import { useEffect, useState } from 'react'
import { Inbox, Send, Mail, CheckCircle } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import Toast from '../../components/Toast'
import { Button, EmptyState, PageHeader, SectionCard } from '../../components/ui'
import api from '../../services/api'

export default function Messages() {
  const [tab, setTab] = useState('inbox')
  const [messages, setMessages] = useState([])
  const [recipients, setRecipients] = useState([])
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({ recipient_id: '', subject: '', content: '' })

  useEffect(() => {
    fetchMessages()
  }, [tab])

  useEffect(() => {
    api.get('/message-recipients').then(res => setRecipients(res.data || [])).catch(() => {})
  }, [])

  const fetchMessages = async () => {
    try {
      const endpoint = tab === 'sent' ? '/messages/sent' : '/messages'
      const response = await api.get(endpoint)
      setMessages(response.data.data || [])
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load messages' })
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    try {
      await api.post('/messages', form)
      setForm({ recipient_id: '', subject: '', content: '' })
      setToast({ type: 'success', message: 'Message sent' })
      setTab('sent')
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to send message' })
    }
  }

  const markRead = async (message) => {
    if (tab !== 'inbox' || message.is_read) return
    await api.put(`/messages/${message.id}/read`)
    fetchMessages()
  }

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Communication"
        title="Messages"
        description="Send and receive internal support messages between members, managers, and admins."
      />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <SectionCard title="New message">
          <form onSubmit={sendMessage} className="space-y-3">
            <select required value={form.recipient_id} onChange={e => setForm({ ...form, recipient_id: e.target.value })} className="ui-input">
              <option value="">Select recipient</option>
              {recipients.map(user => <option key={user.id} value={user.id}>{user.name} ({user.role})</option>)}
            </select>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="ui-input" />
            <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write message..." className="ui-input min-h-36" />
            <Button type="submit" className="w-full"><Send size={16} /> Send</Button>
          </form>
        </SectionCard>

        <div className="space-y-4">
          <div className="flex gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <TabButton active={tab === 'inbox'} onClick={() => setTab('inbox')} icon={Inbox}>Inbox</TabButton>
            <TabButton active={tab === 'sent'} onClick={() => setTab('sent')} icon={Send}>Sent</TabButton>
          </div>

          {messages.length === 0 ? (
            <EmptyState title="No messages yet" description="Your internal conversation history will appear here." icon={Mail} />
          ) : (
            <div className="space-y-3">
              {messages.map(message => {
                const person = tab === 'sent' ? message.recipient : message.sender
                return (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => markRead(message)}
                    className={`w-full rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-amber-300 ${!message.is_read && tab === 'inbox' ? 'border-amber-300' : 'border-slate-200'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-950">{message.subject || 'No subject'}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{tab === 'sent' ? 'To' : 'From'} {person?.name || 'User'} • {new Date(message.created_at).toLocaleString()}</p>
                      </div>
                      {message.is_read && tab === 'inbox' && <CheckCircle className="text-emerald-600" size={18} />}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{message.content}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button onClick={onClick} className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold ${active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
      <Icon size={16} />
      {children}
    </button>
  )
}
