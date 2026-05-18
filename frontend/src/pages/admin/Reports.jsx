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
  const [movementData, setMovementData] = useState(null)
  const [storedReports, setStoredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [inventoryFilters, setInventoryFilters] = useState({
    kebele: '',
    category: '',
    supplier_id: '',
    stock_status: '',
  })

  useEffect(() => {
    fetchReport()
  }, [activeTab, inventoryFilters])

  useEffect(() => {
    fetchStoredReports()
  }, [activeTab])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = activeTab === 'inventory' ? queryString(inventoryFilters) : ''
      const response = await api.get(`/reports/${activeTab}${params}`)
      setReportData(response.data)

      if (activeTab === 'inventory') {
        const movementParams = queryString({
          kebele: inventoryFilters.kebele,
        })
        const movementResponse = await api.get(`/inventory/logs${movementParams}`)
        setMovementData(movementResponse.data)
      } else {
        setMovementData(null)
      }
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
          {activeTab === 'inventory' && (
            <InventoryReport
              data={reportData}
              movementData={movementData}
              inventoryFilters={inventoryFilters}
              onFilterChange={setInventoryFilters}
            />
          )}
          {activeTab === 'orders' && <OrdersReport data={reportData} />}
          {activeTab === 'members' && <MembersReport data={reportData} />}
          <ReportHistory reports={storedReports} />
        </>
      )}
    </AppLayout>
  )
}

function queryString(values) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      params.append(key, value)
    }
  })

  const query = params.toString()
  return query ? `?${query}` : ''
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

function InventoryReport({ data, movementData, inventoryFilters, onFilterChange }) {
  const { t, productName, categoryLabel } = useLanguage()
  if (!data) return null
  const updateFilter = (key, value) => onFilterChange(prev => ({ ...prev, [key]: value }))
  const columns = [
    { key: 'name', header: t('common.product'), render: p => <p className="font-bold text-slate-950">{productName(p)}</p> },
    { key: 'kebele', header: 'Kebele', render: p => p.kebele || 'Not assigned' },
    { key: 'category', header: t('common.category'), render: p => categoryLabel(p.category) },
    { key: 'supplier', header: 'Supplier', render: p => p.supplier?.company_name || '-' },
    { key: 'price', header: t('common.price'), cellClassName: 'text-right', render: p => formatBirr(p.price) },
    { key: 'quantity', header: t('common.stock'), cellClassName: 'text-right font-bold' },
    { key: 'value', header: t('common.value'), cellClassName: 'text-right font-black text-slate-950', render: p => formatBirr(Number(p.price) * Number(p.quantity)) },
  ]
  const movementColumns = [
    { key: 'product', header: t('common.product'), render: log => <p className="font-bold text-slate-950">{productName(log.product)}</p> },
    { key: 'kebele', header: 'Kebele', render: log => log.product?.kebele || 'Not assigned' },
    { key: 'type', header: 'Movement', render: log => <span className="font-semibold capitalize">{String(log.type || 'adjustment').replaceAll('_', ' ')}</span> },
    { key: 'change_amount', header: 'Change', cellClassName: 'text-right font-black', render: log => Number(log.change_amount) > 0 ? `+${log.change_amount}` : log.change_amount },
    { key: 'quantity', header: 'Before / After', render: log => `${log.previous_quantity ?? '-'} -> ${log.new_quantity ?? '-'}` },
    { key: 'reason', header: 'Reason', render: log => log.reason || '-' },
    { key: 'manager', header: 'Actor', render: log => log.manager?.name || '-' },
    { key: 'created_at', header: 'Date', render: log => new Date(log.created_at).toLocaleString() },
  ]

  return (
    <div className="space-y-6">
      <SectionCard title="ERP stock filters" description="Filter inventory by Kebele, category, supplier, or stock condition.">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={inventoryFilters.kebele}
            onChange={event => updateFilter('kebele', event.target.value)}
            placeholder="Kebele"
            className="ui-input"
          />
          <input
            value={inventoryFilters.category}
            onChange={event => updateFilter('category', event.target.value)}
            placeholder="Category"
            className="ui-input"
          />
          <input
            type="number"
            value={inventoryFilters.supplier_id}
            onChange={event => updateFilter('supplier_id', event.target.value)}
            placeholder="Supplier ID"
            className="ui-input"
          />
          <select
            value={inventoryFilters.stock_status}
            onChange={event => updateFilter('stock_status', event.target.value)}
            className="ui-input"
          >
            <option value="">All stock</option>
            <option value="in_stock">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
      </SectionCard>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard title={t('nav.products')} value={data.total_products} icon={Boxes} tone="sky" />
        <StatCard title={t('reports.stockValue')} value={formatBirr(data.total_stock_value)} icon={Boxes} tone="emerald" />
        <StatCard title={t('reports.lowStock')} value={data.low_stock_count} icon={Boxes} tone="amber" />
        <StatCard title={t('reports.outOfStock')} value={data.out_of_stock_count} icon={Boxes} tone="rose" />
      </div>

      <SummaryGrid title="Stock by Kebele" rows={data.kebele_summary || []} />
      <SummaryGrid title="Stock by category" rows={data.category_summary || []} />
      <SummaryGrid title="Stock by supplier" rows={data.supplier_summary || []} />

      <DataTable columns={columns} rows={data.products || []} empty={<EmptyState title={t('reports.noProducts')} />} />

      <SectionCard title="Inventory movement history" description="Audit trail for stock receipts, corrections, order sales, and cancellation restores.">
        <DataTable columns={movementColumns} rows={movementData?.data || []} empty={<EmptyState title="No stock movements found" />} />
      </SectionCard>
    </div>
  )
}

function SummaryGrid({ title, rows }) {
  if (!rows?.length) return null

  return (
    <SectionCard title={title}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(row => (
          <div key={row.key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">{row.label || row.key}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
              <p>Products: <span className="text-slate-950">{row.product_count}</span></p>
              <p>Units: <span className="text-slate-950">{row.stock_units}</span></p>
              <p>Low: <span className="text-amber-700">{row.low_stock_count}</span></p>
              <p>Out: <span className="text-red-700">{row.out_of_stock_count}</span></p>
            </div>
            <p className="mt-3 text-lg font-black text-slate-950">{formatBirr(row.stock_value || 0)}</p>
          </div>
        ))}
      </div>
    </SectionCard>
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
