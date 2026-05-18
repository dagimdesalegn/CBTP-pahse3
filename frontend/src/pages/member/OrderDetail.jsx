import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import AppLayout from '../../components/AppLayout'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import { Button } from '../../components/ui'
import api from '../../services/api'
import { formatBirr } from '../../utils/currency'
import { displayMemberPhone } from '../../utils/memberDisplay'

const statusSteps = [
  { key: 'pending', label: 'Requested', description: 'Order received and waiting for review' },
  { key: 'approved', label: 'Approved', description: 'Order approved and queued for processing' },
  { key: 'ready', label: 'Ready', description: 'Packed and ready for pickup' },
  { key: 'completed', label: 'Completed', description: 'Collected by the member' },
]

export default function OrderDetail() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [returnVerified, setReturnVerified] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchOrder()
  }, [id])

  useEffect(() => {
    const txRef = searchParams.get('tx_ref') || searchParams.get('trx_ref')

    if (!txRef || returnVerified) {
      return
    }

    verifyReturnedPayment(txRef)
  }, [searchParams, returnVerified])

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`)
      setOrder(response.data)
      setPayment(response.data.payment || null)
    } catch (err) {
      console.error('Failed to fetch order:', err)
    } finally {
      setLoading(false)
    }
  }

  const orderItems = useMemo(() => {
    return order?.orderItems || order?.order_items || []
  }, [order])

  const orderDate = order ? new Date(order.created_at).toLocaleDateString() : ''
  const updatedDate = order ? new Date(order.updated_at).toLocaleDateString() : ''
  const currentStepIndex = Math.max(
    0,
    statusSteps.findIndex(step => step.key === order?.status)
  )
  const isPaymentPaid = payment?.status === 'success'

  const initializePayment = async () => {
    setPaying(true)
    try {
      const response = await api.post('/payments/initialize', { order_id: order.id })
      setPayment(response.data.payment)
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url
      } else {
        setToast({ type: 'warning', message: response.data.message || 'Payment started, but no checkout link was returned.' })
      }
    } catch (err) {
      setToast({ type: 'error', message: getPaymentErrorMessage(err) })
    } finally {
      setPaying(false)
    }
  }

  const verifyReturnedPayment = async (txRef) => {
    setReturnVerified(true)
    try {
      const response = await api.get(`/payments/verify/${encodeURIComponent(txRef)}`)
      setPayment(response.data.payment)
      setToast({
        type: response.data.payment?.status === 'success' ? 'success' : 'warning',
        message: response.data.payment?.status === 'success'
          ? 'Payment verified successfully'
          : `Payment status: ${response.data.payment?.status || 'pending'}`,
      })
      fetchOrder()
    } catch (err) {
      setToast({ type: 'error', message: getPaymentErrorMessage(err) || 'Unable to verify payment' })
    } finally {
      searchParams.delete('tx_ref')
      searchParams.delete('trx_ref')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const payWithWallet = async () => {
    setPaying(true)
    try {
      const response = await api.post('/wallet/pay-order', { order_id: order.id })
      setPayment(response.data.payment)
      setToast({ type: 'success', message: response.data.message || 'Order paid from wallet' })
      fetchOrder()
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Wallet payment failed' })
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
          <p className="text-gray-600">The order could not be loaded.</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout maxWidth="max-w-4xl">
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Order summary</p>
                  <h1 className="mt-2 text-3xl font-bold">Order #{order.id}</h1>
                  <p className="mt-2 text-slate-300">Placed on {orderDate}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
                  <StatusBadge status={order.status} />
                  <p className="mt-2 text-sm text-slate-300">Last updated {updatedDate}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <StatChip label="Items" value={orderItems.length} />
                <StatChip label="Total" value={formatBirr(order.total_price)} />
                <StatChip label="Status" value={capitalize(order.status)} />
                <StatChip label="Payment" value={capitalize(payment?.status || 'unpaid')} />
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="text-xl font-bold text-slate-900">Order Progress</h2>
                <p className="mt-1 text-sm text-slate-600">Track how your order moves from request to pickup.</p>
              </div>

              <div className="px-6 py-6">
                <div className="grid gap-4 md:grid-cols-4">
                  {statusSteps.map((step, index) => {
                    const isComplete = index < currentStepIndex || order.status === 'completed'
                    const isActive = step.key === order.status
                    const isCancelled = order.status === 'cancelled'

                    return (
                      <div key={step.key} className="relative rounded-xl border p-4">
                        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${isCancelled
                          ? 'bg-red-100 text-red-700'
                          : isComplete || isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {index + 1}
                        </div>
                        <h3 className="font-semibold text-slate-900">{step.label}</h3>
                        <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                        <div className={`mt-4 h-1 rounded-full ${isCancelled
                          ? 'bg-red-200'
                          : isComplete || isActive
                            ? 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`} />
                        {isActive && (
                          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">Current stage</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <h2 className="text-xl font-bold text-slate-900">Products Ordered</h2>
                </div>

                {orderItems.length === 0 ? (
                  <div className="px-6 py-10 text-center text-slate-600">
                    No products found for this order.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {orderItems.map(item => {
                      const lineTotal = Number(item.unit_price) * Number(item.quantity)
                      return (
                        <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-5">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{item.product?.name || 'Product'}</h3>
                            <p className="mt-1 text-sm text-slate-600">{item.product?.category || 'General'} · {item.quantity} unit{item.quantity > 1 ? 's' : ''}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-slate-900">{formatBirr(lineTotal)}</p>
                            <p className="text-sm text-slate-500">{formatBirr(item.unit_price)} each</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
                  <span className="text-lg font-semibold text-slate-900">Order Total</span>
                  <span className="text-2xl font-bold text-primary">{formatBirr(order.total_price)}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
                  <h3 className="text-lg font-bold text-slate-900">Member Information</h3>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-900">Name:</span> {order.user?.name}</p>
                    <p><span className="font-semibold text-slate-900">Phone:</span> {displayMemberPhone(order.user?.phone)}</p>
                    <p><span className="font-semibold text-slate-900">Verification:</span> {order.user?.is_verified ? 'Verified' : 'Pending verification'}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
                  <h3 className="text-lg font-bold text-slate-900">Fulfillment</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-900">Type:</span> {capitalize(order.fulfillment_type || 'pickup')}</p>
                    {order.delivery_address && <p><span className="font-semibold text-slate-900">Address:</span> {order.delivery_address}</p>}
                    <p>• Wait for the status to move to <span className="font-semibold text-slate-900">Ready</span> before collection or dispatch.</p>
                    <p>• You will receive the order from the store staff after confirmation.</p>
                    <p>• Keep this order number for reference: <span className="font-semibold text-slate-900">#{order.id}</span></p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
                  <h3 className="text-lg font-bold text-slate-900">Payment</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-900">Status:</span> {capitalize(payment?.status || 'unpaid')}</p>
                    <p><span className="font-semibold text-slate-900">Amount:</span> {formatBirr(payment?.amount || order.total_price)}</p>
                    {isPaymentPaid ? (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                        Payment completed
                      </div>
                    ) : payment?.checkout_url && ['initialized', 'pending'].includes(payment?.status) ? (
                      <Button as="a" href={payment.checkout_url} className="w-full">Continue Payment</Button>
                    ) : (
                      <div className="grid gap-2">
                        <Button onClick={initializePayment} disabled={paying} className="w-full">
                          {paying ? 'Starting Payment...' : 'Pay Now'}
                        </Button>
                        <Button variant="secondary" onClick={payWithWallet} disabled={paying} className="w-full">
                          Pay with wallet
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {order.notes && (
                  <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
                    <h3 className="text-lg font-bold text-slate-900">Notes</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}

function StatChip({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function capitalize(value) {
  if (!value) return '-'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getPaymentErrorMessage(err) {
  const data = err.response?.data
  const details = data?.details

  if (data?.error) return data.error
  if (data?.message) return data.message
  if (typeof details === 'string') return details
  if (details?.message) return details.message
  if (details?.error) return details.error
  if (details?.data?.message) return details.data.message

  return 'Payment could not be initialized'
}
