export function displayMemberPhone(phone) {
  const cleaned = String(phone || '').trim()

  return cleaned || '*'
}
