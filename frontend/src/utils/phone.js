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

export function whatsappUrl(phone) {
  const num = whatsappNumber(phone);
  return `https://wa.me/55${num}`;
}
