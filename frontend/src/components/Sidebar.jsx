export default function Sidebar({ view, setView, stats, onClose }) {
  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: GridIcon },
    { id: 'contacts', label: 'Todos os Contatos', icon: UsersIcon },
    { id: 'favorites', label: 'Favoritos', icon: StarIcon, badge: stats.favorites },
    { id: 'history', label: 'Histórico', icon: ClockIcon },
  ]

  return (
    <div className="w-56 h-full bg-[#0a0a0a] flex flex-col flex-shrink-0">
      {/* Logo + close button */}
      <div className="px-5 py-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <div className="text-white font-bold text-lg tracking-tight">
            Prospec<span className="text-[#e5272a]">tAI</span>
          </div>
          <div className="text-[10px] text-white/20 uppercase tracking-widest mt-1">Impulso Web</div>
        </div>
        {/* Close button — only visible on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden text-white/30 hover:text-white/70 transition p-1"
          aria-label="Fechar menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {nav.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`w-full flex items-center gap-3 px-5 py-2.5 text-[12px] font-medium transition-all border-l-2 ${
              view === id
                ? 'text-white border-[#e5272a] bg-white/5'
                : 'text-white/30 border-transparent hover:text-white/60 hover:bg-white/5'
            }`}
          >
            <Icon />
            <span>{label}</span>
            {badge > 0 && (
              <span className="ml-auto bg-[#e5272a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5">
        <div className="text-[9px] text-white/20 uppercase tracking-widest mb-1">Integração</div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 animate-pulse"></span>
          <span className="text-[10px] text-white/30">Apify conectado</span>
        </div>
        <div className="text-[9px] text-white/15 mt-1">Google Maps Scraper</div>
      </div>
    </div>
  )
}

function GridIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z"/></svg>
}
function UsersIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 100-6 3 3 0 000 6zm-5 6a5 5 0 0110 0H3z"/></svg>
}
function StarIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.9 3.9L14 5.6l-3 2.9.7 4.1L8 10.5 4.3 12.6l.7-4.1L2 5.6l4.1-.7z"/></svg>
}
function ClockIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 5h2v4H7zm0 5h2v1H7z"/></svg>
}

