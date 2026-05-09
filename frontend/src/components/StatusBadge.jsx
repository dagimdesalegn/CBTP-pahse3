import { useLanguage } from '../context/LanguageContext'

export default function StatusBadge({ status }) {
  const { statusLabel } = useLanguage()
  const statusStyles = {
    pending: 'bg-amber-100 text-amber-800 ring-amber-200',
    approved: 'bg-sky-100 text-sky-800 ring-sky-200',
    ready: 'bg-violet-100 text-violet-800 ring-violet-200',
    completed: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    cancelled: 'bg-red-100 text-red-800 ring-red-200',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[status] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
      {statusLabel(status) || status}
    </span>
  )
}
