import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Box, PackageSearch } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const variants = {
  primary: 'bg-amber-400 text-slate-950 hover:bg-amber-300 border-amber-400',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900',
  secondary: 'bg-white text-slate-800 hover:bg-slate-50 border-slate-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-red-600',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border-transparent',
}

export function Button({ as: Component = 'button', variant = 'primary', className = '', children, ...props }) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 sm:px-4 sm:py-2.5 sm:text-sm ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        {eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700 sm:text-xs sm:tracking-[0.18em]">{eyebrow}</p>}
        <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 line-clamp-2 max-w-3xl text-xs leading-5 text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ title, value, icon: Icon = BarChart3, tone = 'slate', hint }) {
  const tones = {
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    sky: 'bg-sky-50 text-sky-800 border-sky-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    violet: 'bg-violet-50 text-violet-800 border-violet-200',
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">{title}</p>
          <p className="mt-1.5 text-xl font-black tracking-tight text-slate-950 sm:mt-2 sm:text-2xl">{value ?? 0}</p>
          {hint && <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">{hint}</p>}
        </div>
        <div className={`rounded-lg border p-1.5 sm:p-2 ${tones[tone] || tones.slate}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

export function ActionCard({ title, description, to, icon: Icon = ArrowRight, tone = 'dark' }) {
  const tones = {
    dark: 'bg-slate-900 text-white hover:bg-slate-800',
    amber: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
    emerald: 'bg-emerald-600 text-white hover:bg-emerald-700',
    sky: 'bg-sky-600 text-white hover:bg-sky-700',
  }

  return (
    <Link to={to} className={`group rounded-lg p-5 shadow-sm transition ${tones[tone] || tones.dark}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="mt-2 text-sm opacity-80">{description}</p>
        </div>
        <Icon className="shrink-0 transition group-hover:translate-x-0.5" size={22} />
      </div>
    </Link>
  )
}

export function EmptyState({ title = 'Nothing here yet', description, icon: Icon = PackageSearch, action }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={24} />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function DataTable({ columns, rows, empty }) {
  if (!rows?.length) return empty || <EmptyState />

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="ui-table min-w-[760px]">
          <thead>
            <tr>{columns.map(column => <th key={column.key} className={column.className}>{column.header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id || index} className="hover:bg-amber-50/40">
                {columns.map(column => (
                  <td key={column.key} className={column.cellClassName}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SectionCard({ title, description, children, actions, className = '' }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div>
            {title && <h2 className="text-lg font-bold text-slate-950">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}

export function StockBadge({ quantity }) {
  const { t } = useLanguage()
  if (Number(quantity) === 0) {
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 sm:px-2.5 sm:py-1 sm:text-xs">{t('stock.out')}</span>
  }
  if (Number(quantity) <= 10) {
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 sm:px-2.5 sm:py-1 sm:text-xs">{t('stock.low')}</span>
  }
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 sm:px-2.5 sm:py-1 sm:text-xs">{t('stock.in')}</span>
}

export function ProductImage({ product, className = 'h-44' }) {
  const { productName } = useLanguage()
  const [imageFailed, setImageFailed] = useState(false)
  const apiBase = import.meta.env.VITE_API_URL || ''
  const publicBase = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase
  const imageSrc = product?.image_path?.startsWith('/storage')
    ? `${publicBase || 'http://127.0.0.1:8000'}${product.image_path}`
    : product?.image_path

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {imageSrc && !imageFailed ? (
        <img src={imageSrc} alt={productName(product)} onError={() => setImageFailed(true)} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-400">
          <Box size={46} />
        </div>
      )}
    </div>
  )
}
