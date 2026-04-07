export default function Pagination({ page, total, limit = 20, onPage }) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3 mt-5">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        className="border border-gray-200 rounded-lg px-4 py-2 text-[12px] font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        ← Anterior
      </button>
      <span className="text-[12px] text-gray-400">
        Página {page + 1} de {totalPages}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages - 1}
        className="border border-gray-200 rounded-lg px-4 py-2 text-[12px] font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Próxima →
      </button>
    </div>
  )
}
