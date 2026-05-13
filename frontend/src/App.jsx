import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import Favorites from './pages/Favorites'
import History from './pages/History'
import Toast from './components/Toast'
import MessageStudio from './components/MessageStudio'
import { api } from './utils/api'
import { recordWaRoundId } from './utils/waQueue'

export default function App() {
  const [view, setView] = useState('dashboard')
  const [contacts, setContacts] = useState([])
  const [stats, setStats] = useState({ total: 0, favorites: 0, withPhone: 0, withMobile: 0 })
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [phoneType, setPhoneType] = useState('all')
  const [websiteFilter, setWebsiteFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [lastSearch, setLastSearch] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [messageStudioOpen, setMessageStudioOpen] = useState(false)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const loadContacts = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const data = await api.getContacts({
        page: params.page ?? page,
        limit: 20,
        phoneType: params.phoneType ?? phoneType,
        websiteFilter: params.websiteFilter ?? websiteFilter,
        favorite: view === 'favorites' ? 'true' : undefined,
        ...params,
      })
      setContacts(data.contacts)
      setStats(data.stats)
      setTotal(data.total)
    } catch (e) {
      showToast('❌ Erro ao carregar contatos: ' + e.message)
    }
    setLoading(false)
  }, [page, phoneType, websiteFilter, view])

  const loadHistory = async () => {
    const data = await api.getHistory()
    setHistory(data.history)
  }

  useEffect(() => {
    loadContacts()
    loadHistory()
  }, [view, phoneType, websiteFilter, page])

  useEffect(() => {
    setSelectedIds([])
    if (view !== 'dashboard' && view !== 'contacts' && view !== 'favorites') {
      setSelectMode(false)
    }
  }, [page, phoneType, websiteFilter, view])

  useEffect(() => {
    if (!selectMode) setSelectedIds([])
  }, [selectMode])

  const setContactSelected = useCallback((id, checked) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id]
      return prev.filter((x) => x !== id)
    })
  }, [])

  const selectAllOnPage = useCallback(() => {
    setSelectedIds(contacts.map((c) => c.id))
  }, [contacts])

  const toggleSelectMode = useCallback(() => {
    setSelectMode((m) => !m)
  }, [])

  const handleSearch = async (type, city, limit) => {
    setSearchLoading(true)
    setLastSearch({ type, city, limit })
    setSidebarOpen(false)
    try {
      const data = await api.search(type, city, limit)
      showToast(`✅ ${data.count} empresas encontradas!${data.cached ? ' (cache)' : ''}`)
      setView('dashboard')
      setPage(0)
      await loadContacts({ page: 0 })
      await loadHistory()
    } catch (e) {
      showToast('❌ Erro Apify: ' + e.message)
    }
    setSearchLoading(false)
  }

  const handleWaOneTap = useCallback((contact) => {
    if (contact?.id != null) recordWaRoundId(contact.id)
  }, [])

  const handleFavorite = async (id) => {
    const data = await api.toggleFavorite(id)
    showToast(data.favorite ? '⭐ Favoritado!' : '☆ Removido dos favoritos')
    loadContacts()
  }

  const handleDelete = async (id) => {
    await api.deleteContact(id)
    showToast('🗑️ Contato removido')
    setSelectedIds((prev) => prev.filter((x) => x !== id))
    loadContacts()
  }

  const handleDeleteSelected = async () => {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    if (
      !window.confirm(
        `Apagar ${ids.length} contato(s)? Esta ação não pode ser desfeita.`
      )
    )
      return
    setBulkDeleting(true)
    try {
      await api.deleteContactsBulk(ids)
      showToast(`🗑️ ${ids.length} contato(s) removido(s)`)
      setSelectedIds([])
      setSelectMode(false)
      await loadContacts()
    } catch (e) {
      showToast('❌ Erro ao apagar: ' + e.message)
    } finally {
      setBulkDeleting(false)
    }
  }

  const handleDeleteHistory = async (id) => {
    await api.deleteHistory(id)
    loadHistory()
  }

  const handleNavChange = (v) => {
    setView(v)
    setSidebarOpen(false)
  }

  const openMessageStudio = () => setMessageStudioOpen(true)

  const pageProps = {
    contacts,
    stats,
    loading,
    phoneType,
    setPhoneType,
    websiteFilter,
    setWebsiteFilter,
    page,
    setPage,
    total,
    handleFavorite,
    handleDelete,
    onSearch: handleSearch,
    searchLoading,
    selectMode,
    toggleSelectMode,
    selectedIds,
    setContactSelected,
    selectAllOnPage,
    handleDeleteSelected,
    bulkDeleting,
    onWaOneTap: handleWaOneTap,
    showToast,
    onOpenMessageStudio: openMessageStudio,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 lg:relative lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar view={view} setView={handleNavChange} stats={stats} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          onSearch={handleSearch}
          searchLoading={searchLoading}
          phoneType={phoneType}
          setPhoneType={setPhoneType}
          websiteFilter={websiteFilter}
          setWebsiteFilter={setWebsiteFilter}
          setPage={setPage}
          onMenuClick={() => setSidebarOpen(true)}
          onOpenMessageStudio={openMessageStudio}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 scrollbar-thin">
          {view === 'dashboard' && <Dashboard {...pageProps} lastSearch={lastSearch} />}
          {view === 'contacts' && <Contacts {...pageProps} />}
          {view === 'favorites' && <Favorites {...pageProps} />}
          {view === 'history' && <History history={history} onDelete={handleDeleteHistory} onRerun={handleSearch} searchLoading={searchLoading} />}
        </main>
      </div>

      <MessageStudio open={messageStudioOpen} onClose={() => setMessageStudioOpen(false)} />

      {toast && <Toast message={toast} />}
    </div>
  )
}
