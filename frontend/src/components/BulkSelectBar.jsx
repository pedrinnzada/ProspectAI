export default function BulkSelectBar({
  selectMode,
  onToggleMode,
  selectedCount,
  onSelectAllPage,
  onDeleteSelected,
  pageItemCount,
  bulkDeleting,
}) {
  const btnBase =
    'text-[11px] sm:text-[12px] font-medium rounded-lg px-2.5 sm:px-3 py-1.5 transition border'

  return (
    <div className="flex flex-wrap items-center gap-2 justify-end">
      <button
        type="button"
        onClick={onToggleMode}
        className={`${btnBase} border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
      >
        {selectMode ? 'Cancelar seleção' : 'Selecionar'}
      </button>
      {selectMode && (
        <>
          <button
            type="button"
            onClick={onSelectAllPage}
            disabled={pageItemCount === 0}
            className={`${btnBase} border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none`}
          >
            Todos desta página
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={selectedCount === 0 || bulkDeleting}
            className={`${btnBase} border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40 disabled:pointer-events-none`}
          >
            {bulkDeleting ? 'Apagando…' : `Apagar selecionados (${selectedCount})`}
          </button>
        </>
      )}
    </div>
  )
}
