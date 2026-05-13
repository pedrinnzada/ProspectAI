const express = require('express');
const router = express.Router();
const { supabase } = require('../database');

function isMobileBr(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  const local = digits.length > 9 ? digits.slice(-9) : digits;
  return local.startsWith('9') || local.startsWith('8');
}

// POST /api/contacts/next-in-queue — próximo com telefone (celular primeiro, FIFO); body: { excludeIds?: string[] }
router.post('/next-in-queue', async (req, res) => {
  try {
    const raw = req.body?.excludeIds;
    const excludeIds = Array.isArray(raw) ? raw : [];
    const excludeSet = new Set(excludeIds.map(String).filter(Boolean).slice(0, 400));

    const { data: rows, error } = await supabase
      .from('contacts')
      .select('*')
      .not('phone', 'is', null)
      .neq('phone', '')
      .order('created_at', { ascending: true })
      .limit(120);

    if (error) throw error;

    const list = (rows || []).filter((r) => r.id != null && !excludeSet.has(String(r.id)));
    const sorted = [...list].sort((a, b) => {
      const ma = isMobileBr(a.phone);
      const mb = isMobileBr(b.phone);
      if (ma && !mb) return -1;
      if (!ma && mb) return 1;
      return 0;
    });

    const { count: withPhoneCount, error: countErr } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .not('phone', 'is', null)
      .neq('phone', '');

    if (countErr) throw countErr;

    res.json({
      contact: sorted[0] || null,
      queueCount: withPhoneCount ?? list.length,
      remainingAfterExclude: sorted.length,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/contacts
router.get('/', async (req, res) => {
  try {
    const { favorite, search, phoneType, websiteFilter, page = 0, limit = 20 } = req.query;
    const offset = parseInt(page) * parseInt(limit);

    let query = supabase.from('contacts').select('*', { count: 'exact' });

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

    // Stats (foco em prospecção / WhatsApp)
    const { data: allRows, error: statsError } = await supabase
      .from('contacts')
      .select('phone, favorite');

    if (statsError) throw statsError;

    const withPhone = allRows.filter((c) => c.phone && String(c.phone).trim()).length;
    const withMobile = allRows.filter((c) => isMobileBr(c.phone)).length;

    const stats = {
      total: allRows.length,
      favorites: allRows.filter((c) => c.favorite).length,
      withPhone,
      withMobile,
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
