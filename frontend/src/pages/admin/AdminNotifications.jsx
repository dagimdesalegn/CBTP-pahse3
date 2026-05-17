import { useState } from 'react'
import { Bell, Send } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import Toast from '../../components/Toast'
import { Button, PageHeader, SectionCard } from '../../components/ui'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

export default function Notifications() {
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!title || !message) {
      setToast({ type: 'error', message: t('admin.fillAll') })
      return
    }
    setLoading(true)
    try {
      await api.post('/notifications/broadcast', { title, message })
      setToast({ type: 'success', message: t('admin.sentAll') })
      setTitle('')
      setMessage('')
    } catch (err) {
      setToast({ type: 'error', message: t('admin.sendFailed') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout maxWidth="max-w-3xl">
      <PageHeader
        eyebrow={t('admin.broadcasts')}
        title={t('admin.broadcastTitle')}
        description={t('admin.broadcastDesc')}
      />

      <SectionCard title={t('admin.messageComposer')} description={t('admin.messageComposerDesc')}>
        <form onSubmit={handleSend} className="space-y-5">
          <label>
            <span className="ui-label">{t('admin.notificationTitle')}</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('admin.notificationTitlePlaceholder')} className="ui-input" />
          </label>
          <label>
            <span className="ui-label">{t('admin.message')}</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('admin.messagePlaceholder')} rows="6" className="ui-input" />
          </label>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Bell size={17} /> : <Send size={17} />}
            {loading ? t('admin.sending') : t('admin.sendAll')}
          </Button>
        </form>
      </SectionCard>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
