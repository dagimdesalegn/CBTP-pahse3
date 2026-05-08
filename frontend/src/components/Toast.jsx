import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Toast({ type = 'info', message, duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!visible) return null

  const styles = {
    success: 'bg-green-100 border-green-300 text-green-800',
    error: 'bg-red-100 border-red-300 text-red-800',
    warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    info: 'bg-blue-100 border-blue-300 text-blue-800',
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  }

  const Icon = icons[type]

  return (
    <div className={`fixed top-4 right-4 max-w-md border rounded-lg p-4 ${styles[type]} flex items-gap-3 shadow-lg z-50`}>
      <Icon size={20} className="flex-shrink-0" />
      <p className="flex-1 ml-3">{message}</p>
      <button onClick={() => setVisible(false)} className="ml-2">
        <X size={18} />
      </button>
    </div>
  )
}
