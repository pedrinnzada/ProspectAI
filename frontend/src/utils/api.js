const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro na requisição');
  }
  return res.json();
}

export const api = {
  // Search
  search: (type, city, limit = 20, force = false) =>
    request('/search', {
      method: 'POST',
      body: JSON.stringify({ type, city, limit, force }),
    }),

  // Contacts
  getContacts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/contacts?${q}`);
  },
  setStatus: (id, status) =>
    request(`/contacts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  toggleFavorite: (id) =>
    request(`/contacts/${id}/favorite`, { method: 'PATCH' }),
  deleteContact: (id) =>
    request(`/contacts/${id}`, { method: 'DELETE' }),
  deleteContactsBulk: (ids) =>
    request('/contacts/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  // History
  getHistory: () => request('/history'),
  deleteHistory: (id) => request(`/history/${id}`, { method: 'DELETE' }),
};
