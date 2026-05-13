import MetricCard from '../components/MetricCard'
import ContactCard from '../components/ContactCard'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import BulkSelectBar from '../components/BulkSelectBar'
import ProspectPilot from '../components/ProspectPilot'

export default function Dashboard({
  contacts, stats, loading, page, setPage,
  total, handleFavorite, handleDelete, searchLoading,
  selectMode, toggleSelectMode, selectedIds, setContactSelected,
  selectAllOnPage, handleDeleteSelected, bulkDeleting,
  onWaOneTap, showToast, onOpenMessageStudio,
}) {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
        <MetricCard
          label="Total"
          value={stats.total}
          sub="na base"
        />
        <MetricCard
          label="Com telefone"
          value={stats.withPhone ?? 0}
          sub="prontos para WA"
          color="#7c3aed"
        />
        <MetricCard
          label="Celular"
          value={stats.withMobile ?? 0}
          sub="WhatsApp direto"
          color="#22c55e"
        />
        <MetricCard
          label="Favoritos"
          value={stats.favorites}
          sub="atalho na sidebar"
          color="#f59e0b"
        />
      </div>

      {searchLoading && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 mb-4 flex items-center gap-3">
          <svg className="animate-spin w-4 h-4 text-gray-900 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <div>
            <div className="text-[13px] font-medium">Buscando no Google Maps via Apify...</div>
            <div className="text-[11px] text-gray-400">Aguarde até 60 segundos</div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-3">
        <div className="flex items-center justify-between gap-2 sm:block">
          <div className="text-[13px] sm:text-[14px] font-semibold">
            Contatos
            <span className="ml-2 bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full">{total}</span>
          </div>
          <div className="text-[11px] text-gray-400 sm:hidden">
            {Math.ceil(total / 20) > 1 && `Pág ${page + 1}/${Math.ceil(total / 20)}`}
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
          {!loading && contacts.length > 0 && (
            <BulkSelectBar
              selectMode={selectMode}
              onToggleMode={toggleSelectMode}
              selectedCount={selectedIds.length}
              onSelectAllPage={selectAllOnPage}
              onDeleteSelected={handleDeleteSelected}
              pageItemCount={contacts.length}
              bulkDeleting={bulkDeleting}
            />
          )}
          <div className="text-[11px] text-gray-400 text-right hidden sm:block">
            {Math.ceil(total / 20) > 1 && `Pág ${page + 1}/${Math.ceil(total / 20)}`}
          </div>
        </div>
      </div>

      {!loading && !searchLoading && (
        <ProspectPilot
          showToast={showToast}
          onOpenMessageStudio={onOpenMessageStudio}
          refreshKey={`${stats.total}-${stats.withPhone}`}
        />
      )}

      {loading && !searchLoading ? (
        <div className="text-center py-12">
          <svg className="animate-spin w-7 h-7 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <div className="text-[12px] text-gray-400">Carregando...</div>
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Nenhum contato ainda"
          subtitle="Use a busca no topo para encontrar empresas por tipo e cidade"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {contacts.map(c => (
              <ContactCard
                key={c.id}
                contact={c}
                onFavorite={handleFavorite}
                onDelete={handleDelete}
                selectMode={selectMode}
                selected={selectedIds.includes(c.id)}
                onSelectedChange={setContactSelected}
                onWaOneTap={onWaOneTap}
                showToast={showToast}
                onOpenMessageStudio={onOpenMessageStudio}
              />
            ))}
          </div>
          <Pagination page={page} total={total} limit={20} onPage={setPage} />
        </>
      )}
    </div>
  )
}
