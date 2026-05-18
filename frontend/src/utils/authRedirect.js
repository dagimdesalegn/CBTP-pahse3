const CANONICAL_ORIGIN = 'https://shemachoch.tech'
const CANONICAL_HOSTS = new Set(['shemachoch.tech', 'www.shemachoch.tech'])
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

export function googleRedirectUrl() {
  const apiBase = import.meta.env.VITE_API_URL || ''

  if (apiBase) {
    const base = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase
    return `${base}/api/auth/google/redirect`
  }

  const { hostname, origin } = window.location
  const base = LOCAL_HOSTS.has(hostname) || CANONICAL_HOSTS.has(hostname)
    ? origin
    : CANONICAL_ORIGIN

  return `${base}/api/auth/google/redirect`
}
