const express = require('express');
const router = express.Router();
const { supabase } = require('../database');
const apify = require('../services/apify');

// POST /api/search
router.post('/', async (req, res) => {
  const { type, city, limit = 20, force = false } = req.body;
  if (!type || !city) return res.status(400).json({ error: 'Campos "type" e "city" são obrigatórios' });

  const cacheKey = `${type.toLowerCase()}|${city.toLowerCase()}|${limit}`;

  // Verifica cache (válido 24h)
  if (!force) {
    const { data: cached, error: cacheError } = await supabase
      .from('cache')
      .select('data, created_at')
      .eq('key', cacheKey)
      .single();

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
    const { error: cacheUpsertError } = await supabase
      .from('cache')
      .upsert({ key: cacheKey, data: results, created_at: new Date().toISOString() }, { onConflict: 'key' });

    if (cacheUpsertError) console.error('❌ Erro ao salvar cache:', cacheUpsertError.message);

    // Salva contatos sem duplicar
    let added = 0;
    for (const item of results) {
      // Verifica duplicata por nome e cidade no Supabase
      const { data: dup } = await supabase
        .from('contacts')
        .select('id')
        .eq('name', item.name)
        .eq('city', item.city)
        .maybeSingle();

      if (!dup) {
        const { error: insertError } = await supabase
          .from('contacts')
          .insert({
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
          });
        
        if (!insertError) added++;
        else console.error('❌ Erro ao inserir contato:', insertError.message);
      }
    }

    // Salva histórico
    const { error: historyError } = await supabase
      .from('history')
      .insert({
        type,
        city,
        count: results.length,
        limit_count: limit,
        cached: false,
        created_at: new Date().toISOString(),
      });

    if (historyError) console.error('❌ Erro ao salvar histórico:', historyError.message);

    res.json({ results, cached: false, count: results.length, added });
  } catch (err) {
    console.error('❌ Erro Apify:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
