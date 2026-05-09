import { Globe2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function LanguageSwitcher({ className = '', compact = false }) {
  const { language, setLanguage, languages, t } = useLanguage()

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{t('common.language')}</span>
      <Globe2 className="pointer-events-none absolute left-2.5 text-slate-400" size={16} />
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className={`h-10 rounded-lg border border-slate-300 bg-white py-0 pl-8 pr-8 text-xs font-black text-slate-800 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 ${compact ? 'w-[86px]' : 'w-36'} `}
        aria-label={t('common.language')}
      >
        {languages.map(item => (
          <option key={item.code} value={item.code}>{compact ? item.shortLabel : item.label}</option>
        ))}
      </select>
    </label>
  )
}
