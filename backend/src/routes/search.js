const express = require('express');
const router = express.Router();
const { getDb, nextId } = require('../database');
const apify = require('../services/apify');

// POST /api/search
router.post('/', async (req, res) => {
  const { type, city, limit = 20, force = false } = req.body;
  if (!type || !city) return res.status(400).json({ error: 'Campos "type" e "city" são obrigatórios' });

  const db = getDb();
  const cacheKey = `${type.toLowerCase()}|${city.toLowerCase()}|${limit}`;

  // Verifica cache (válido 24h)
  if (!force) {
    const cached = db.get('cache').find({ key: cacheKey }).value();
    if (cached) {
      const age = Date.now() - new Date(cached.created_at).getTime();
      if (age < 24 * 60 * 60 * 1000) {
        console.log(`📦 Cache hit: ${cacheKey}`);
        return res.json({ results: cached.data, cached: true, count: cached.data.length });
      }
    }
  }

  try {
    console.log(`🔍 Buscando: ${type} em ${city} (max: ${limit})`);
    const results = await apify.scrape(type, city, parseInt(limit));

    // Salva cache
    const existingCache = db.get('cache').find({ key: cacheKey }).value();
    if (existingCache) {
      db.get('cache').find({ key: cacheKey }).assign({ data: results, created_at: new Date().toISOString() }).write();
    } else {
      db.get('cache').push({ id: nextId(db, 'cache'), key: cacheKey, data: results, created_at: new Date().toISOString() }).write();
    }

    // Salva contatos sem duplicar (mesmo nome + cidade)
    const existingContacts = db.get('contacts').value();
    let added = 0;
    for (const item of results) {
      const dup = existingContacts.find(c => c.name === item.name && c.city === item.city);
      if (!dup) {
        db.get('contacts').push({
          id: nextId(db, 'contacts'),
          name: item.name,
          phone: item.phone,
          address: item.address,
          city: item.city,
          website: item.website,
          rating: item.rating,
          reviews: item.reviews,
          price: item.price,
          category: item.category,
          map_url: item.mapUrl,
          status: 'pending',
          favorite: false,
          search_query: item.searchQuery,
          source: item.source,
          created_at: new Date().toISOString(),
        }).write();
        added++;
      }
    }

    // Salva histórico
    db.get('history').push({
      id: nextId(db, 'history'),
      type, city,
      result_count: results.length,
      limit_count: limit,
      searched_at: new Date().toISOString(),
    }).write();

    res.json({ results, cached: false, count: results.length, added });
  } catch (err) {
    console.error('❌ Erro Apify:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
