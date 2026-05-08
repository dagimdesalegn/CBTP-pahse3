import { Send } from 'lucide-react'

export default function TelegramButton() {
  const handleOpenTelegram = () => {
    window.open('https://t.me/CooperativeStoreBot?start=' + (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : ''), '_blank')
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
