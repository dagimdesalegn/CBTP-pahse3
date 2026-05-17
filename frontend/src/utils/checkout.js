import api from '../services/api'

export async function createOrder({ cart, fulfillmentType, deliveryAddress }) {
  const orderResponse = await api.post('/orders', {
    items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
    fulfillment_type: fulfillmentType,
    delivery_address: fulfillmentType === 'delivery' ? deliveryAddress.trim() : null,
  })

  const order = orderResponse.data.order

  if (!order?.id) {
    throw new Error('Order was created but the order ID was not returned.')
  }

  return order
}

export async function checkoutWithPaymentMethod({ cart, fulfillmentType, deliveryAddress, paymentMethod }) {
  const order = await createOrder({ cart, fulfillmentType, deliveryAddress })

  if (paymentMethod === 'wallet') {
    const paymentResponse = await api.post('/wallet/pay-order', { order_id: order.id })
    return { order, payment: paymentResponse.data.payment, action: 'paid' }
  }

  if (paymentMethod === 'in_person') {
    const paymentResponse = await api.post('/payments/in-person', { order_id: order.id })
    return { order, payment: paymentResponse.data.payment, action: 'pending' }
  }

  const paymentResponse = await api.post('/payments/initialize', { order_id: order.id })
  const checkoutUrl = paymentResponse.data.checkout_url

  if (!checkoutUrl) {
    throw new Error(paymentResponse.data.message || 'Payment checkout link was not returned.')
  }

  return { order, checkoutUrl, action: 'redirect' }
}

export async function createOrderAndStartPayment(options) {
  return checkoutWithPaymentMethod({ ...options, paymentMethod: 'chapa' })
}

export function checkoutErrorMessage(error, fallback) {
  const data = error.response?.data
  const details = data?.details

  if (data?.error) return data.error
  if (data?.message) return data.message
  if (typeof details === 'string') return details
  if (details?.message) return details.message
  if (details?.error) return details.error
  if (details?.data?.message) return details.data.message
  if (error.message) return error.message

  return fallback
}
