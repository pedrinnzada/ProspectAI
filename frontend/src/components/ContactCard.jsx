import { isMobile, whatsappUrl } from '../utils/phone'
import { buildProspectMessage } from '../utils/prospectMessages'

const STATUS_COLORS = {
  closed: 'bg-green-500',
  refused: 'bg-red-500',
  pending: 'bg-yellow-500',
}

function Stars({ rating }) {
  if (!rating) return null
  const full = Math.round(rating)
  return (
    <span className="flex items-center gap-0.5 text-[10px]">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= full ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
      <span className="text-gray-400 ml-1">{Number(rating).toFixed(1)}</span>
    </span>
  )
}

export default function ContactCard({
  contact,
  onStatus,
  onFavorite,
  onDelete,
  selectMode = false,
  selected = false,
  onSelectedChange,
  onCopyPitch,
}) {
  const mobile = isMobile(contact.phone)
  const pitchText = buildProspectMessage(contact)
  const waUrl = contact.phone ? whatsappUrl(contact.phone, pitchText || undefined) : ''

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-3 hover:border-gray-300 transition group">
      {/* Top row: checkbox (modo seleção) + dot + name + badges + fav + delete */}
      <div className="flex items-start gap-2.5 mb-2">
        {selectMode && (
          <label className="flex-shrink-0 mt-1 cursor-pointer select-none" title="Selecionar">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelectedChange?.(contact.id, e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
            />
          </label>
        )}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${STATUS_COLORS[contact.status] || 'bg-yellow-400'}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-semibold leading-tight">{contact.name}</span>
            <button onClick={() => onFavorite(contact.id)} className="text-[13px] transition hover:scale-125 flex-shrink-0">
              {contact.favorite ? '⭐' : <span className="text-gray-300 hover:text-yellow-400">☆</span>}
            </button>
            {mobile && (
              <span className="bg-green-100 text-green-700 text-[9px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0">📱 Celular</span>
            )}
            {!mobile && contact.phone && (
              <span className="bg-gray-100 text-gray-500 text-[9px] px-1.5 py-0.5 rounded flex-shrink-0">☎ Fixo</span>
            )}
            {contact.price && (
              <span className="bg-gray-100 text-gray-500 text-[9px] px-1.5 py-0.5 rounded flex-shrink-0">{contact.price}</span>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-gray-500 mt-1">
            {contact.phone && (
              <span className="flex items-center gap-1">
                <PhoneIcon /> {contact.phone}
              </span>
            )}
            {contact.address && (
              <span className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-xs">
                <PinIcon /> {contact.address}
              </span>
            )}
            <Stars rating={contact.rating} />
            {contact.reviews > 0 && (
              <span className="text-gray-300 hidden sm:inline">({contact.reviews} av.)</span>
            )}
            {contact.website && (
              <a href={contact.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                🌐 Site
              </a>
            )}
            {contact.map_url && (
              <a href={contact.map_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600">
                📍 Maps
              </a>
            )}
          </div>
        </div>

        {/* Delete button (oculto no modo seleção para evitar confusão) */}
        {!selectMode && (
          <button
            onClick={() => onDelete(contact.id)}
            className="opacity-0 group-hover:opacity-100 transition text-gray-300 hover:text-red-400 flex-shrink-0 p-1"
            title="Remover"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 2h4v1H6zM3 4h10v1H3zm1 2h8l-.8 8H4.8zm2 2v4h1V8zm2 0v4h1V8z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Bottom row: status buttons + WhatsApp */}
      <div className="flex items-center gap-2 pl-4">
        {/* Status buttons */}
        <div className="flex gap-1.5 flex-shrink-0">
          {[
            { s: 'closed', label: '🟢', cls: contact.status === 'closed' ? 'bg-green-100 border-green-300' : '' },
            { s: 'refused', label: '🔴', cls: contact.status === 'refused' ? 'bg-red-100 border-red-300' : '' },
            { s: 'pending', label: '🟡', cls: contact.status === 'pending' ? 'bg-yellow-100 border-yellow-300' : '' },
          ].map(({ s, label, cls }) => (
            <button
              key={s}
              onClick={() => onStatus(contact.id, s)}
              className={`border border-gray-200 rounded-md w-8 h-8 text-[13px] hover:bg-gray-50 transition flex items-center justify-center ${cls}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Copiar mensagem + WhatsApp (texto pré-preenchido quando configurado) */}
        {contact.phone && (
          <div className="ml-auto flex flex-shrink-0 items-center gap-1.5">
            {onCopyPitch && (
              <button
                type="button"
                onClick={() => onCopyPitch(contact)}
                title={pitchText ? 'Copiar mensagem para colar' : 'Configure em Mensagens no topo'}
                className="text-[11px] font-medium rounded-lg px-2 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="opacity-70">
                  <path d="M4 1h8v2H4V1zM3 3h10v11H3V3zm2 2v7h6V5H5z"/>
                </svg>
                <span className="hidden sm:inline">Copiar</span>
              </button>
            )}
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              title={pitchText ? 'Abre WhatsApp com mensagem pronta' : 'WhatsApp'}
              className="bg-gray-900 text-white text-[11px] font-medium rounded-lg px-3 py-1.5 flex items-center gap-1.5 hover:bg-[#e5272a] transition"
            >
              <WAIcon />
              <span className="hidden xs:inline sm:inline">WhatsApp</span>
              <span className="xs:hidden">WA</span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function PhoneIcon() {
  return <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0"><path d="M3 1h3l1.5 4-2 1.5A9 9 0 0010 10l1.5-2L15 9.5V13a1 1 0 01-1 1C5 14 2 5 2 2a1 1 0 011-1z"/></svg>
}
function PinIcon() {
  return <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0"><path d="M8 1a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z"/></svg>
}
function WAIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.06L2 22l5.09-1.35A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.06 13.9c-.22.62-1.28 1.15-1.75 1.2-.47.05-.47.36-2.97-.72-2.5-1.08-4.03-3.68-4.15-3.85-.12-.17-.98-1.37-.98-2.62s.63-1.86.86-2.12c.23-.26.5-.32.67-.32.17 0 .34.01.48.01.16 0 .37-.06.58.48.22.54.74 1.87.81 2 .07.14.11.3.02.48-.09.17-.14.28-.28.44-.14.16-.29.35-.41.47-.14.14-.28.29-.12.56.16.27.7 1.2 1.5 1.94 1.03.95 1.9 1.24 2.17 1.38.27.14.43.12.59-.07.16-.2.68-.79.86-1.06.18-.27.36-.22.61-.13.25.09 1.59.79 1.86.94.27.14.45.22.52.34.07.12.07.68-.15 1.3z"/>
    </svg>
  )
}

