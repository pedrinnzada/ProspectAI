const express = require('express');
const router = express.Router();
const { supabase } = require('../database');

// GET /api/history
router.get('/', async (req, res) => {
  try {
    const { data: history, error } = await supabase
      .from('history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    
    if (error) throw error;
    res.json({ history });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/history/:id
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('history')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
