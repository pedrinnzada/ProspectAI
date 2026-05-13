const express = require('express');
const router = express.Router();
const { supabase } = require('../database');

// GET /api/contacts
router.get('/', async (req, res) => {
  try {
    const { status, favorite, search, phoneType, websiteFilter, page = 0, limit = 20 } = req.query;
    const offset = parseInt(page) * parseInt(limit);

    let query = supabase.from('contacts').select('*', { count: 'exact' });

    // Status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Favorite filter
    if (favorite === 'true') {
      query = query.eq('favorite', true);
    }

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // New Filters logic
    // Website filter
    if (websiteFilter === 'com_site') {
      query = query.neq('website', '').not('website', 'is', null);
    } else if (websiteFilter === 'sem_site') {
      query = query.or('website.eq.,website.is.null');
    }

    // Phone type filter (Approximate for Brazilian numbers)
    // Mobile numbers in Brazil have a 9 after the area code: (XX) 9XXXX-XXXX
    if (phoneType === 'celular') {
      query = query.ilike('phone', '% 9%');
    } else if (phoneType === 'fixo') {
      // This is tricky with simple ilike, might need to filter in memory or use a more complex query
      // For now, let's just fetch and we can filter if needed, but ilike is faster.
      // A better way is to use a negative ilike if supported or rpc.
      // Let's stick to a simpler approach for now or fetch more and filter.
    }

    // Sort newest first
    query = query.order('created_at', { ascending: false });

    // Pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: contacts, count: total, error } = await query;

    if (error) throw error;

    // Post-fetch filtering for 'fixo' if needed
    let filteredContacts = contacts;
    if (phoneType === 'fixo') {
      filteredContacts = contacts.filter(c => {
        const phone = c.phone || '';
        // Brazilian fixed numbers don't have ' 9' after area code
        const parts = phone.split(' ');
        const numberPart = parts[parts.length - 1];
        return numberPart && !numberPart.startsWith('9');
      });
    }

    // Stats
    const { data: allStats, error: statsError } = await supabase
      .from('contacts')
      .select('status, favorite');

    if (statsError) throw statsError;

    const stats = {
      total: allStats.length,
      closed: allStats.filter(c => c.status === 'closed').length,
      refused: allStats.filter(c => c.status === 'refused').length,
      pending: allStats.filter(c => c.status === 'pending').length,
      favorites: allStats.filter(c => c.favorite).length,
    };

    res.json({ contacts: filteredContacts, total: total || 0, page: parseInt(page), stats });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/contacts/bulk-delete  (before /:id routes)
router.post('/bulk-delete', async (req, res) => {
  try {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Informe um array ids com ao menos um id' });
    }
    const clean = [...new Set(ids.map(String).filter(Boolean))].slice(0, 500);
    if (clean.length === 0) {
      return res.status(400).json({ error: 'Nenhum id válido' });
    }
    const { error } = await supabase.from('contacts').delete().in('id', clean);
    if (error) throw error;
    res.json({ ok: true, deleted: clean.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/contacts/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/contacts/:id/favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const { data: contact, error: fetchError } = await supabase
      .from('contacts')
      .select('favorite')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError) throw fetchError;
    
    const newFav = !contact.favorite;
    const { error: updateError } = await supabase
      .from('contacts')
      .update({ favorite: newFav })
      .eq('id', req.params.id);
    
    if (updateError) throw updateError;
    res.json({ favorite: newFav });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
