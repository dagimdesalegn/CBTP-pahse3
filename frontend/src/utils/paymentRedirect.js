export function openCheckoutUrl(checkoutUrl) {
  const telegramWebApp = window.Telegram?.WebApp

  if (telegramWebApp?.openLink) {
    telegramWebApp.openLink(checkoutUrl, { try_instant_view: false })
    return 'telegram'
  }

  window.location.href = checkoutUrl
  return 'browser'
}
