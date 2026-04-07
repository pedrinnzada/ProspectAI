const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// GET /api/history
router.get('/', (req, res) => {
  const db = getDb();
  const history = db.get('history')
    .value()
    .sort((a, b) => new Date(b.searched_at) - new Date(a.searched_at))
    .slice(0, 30);
  res.json({ history });
});

// DELETE /api/history/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.get('history').remove({ id: parseInt(req.params.id) }).write();
  res.json({ ok: true });
});

module.exports = router;
