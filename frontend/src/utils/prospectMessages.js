const KEY_TEMPLATES = 'prospectai_templates_v1'
const KEY_SETTINGS = 'prospectai_message_settings_v1'

const DEFAULT_TEMPLATES = [
  {
    id: 't_whatsapp_curto',
    name: 'WhatsApp curto',
    body:
      'Oi {{primeiro_nome}}, tudo bem? Aqui é o {{eu}}.\n\nVi o {{nome}} em {{cidade}} no Maps e queria te apresentar algo que pode ajudar. Posso te mandar uma linha?',
  },
  {
    id: 't_followup',
    name: 'Retorno leve',
    body:
      'Oi {{primeiro_nome}}! Te chamei sobre {{categoria}} — ainda faz sentido um papo rápido de 2 minutos?',
  },
]

const DEFAULT_SETTINGS = {
  senderName: '',
  company: '',
  defaultTemplateId: 't_whatsapp_curto',
}

export const PLACEHOLDER_HELP = [
  { tag: '{{nome}}', desc: 'Nome do estabelecimento' },
  { tag: '{{primeiro_nome}}', desc: 'Primeiro nome / palavra' },
  { tag: '{{cidade}}', desc: 'Cidade do contato' },
  { tag: '{{categoria}}', desc: 'Categoria ou segmento' },
  { tag: '{{telefone}}', desc: 'Telefone' },
  { tag: '{{eu}}', desc: 'Seu nome (aba Dados)' },
  { tag: '{{empresa}}', desc: 'Sua empresa (aba Dados)' },
]

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json)
    return v ?? fallback
  } catch {
    return fallback
  }
}

export function loadTemplates() {
  if (typeof localStorage === 'undefined') return [...DEFAULT_TEMPLATES]
  const raw = localStorage.getItem(KEY_TEMPLATES)
  if (!raw) return [...DEFAULT_TEMPLATES]
  const parsed = safeParse(raw, null)
  if (!Array.isArray(parsed) || parsed.length === 0) return [...DEFAULT_TEMPLATES]
  return parsed.map((t, i) => ({
    id: String(t.id || `t_${i}`),
    name: String(t.name || `Modelo ${i + 1}`),
    body: String(t.body || ''),
  }))
}

export function saveTemplates(templates) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(KEY_TEMPLATES, JSON.stringify(templates))
}

export function loadSettings() {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS }
  const raw = localStorage.getItem(KEY_SETTINGS)
  const parsed = safeParse(raw, {})
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    senderName: String(parsed.senderName ?? ''),
    company: String(parsed.company ?? ''),
    defaultTemplateId: String(parsed.defaultTemplateId ?? DEFAULT_SETTINGS.defaultTemplateId),
  }
}

export function saveSettings(settings) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(KEY_SETTINGS, JSON.stringify({ ...loadSettings(), ...settings }))
}

export function firstTokenName(name) {
  if (!name || typeof name !== 'string') return 'aí'
  const t = name.trim().split(/\s+/)[0] || 'aí'
  return t.replace(/^[^a-zA-ZÀ-ÿ0-9]+/, '') || 'aí'
}

function categoryLabel(contact) {
  if (contact.category && String(contact.category).trim()) return String(contact.category).trim()
  if (contact.search_query && String(contact.search_query).trim()) return String(contact.search_query).trim()
  return 'o negócio de vocês'
}

function cityLabel(contact) {
  if (contact.city && String(contact.city).trim()) return String(contact.city).trim()
  return 'a região'
}

export function renderTemplateBody(body, contact, settings) {
  const nome = (contact.name && String(contact.name).trim()) || 'time'
  const eu = (settings.senderName && String(settings.senderName).trim()) || 'eu'
  const empresa = (settings.company && String(settings.company).trim()) || ''
  const map = {
    '{{nome}}': nome,
    '{{primeiro_nome}}': firstTokenName(contact.name),
    '{{cidade}}': cityLabel(contact),
    '{{categoria}}': categoryLabel(contact),
    '{{telefone}}': (contact.phone && String(contact.phone).trim()) || '',
    '{{eu}}': eu,
    '{{empresa}}': empresa,
  }
  let out = String(body || '')
  for (const [key, val] of Object.entries(map)) {
    out = out.split(key).join(val)
  }
  return out.replace(/\{\{[^}]+\}\}/g, '')
}

export function getDefaultTemplate() {
  const settings = loadSettings()
  const templates = loadTemplates()
  const byId = templates.find((t) => t.id === settings.defaultTemplateId)
  return byId || templates[0] || null
}

/** Texto pronto para colar / enviar no WA; vazio se não houver modelo com corpo. */
export function buildProspectMessage(contact) {
  const t = getDefaultTemplate()
  if (!t || !String(t.body).trim()) return ''
  return renderTemplateBody(t.body, contact, loadSettings()).trim()
}
