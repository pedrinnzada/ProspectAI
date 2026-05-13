export function isMobile(phone) {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  const local = digits.length > 9 ? digits.slice(-9) : digits;
  return local.startsWith('9') || local.startsWith('8');
}

export function whatsappNumber(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

export function whatsappUrl(phone, prefilledText) {
  const num = whatsappNumber(phone)
  const base = `https://wa.me/55${num}`
  if (!prefilledText || typeof prefilledText !== 'string') return base
  const t = prefilledText.trim()
  if (!t) return base
  const truncated = t.length > 1800 ? t.slice(0, 1800) + '…' : t
  return `${base}?text=${encodeURIComponent(truncated)}`
}
