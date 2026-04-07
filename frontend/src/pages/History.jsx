import EmptyState from '../components/EmptyState'

export default function History({ history, onDelete, onRerun, searchLoading }) {
  return (
    <div>
      <div className="text-[14px] font-semibold mb-4">Histórico de Pesquisas</div>

      {history.length === 0 ? (
        <EmptyState icon="📋" title="Nenhuma pesquisa ainda" subtitle="Suas buscas aparecem aqui" />
      ) : (
        <div className="flex flex-col gap-2">
          {history.map(h => (
            <div key={h.id} className="bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-3 hover:border-gray-300 transition">
              <div className="min-w-0">
                <div className="text-[13px] font-semibold truncate">
                  {h.type} <span className="text-gray-400 font-normal">em</span> {h.city}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5 flex flex-wrap gap-1.5 sm:gap-3">
                  <span>{h.result_count} resultados</span>
                  <span className="hidden sm:inline">·</span>
                  <span>Máx: {h.limit_count}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{new Date(h.searched_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <button
                  onClick={() => onRerun(h.type, h.city, h.limit_count)}
                  disabled={searchLoading}
                  className="bg-gray-900 text-white text-[11px] font-medium rounded-lg px-2.5 sm:px-3 py-1.5 hover:bg-[#e5272a] disabled:bg-gray-300 transition"
                >
                  ↩ Repetir
                </button>
                <button
                  onClick={() => onDelete(h.id)}
                  className="text-gray-300 hover:text-red-400 transition p-1"
                  title="Remover"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6 2h4v1H6zM3 4h10v1H3zm1 2h8l-.8 8H4.8zm2 2v4h1V8zm2 0v4h1V8z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

