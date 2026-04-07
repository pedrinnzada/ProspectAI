import ContactCard from '../components/ContactCard'
import EmptyState from '../components/EmptyState'

export default function Favorites({ contacts, loading, handleStatus, handleFavorite, handleDelete }) {
  return (
    <div>
      <div className="text-[14px] font-semibold mb-4">
        ⭐ Favoritos
        <span className="ml-2 bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full">{contacts.length}</span>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <svg className="animate-spin w-7 h-7 text-gray-300 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState icon="⭐" title="Nenhum favorito ainda" subtitle="Clique na estrela ☆ em qualquer contato para favoritar" />
      ) : (
        <div className="flex flex-col gap-2">
          {contacts.map(c => (
            <ContactCard key={c.id} contact={c} onStatus={handleStatus} onFavorite={handleFavorite} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
