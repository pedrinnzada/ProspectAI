import { useEffect, useState } from 'react'
import {
  loadTemplates,
  saveTemplates,
  loadSettings,
  saveSettings,
  renderTemplateBody,
  PLACEHOLDER_HELP,
} from '../utils/prospectMessages'

const SAMPLE = {
  name: 'Pizzaria do João',
  phone: '(31) 99999-8888',
  city: 'Belo Horizonte',
  category: 'Pizzaria',
  search_query: 'pizzaria',
}

export default function MessageStudio({ open, onClose }) {
  const [tab, setTab] = useState('templates')
  const [templates, setTemplates] = useState([])
  const [settings, setSettings] = useState({ senderName: '', company: '', defaultTemplateId: '' })
  const [draftId, setDraftId] = useState(null)

  useEffect(() => {
    if (!open) return
    const t = loadTemplates()
    const s = loadSettings()
    setTemplates(t)
    setSettings(s)
    setDraftId(s.defaultTemplateId || t[0]?.id || null)
    setTab('templates')
  }, [open])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const active = templates.find((x) => x.id === draftId) || templates[0]
  const preview = active
    ? renderTemplateBody(active.body, SAMPLE, settings)
    : ''

  const persistTemplates = (next) => {
    setTemplates(next)
    saveTemplates(next)
  }

  const persistSettings = (patch) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveSettings(next)
  }

  const updateTemplateBody = (id, body) => {
    persistTemplates(templates.map((t) => (t.id === id ? { ...t, body } : t)))
  }

  const updateTemplateName = (id, name) => {
    persistTemplates(templates.map((t) => (t.id === id ? { ...t, name } : t)))
  }

  const addTemplate = () => {
    const id = `t_${Date.now()}`
    persistTemplates([...templates, { id, name: 'Novo modelo', body: 'Oi {{primeiro_nome}}, aqui é o {{eu}}...' }])
    setDraftId(id)
    persistSettings({ defaultTemplateId: id })
  }

  const removeTemplate = (id) => {
    if (templates.length <= 1) return
    const next = templates.filter((t) => t.id !== id)
    persistTemplates(next)
    if (draftId === id) setDraftId(next[0].id)
    if (settings.defaultTemplateId === id) persistSettings({ defaultTemplateId: next[0].id })
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        aria-label="Fechar"
        onClick={onClose}
      />
      <aside className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col overflow-hidden">
        <style>{`
          @keyframes messageStudioIn {
            from { transform: translateX(100%); opacity: 0.92; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>
        <div
          className="flex flex-col h-full overflow-hidden"
          style={{ animation: 'messageStudioIn 0.26s cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
          <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-2 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div>
              <div className="text-[15px] font-semibold tracking-tight">Mensagens</div>
              <div className="text-[11px] text-white/70 mt-0.5 leading-snug">
                Um clique: WhatsApp já abre com o texto. Ou copie antes de enviar.
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition text-white/90"
              aria-label="Fechar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex border-b border-gray-100 px-2 pt-2 gap-1">
            {[
              { id: 'templates', label: 'Modelos' },
              { id: 'data', label: 'Dados' },
            ].map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setTab(x.id)}
                className={`px-3 py-2 text-[12px] font-medium rounded-t-lg transition ${
                  tab === x.id
                    ? 'bg-gray-50 text-gray-900 border border-b-0 border-gray-200 -mb-px'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {tab === 'data' && (
              <div className="space-y-3">
                <label className="block">
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Como você se apresenta</span>
                  <input
                    value={settings.senderName}
                    onChange={(e) => persistSettings({ senderName: e.target.value })}
                    placeholder="Ex: Maria da Silva"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Usado em {'{{eu}}'}</span>
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Empresa ou serviço (opcional)</span>
                  <input
                    value={settings.company}
                    onChange={(e) => persistSettings({ company: e.target.value })}
                    placeholder="Ex: Agência XYZ / sistema de delivery"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Usado em {'{{empresa}}'}</span>
                </label>
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5 text-[11px] text-amber-900 leading-relaxed">
                  Dica: preencha seu nome uma vez; todos os modelos passam a soar pessoais na hora do disparo.
                </div>
              </div>
            )}

            {tab === 'templates' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {templates.map((t) => (
                    <div key={t.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setDraftId(t.id)
                          persistSettings({ defaultTemplateId: t.id })
                        }}
                        className={`text-[11px] font-medium rounded-full px-2.5 py-1 border transition ${
                          (draftId || settings.defaultTemplateId) === t.id
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {t.name || 'Modelo'}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTemplate}
                    className="text-[11px] font-medium rounded-full px-2.5 py-1 border border-dashed border-gray-300 text-gray-500 hover:border-gray-900 hover:text-gray-900 transition"
                  >
                    + Novo
                  </button>
                </div>

                {active && (
                  <>
                    <label className="block">
                      <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Nome do modelo</span>
                      <input
                        value={active.name}
                        onChange={(e) => updateTemplateName(active.id, e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-gray-900"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Texto (use variáveis abaixo)</span>
                      <textarea
                        value={active.body}
                        onChange={(e) => updateTemplateBody(active.id, e.target.value)}
                        rows={8}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-gray-900 font-mono leading-relaxed resize-y min-h-[140px]"
                      />
                    </label>
                    {templates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTemplate(active.id)}
                        className="text-[11px] text-red-600 hover:underline"
                      >
                        Remover este modelo
                      </button>
                    )}
                  </>
                )}

                <div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Variáveis</div>
                  <ul className="space-y-1.5 text-[11px] text-gray-600">
                    {PLACEHOLDER_HELP.map((p) => (
                      <li key={p.tag} className="flex gap-2">
                        <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 flex-shrink-0">{p.tag}</code>
                        <span>{p.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Prévia (exemplo)</div>
                  <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5 text-[12px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {preview || '—'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-500 text-center">
            Salvo automaticamente neste navegador · modelo em destaque = usado no WhatsApp e em Copiar
          </div>
        </div>
      </aside>
    </div>
  )
}
