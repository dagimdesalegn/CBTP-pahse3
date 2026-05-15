import { useEffect, useState } from 'react'

export function useTelegram() {
  const [webApp, setWebApp] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const app = window.Telegram.WebApp
      app.ready()

      setWebApp(app)
      setUser(app.initDataUnsafe?.user)

      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [])

  const showMainButton = (text, callback) => {
    if (webApp?.MainButton) {
      webApp.MainButton.text = text
      webApp.MainButton.onClick(callback)
      webApp.MainButton.show()
    }
  }

  const hideMainButton = () => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide()
    }
  }

  const showBackButton = (callback) => {
    if (webApp?.BackButton) {
      webApp.BackButton.onClick(callback)
      webApp.BackButton.show()
    }
  }

  const hideBackButton = () => {
    if (webApp?.BackButton) {
      webApp.BackButton.hide()
    }
  }

  const showAlert = (text) => {
    webApp?.showAlert(text)
  }

  const showConfirm = (text, callback) => {
    webApp?.showConfirm(text, callback)
  }

  const showPopup = (params) => {
    webApp?.showPopup(params)
  }

  const close = () => {
    webApp?.close()
  }

  const setHeaderColor = (color) => {
    if (webApp?.setHeaderColor) {
      webApp.setHeaderColor(color)
    }
  }

  const openLink = (url) => {
    webApp?.openLink(url)
  }

  return {
    webApp,
    user,
    isLoading,
    isTelegramApp: !!webApp,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    showAlert,
    showConfirm,
    showPopup,
    close,
    setHeaderColor,
    openLink,
  }
}
