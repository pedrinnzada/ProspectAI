import { isMobile, whatsappUrl } from '../utils/phone'
import { buildProspectMessage } from '../utils/prospectMessages'

function Stars({ rating }) {
  if (!rating) return null
  const full = Math.round(rating)
  return (
    <span className="flex items-center gap-0.5 text-[9px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= full ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
      <span className="text-gray-400 ml-0.5">{Number(rating).toFixed(1)}</span>
    </span>
  )
}

export default function ContactCard({
  contact,
  onFavorite,
  onDelete,
  selectMode = false,
  selected = false,
  onSelectedChange,
  onWaOneTap,
  onOpenMessageStudio,
  showToast,
}) {
  const mobile = isMobile(contact.phone)
  const pitchText = buildProspectMessage(contact)
  const waUrl = contact.phone ? whatsappUrl(contact.phone, pitchText || undefined) : ''

  const handleWaOneTap = async () => {
    if (!contact.phone) return
    if (!pitchText) {
      showToast?.('Configure o modelo em «Mensagens» no topo')
      onOpenMessageStudio?.()
      return
    }
    try {
      await navigator.clipboard.writeText(pitchText)
    } catch {
      showToast?.('Não foi possível copiar — abrindo WhatsApp mesmo assim')
    }
    onWaOneTap?.(contact)
    window.open(waUrl, '_blank', 'noopener,noreferrer')
    showToast?.('WhatsApp aberto · texto copiado')
  }

  return (
    <div
      className={`
        relative bg-white border rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200
        flex flex-col aspect-square min-h-0 min-w-0 overflow-hidden group
        ${selected ? 'ring-2 ring-violet-500 border-violet-300' : 'border-gray-200 hover:border-gray-300'}
      `}
    >
      {selectMode && (
        <label className="absolute top-2.5 left-2.5 z-10 cursor-pointer select-none" title="Selecionar">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelectedChange?.(contact.id, e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
        </label>
      )}

      {!selectMode && (
        <button
          type="button"
          onClick={() => onDelete(contact.id)}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition"
          title="Remover"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 2h4v1H6zM3 4h10v1H3zm1 2h8l-.8 8H4.8zm2 2v4h1V8zm2 0v4h1V8z" />
          </svg>
        </button>
      )}

      <div className={`flex gap-2.5 flex-shrink-0 ${selectMode ? 'pl-7' : ''} pr-8`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1">
            <h3 className="text-[13px] sm:text-[14px] font-semibold text-gray-900 leading-tight line-clamp-2 flex-1 min-w-0">
              {contact.name}
            </h3>
            <button
              type="button"
              onClick={() => onFavorite(contact.id)}
              className="flex-shrink-0 text-[15px] transition hover:scale-110 mt-0.5"
              title={contact.favorite ? 'Favorito' : 'Favoritar'}
            >
              {contact.favorite ? '⭐' : <span className="text-gray-300 hover:text-yellow-400">☆</span>}
            </button>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {mobile && (
              <span className="bg-green-100 text-green-700 text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded">Celular</span>
            )}
            {!mobile && contact.phone && (
              <span className="bg-gray-100 text-gray-500 text-[8px] font-semibold px-1.5 py-0.5 rounded">Fixo</span>
            )}
            {contact.price && (
              <span className="bg-gray-100 text-gray-600 text-[8px] px-1.5 py-0.5 rounded truncate max-w-[100%]">{contact.price}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-1.5 mt-3 text-[10px] sm:text-[11px] text-gray-500">
        {contact.phone && (
          <span className="flex items-center gap-1 text-gray-700 font-medium truncate">
            <PhoneIcon /> <span className="truncate">{contact.phone}</span>
          </span>
        )}
        {contact.address && (
          <span className="flex items-start gap-1 line-clamp-2 leading-snug">
            <PinIcon /> <span className="min-w-0">{contact.address}</span>
          </span>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-auto pt-1">
          <Stars rating={contact.rating} />
          {contact.reviews > 0 && (
            <span className="text-gray-400">({contact.reviews})</span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          {contact.website && (
            <a href={contact.website} target="_blank" rel="noreferrer" className="text-violet-600 hover:underline font-medium">
              Site
            </a>
          )}
          {contact.map_url && (
            <a href={contact.map_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600">
              Maps
            </a>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 pt-2 mt-2 border-t border-gray-100 space-y-2">
        {contact.phone ? (
          <button
            type="button"
            onClick={handleWaOneTap}
            className="w-full bg-gray-900 text-white text-[11px] sm:text-[12px] font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-[#e5272a] transition shadow-sm"
          >
            <WAIcon />
            WhatsApp + copiar mensagem
          </button>
        ) : (
          <div className="text-[10px] text-center text-gray-400 py-2">Sem telefone</div>
        )}
      </div>
    </div>
  )
}

function PhoneIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0 opacity-60">
      <path d="M3 1h3l1.5 4-2 1.5A9 9 0 0010 10l1.5-2L15 9.5V13a1 1 0 01-1 1C5 14 2 5 2 2a1 1 0 011-1z" />
    </svg>
  )
}
function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0 opacity-60 mt-0.5">
      <path d="M8 1a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  )
}
function WAIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.06L2 22l5.09-1.35A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.06 13.9c-.22.62-1.28 1.15-1.75 1.2-.47.05-.47.36-2.97-.72-2.5-1.08-4.03-3.68-4.15-3.85-.12-.17-.98-1.37-.98-2.62s.63-1.86.86-2.12c.23-.26.5-.32.67-.32.17 0 .34.01.48.01.16 0 .37-.06.58.48.22.54.74 1.87.81 2 .07.14.11.3.02.48-.09.17-.14.28-.28.44-.14.16-.29.35-.41.47-.14.14-.28.29-.12.56.16.27.7 1.2 1.5 1.94 1.03.95 1.9 1.24 2.17 1.38.27.14.43.12.59-.07.16-.2.68-.79.86-1.06.18-.27.36-.22.61-.13.25.09 1.59.79 1.86.94.27.14.45.22.52.34.07.12.07.68-.15 1.3z" />
    </svg>
  )
}
