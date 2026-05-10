export function resolveStorageUrl(imagePath, apiBase = import.meta.env.VITE_API_URL || '') {
  if (!imagePath?.startsWith('/storage')) return imagePath
  if (!apiBase || apiBase === '/api' || apiBase.includes('127.0.0.1') || apiBase.includes('localhost')) return imagePath

  const publicBase = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase
  return `${publicBase}${imagePath}`
}
