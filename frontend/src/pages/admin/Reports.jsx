import { useEffect, useState } from 'react'
import { Boxes, Save, ShoppingCart, Users } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Button, DataTable, EmptyState, PageHeader, SectionCard, StatCard } from '../../components/ui'
import { formatBirr } from '../../utils/currency'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

const tabs = [
  { key: 'inventory', labelKey: 'reports.inventory', icon: Boxes },
  { key: 'orders', labelKey: 'reports.orders', icon: ShoppingCart },
  { key: 'members', labelKey: 'reports.members', icon: Users },
]

export default function Reports() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('inventory')
  const [reportData, setReportData] = useState(null)
  const [storedReports, setStoredReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
    fetchStoredReports()
  }, [activeTab])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/reports/${activeTab}`)
      setReportData(response.data)
    } catch (err) {
      console.error('Failed to fetch report:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStoredReports = async () => {
    try {
      const response = await api.get('/reports/stored')
      setStoredReports(response.data.data || [])
    } catch (err) {
      console.error('Failed to fetch report history:', err)
    }
  }

  const saveReport = async () => {
    try {
      await api.post('/reports/stored', { type: activeTab })
      fetchStoredReports()
    } catch (err) {
      console.error('Failed to save report:', err)
    }
  }

  return (
    <AppLayout>
      <PageHeader
        eyebrow={t('reports.analytics')}
        title={t('reports.title')}
        description={t('reports.desc')}
        actions={<Button onClick={saveReport}><Save size={16} /> {t('reports.saveCurrent')}</Button>}
      />

      <div className="mb-4 flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-bold transition ${
                activeTab === tab.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              {t(tab.labelKey)}
            </button>
          )
        })}
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {activeTab === 'inventory' && <InventoryReport data={reportData} />}
          {activeTab === 'orders' && <OrdersReport data={reportData} />}
          {activeTab === 'members' && <MembersReport data={reportData} />}
          <ReportHistory reports={storedReports} />
        </>
      )}
    </AppLayout>
  )
}

function ReportHistory({ reports }) {
  const { t } = useLanguage()
  const columns = [
    { key: 'type', header: t('reports.type'), render: r => <span className="font-black capitalize text-slate-950">{r.type}</span> },
    { key: 'generator', header: t('reports.generatedBy'), render: r => r.generator?.name || t('admin.eyebrow') },
    { key: 'summary', header: t('reports.summary'), render: r => Object.entries(r.summary || {}).map(([key, value]) => `${key.replace('_', ' ')}: ${typeof value === 'number' ? value.toLocaleString() : value}`).join(' - ') },
    { key: 'created_at', header: t('reports.saved'), render: r => new Date(r.created_at).toLocaleString() },
  ]

  return (
    <div className="mt-6">
      <SectionCard title={t('reports.history')} description={t('reports.historyDesc')}>
        <DataTable columns={columns} rows={reports || []} empty={<EmptyState title={t('reports.noSaved')} description={t('reports.noSavedDesc')} />} />
      </SectionCard>
    </div>
  )
}

function InventoryReport({ data }) {
  const { t, productName, categoryLabel } = useLanguage()
  if (!data) return null
  const columns = [
    { key: 'name', header: t('common.product'), render: p => <p className="font-bold text-slate-950">{productName(p)}</p> },
    { key: 'category', header: t('common.category'), render: p => categoryLabel(p.category) },
    { key: 'price', header: t('common.price'), cellClassName: 'text-right', render: p => formatBirr(p.price) },
    { key: 'quantity', header: t('common.stock'), cellClassName: 'text-right font-bold' },
    { key: 'value', header: t('common.value'), cellClassName: 'text-right font-black text-slate-950', render: p => formatBirr(Number(p.price) * Number(p.quantity)) },
  ]
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard title={t('nav.products')} value={data.total_products} icon={Boxes} tone="sky" />
        <StatCard title={t('reports.stockValue')} value={formatBirr(data.total_stock_value)} icon={Boxes} tone="emerald" />
        <StatCard title={t('reports.lowStock')} value={data.low_stock_count} icon={Boxes} tone="amber" />
        <StatCard title={t('reports.outOfStock')} value={data.out_of_stock_count} icon={Boxes} tone="rose" />
      </div>
      <DataTable columns={columns} rows={data.products || []} empty={<EmptyState title={t('reports.noProducts')} />} />
    </div>
  )
}

function OrdersReport({ data }) {
  const { t, statusLabel } = useLanguage()
  if (!data) return null
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <StatCard title={t('nav.orders')} value={data.total_orders} icon={ShoppingCart} tone="sky" />
        <StatCard title={t('reports.revenue')} value={formatBirr(data.total_revenue)} icon={ShoppingCart} tone="emerald" />
        <StatCard title={t('reports.avgOrder')} value={formatBirr(data.avg_order_value)} icon={ShoppingCart} tone="amber" />
      </div>
      <SectionCard title={t('reports.ordersByStatus')}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(data.status_breakdown || {}).map(([status, count]) => (
            <div key={status} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold capitalize text-slate-600">{statusLabel(status)}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{count}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function MembersReport({ data }) {
  const { t } = useLanguage()
  if (!data) return null
  const columns = [
    { key: 'name', header: t('reports.name'), render: m => <p className="font-bold text-slate-950">{m.name}</p> },
    { key: 'phone', header: t('users.phone') },
    { key: 'orders_count', header: t('nav.orders'), cellClassName: 'text-center font-bold' },
    { key: 'total_orders_value', header: t('reports.totalSpent'), cellClassName: 'text-right font-black text-slate-950', render: m => formatBirr(m.total_orders_value) },
    { key: 'is_verified', header: t('inventory.status'), cellClassName: 'text-center', render: m => m.is_verified ? t('users.verified') : t('users.pending') },
  ]
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <StatCard title={t('reports.members')} value={data.total_members} icon={Users} tone="sky" />
        <StatCard title={t('users.verified')} value={data.verified_members} icon={Users} tone="emerald" />
        <StatCard title={t('users.pending')} value={data.unverified_members} icon={Users} tone="amber" />
      </div>
      <DataTable columns={columns} rows={(data.member_activity || []).slice(0, 10)} empty={<EmptyState title={t('reports.noMemberActivity')} />} />
    </div>
  )
}
