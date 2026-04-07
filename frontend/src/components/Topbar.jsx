import { useState } from 'react'

export default function Topbar({ onSearch, searchLoading, filter, setFilter, setPage, onMenuClick }) {
  const [type, setType] = useState('')
  const [city, setCity] = useState('')
  const [limit, setLimit] = useState(20)
  const [searchOpen, setSearchOpen] = useState(false)

  const handleSearch = () => {
    if (!type.trim() || !city.trim()) return
    setPage(0)
    onSearch(type.trim(), city.trim(), limit)
    setSearchOpen(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="relative bg-white border-b border-gray-200 flex-shrink-0">
      {/* Main topbar row */}
      <div className="px-3 sm:px-5 h-14 flex items-center gap-2">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
          aria-label="Abrir menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>

        {/* Desktop search fields — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 flex-1">
          <input
            value={type}
            onChange={e => setType(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Tipo (ex: pizzaria)"
            className="border border-gray-200 rounded-lg px-3 h-9 text-[12px] outline-none bg-gray-50 focus:border-gray-900 focus:bg-white transition w-36 lg:w-40"
          />
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Cidade"
            className="border border-gray-200 rounded-lg px-3 h-9 text-[12px] outline-none bg-gray-50 focus:border-gray-900 focus:bg-white transition w-36 lg:w-48"
          />
          <input
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            type="number" min={1} max={100}
            className="border border-gray-200 rounded-lg px-3 h-9 text-[12px] outline-none bg-gray-50 focus:border-gray-900 focus:bg-white transition w-16 lg:w-20"
            placeholder="Qtd"
          />
          <button
            onClick={handleSearch}
            disabled={searchLoading || !type || !city}
            className="bg-gray-900 text-white text-[12px] font-medium rounded-lg px-4 h-9 flex items-center gap-1.5 hover:bg-[#e5272a] disabled:bg-gray-300 disabled:cursor-not-allowed transition whitespace-nowrap"
          >
            {searchLoading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <span className="hidden lg:inline">Buscando...</span>
              </span>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M10.5 9.5l3.5 3.5-1 1-3.5-3.5a5.5 5.5 0 111-1zm-5 .5a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
                Buscar
              </>
            )}
          </button>

          <div className="hidden lg:block w-px h-6 bg-gray-200 mx-1" />

          <select
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(0) }}
            className="hidden lg:block border border-gray-200 rounded-lg px-2 h-9 text-[11px] outline-none bg-white cursor-pointer"
          >
            <option value="all">Todos</option>
            <option value="pending">🟡 Pendentes</option>
            <option value="closed">🟢 Fechados</option>
            <option value="refused">🔴 Recusados</option>
          </select>
        </div>

        {/* Mobile: logo in center */}
        <div className="sm:hidden flex-1 text-center font-bold text-[15px]">
          Prospec<span className="text-[#e5272a]">tAI</span>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(o => !o)}
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
            aria-label="Buscar"
          >
            {searchLoading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.5 9.5l3.5 3.5-1 1-3.5-3.5a5.5 5.5 0 111-1zm-5 .5a4 4 0 100-8 4 4 0 000 8z"/>
              </svg>
            )}
          </button>

          {/* Apify badge */}
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-2 sm:px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
            <span className="text-[10px] text-green-700 font-medium hidden sm:inline">Apify Live</span>
            <span className="text-[10px] text-green-700 font-medium sm:hidden">Live</span>
          </div>
        </div>
      </div>

      {/* Mobile expandable search panel */}
      {searchOpen && (
        <div className="sm:hidden border-t border-gray-100 px-3 py-3 bg-white flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={type}
              onChange={e => setType(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Tipo (ex: pizzaria)"
              className="border border-gray-200 rounded-lg px-3 h-10 text-[13px] outline-none bg-gray-50 focus:border-gray-900 focus:bg-white transition flex-1"
              autoFocus
            />
            <input
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              type="number" min={1} max={100}
              className="border border-gray-200 rounded-lg px-3 h-10 text-[13px] outline-none bg-gray-50 focus:border-gray-900 focus:bg-white transition w-20"
              placeholder="Qtd"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Cidade (ex: Sete Lagoas)"
              className="border border-gray-200 rounded-lg px-3 h-10 text-[13px] outline-none bg-gray-50 focus:border-gray-900 focus:bg-white transition flex-1"
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading || !type || !city}
              className="bg-gray-900 text-white text-[13px] font-medium rounded-lg px-4 h-10 flex items-center gap-1.5 hover:bg-[#e5272a] disabled:bg-gray-300 disabled:cursor-not-allowed transition whitespace-nowrap"
            >
              {searchLoading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M10.5 9.5l3.5 3.5-1 1-3.5-3.5a5.5 5.5 0 111-1zm-5 .5a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
              )}
              Buscar
            </button>
          </div>
          <select
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(0) }}
            className="border border-gray-200 rounded-lg px-3 h-10 text-[13px] outline-none bg-white cursor-pointer w-full"
          >
            <option value="all">Todos os status</option>
            <option value="pending">🟡 Pendentes</option>
            <option value="closed">🟢 Fechados</option>
            <option value="refused">🔴 Recusados</option>
          </select>
        </div>
      )}

      {/* Progress bar while searching */}
      {searchLoading && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100">
          <div className="h-full bg-[#e5272a] animate-pulse w-3/4" />
        </div>
      )}
    </div>
  )
}

