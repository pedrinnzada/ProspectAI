import { useCallback, useEffect, useState } from 'react'
import { api } from '../utils/api'
import { buildProspectMessage } from '../utils/prospectMessages'
import { isMobile, whatsappUrl } from '../utils/phone'
import { clearWaRound, loadRoundExcludedIds, recordWaRoundId } from '../utils/waQueue'

/**
 * Fila de prospecção: próximo lead com telefone (celular primeiro, mais antigos primeiro).
 * Evita repetir o mesmo contato em sequência (histórico local da rodada).
 */
export default function ProspectPilot({ showToast, onOpenMessageStudio, refreshKey = 0 }) {
  const [loading, setLoading] = useState(true)
  const [contact, setContact] = useState(null)
  const [queueCount, setQueueCount] = useState(0)
  const [remaining, setRemaining] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const excludeIds = loadRoundExcludedIds()
      const data = await api.getNextInQueue(excludeIds)
      setContact(data.contact || null)
      setQueueCount(data.queueCount ?? 0)
      setRemaining(data.remainingAfterExclude ?? 0)
    } catch {
      setContact(null)
      setQueueCount(0)
      setRemaining(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const handleOpenNext = async () => {
    if (!contact?.phone) {
      showToast?.('Nenhum lead na fila com telefone')
      return
    }
    const text = buildProspectMessage(contact)
    if (!text) {
      showToast?.('Configure o modelo em «Mensagens»')
      onOpenMessageStudio?.()
      return
    }
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* ainda abrimos o WA */
    }
    const url = whatsappUrl(contact.phone, text)
    window.open(url, '_blank', 'noopener,noreferrer')
    recordWaRoundId(contact.id)
    showToast?.(`WhatsApp aberto · mensagem copiada · ${contact.name}`)
    load()
  }

  const handleClearRound = () => {
    clearWaRound()
    showToast?.('Rodada reiniciada — fila desde o início')
    load()
  }

  if (loading) {
    return (
      <div className="mb-4 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/90 to-fuchsia-50/80 px-4 py-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-violet-200/60 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-40 bg-violet-100 rounded animate-pulse" />
          <div className="h-2 w-24 bg-violet-100/70 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (queueCount === 0) {
    return (
      <div className="mb-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>✨</span>
          <div>
            <div className="text-[13px] font-semibold text-emerald-900">Sem leads com telefone</div>
            <div className="text-[11px] text-emerald-700/80">Faça uma busca no topo para trazer empresas do Maps.</div>
          </div>
        </div>
      </div>
    )
  }

  if (!contact && queueCount > 0 && remaining === 0) {
    return (
      <div className="mb-4 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50/95 to-orange-50/80 px-4 py-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0" aria-hidden>🔄</span>
            <div>
              <div className="text-[13px] font-semibold text-amber-950">Rodada completa</div>
              <div className="text-[11px] text-amber-900/80 mt-0.5">
                Nenhum lead novo na sequência: os que você já abriu no Piloto nesta rodada ficam de fora (só neste navegador). Recomece a fila ou use os cards abaixo.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearRound}
            className="flex-shrink-0 rounded-xl bg-gray-900 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-[#e5272a] transition"
          >
            Recomeçar fila
          </button>
        </div>
      </div>
    )
  }

  if (!contact) {
    return null
  }

  const mobile = isMobile(contact.phone)

  return (
    <div className="mb-4 rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/90 px-4 py-3 shadow-sm shadow-violet-500/5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-lg font-bold shadow-md">
            {(contact.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Fila de WhatsApp</span>
              <span className="text-[10px] text-gray-400">{queueCount} com telefone</span>
              {mobile ? (
                <span className="text-[9px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md">Celular</span>
              ) : (
                <span className="text-[9px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">Fixo</span>
              )}
            </div>
            <div className="text-[14px] font-semibold text-gray-900 truncate mt-0.5">{contact.name}</div>
            <div className="text-[11px] text-gray-500 truncate">{contact.phone}</div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
          <button
            type="button"
            onClick={handleOpenNext}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#e5272a] transition shadow-md"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.06L2 22l5.09-1.35A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.06 13.9c-.22.62-1.28 1.15-1.75 1.2-.47.05-.47.36-2.97-.72-2.5-1.08-4.03-3.68-4.15-3.85-.12-.17-.98-1.37-.98-2.62s.63-1.86.86-2.12c.23-.26.5-.32.67-.32.17 0 .34.01.48.01.16 0 .37-.06.58.48.22.54.74 1.87.81 2 .07.14.11.3.02.48-.09.17-.14.28-.28.44-.14.16-.29.35-.41.47-.14.14-.28.29-.12.56.16.27.7 1.2 1.5 1.94 1.03.95 1.9 1.24 2.17 1.38.27.14.43.12.59-.07.16-.2.68-.79.86-1.06.18-.27.36-.22.61-.13.25.09 1.59.79 1.86.94.27.14.45.22.52.34.07.12.07.68-.15 1.3z"/>
            </svg>
            Próximo · WA + copiar
          </button>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center justify-center rounded-xl border border-violet-200 bg-white px-3 py-2 text-[12px] font-medium text-violet-800 hover:bg-violet-50 transition"
          >
            Atualizar
          </button>
          <button
            type="button"
            onClick={handleClearRound}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition"
            title="Zera a rodada e volta a sugerir desde o primeiro lead"
          >
            Zerar rodada
          </button>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-gray-400 leading-relaxed">
        Celular entra antes que fixo · ordem do mais antigo ao mais novo na base. Cada clique registra o lead nesta rodada (apenas neste navegador) para não repetir em sequência.
      </p>
    </div>
  )
}
