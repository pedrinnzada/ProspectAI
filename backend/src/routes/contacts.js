const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// GET /api/contacts
router.get('/', (req, res) => {
  const db = getDb();
  const { status, favorite, search, page = 0, limit = 20 } = req.query;
  const offset = parseInt(page) * parseInt(limit);

  let list = db.get('contacts').value();

  if (status && status !== 'all') list = list.filter(c => c.status === status);
  if (favorite === 'true') list = list.filter(c => c.favorite);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(c =>
      (c.name || '').toLowerCase().includes(s) ||
      (c.city || '').toLowerCase().includes(s) ||
      (c.phone || '').toLowerCase().includes(s)
    );
  }

  // Sort newest first
  list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const total = list.length;
  const contacts = list.slice(offset, offset + parseInt(limit));

  const all = db.get('contacts').value();
  const stats = {
    total: all.length,
    closed: all.filter(c => c.status === 'closed').length,
    refused: all.filter(c => c.status === 'refused').length,
    pending: all.filter(c => c.status === 'pending').length,
    favorites: all.filter(c => c.favorite).length,
  };

  res.json({ contacts, total, page: parseInt(page), stats });
});

// PATCH /api/contacts/:id/status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'closed', 'refused'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Status inválido' });
  const db = getDb();
  db.get('contacts').find({ id: parseInt(req.params.id) }).assign({ status }).write();
  res.json({ ok: true });
});

// PATCH /api/contacts/:id/favorite
router.patch('/:id/favorite', (req, res) => {
  const db = getDb();
  const contact = db.get('contacts').find({ id: parseInt(req.params.id) }).value();
  if (!contact) return res.status(404).json({ error: 'Não encontrado' });
  const newFav = !contact.favorite;
  db.get('contacts').find({ id: parseInt(req.params.id) }).assign({ favorite: newFav }).write();
  res.json({ favorite: newFav });
});

// DELETE /api/contacts/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.get('contacts').remove({ id: parseInt(req.params.id) }).write();
  res.json({ ok: true });
});

module.exports = router;
