import { Send } from 'lucide-react'

export default function TelegramButton() {
  const handleOpenTelegram = () => {
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'shemachoch_bot'
    const user = localStorage.getItem('user')
    const startParam = user ? JSON.parse(user).id : ''

    window.open(`https://t.me/${botUsername}?start=${startParam}`, '_blank')
  }

  return (
    <button
      onClick={handleOpenTelegram}
      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
    >
      <Send size={18} />
      Open in Telegram
    </button>
  )
}
