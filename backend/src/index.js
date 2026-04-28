require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const db = require('./database');
const searchRoutes = require('./routes/search');
const contactRoutes = require('./routes/contacts');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Init DB
db.init();

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/history', historyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', apify: !!process.env.APIFY_TOKEN });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Prospect Web Backend rodando em http://localhost:${PORT}`);
    console.log(`🔑 Apify Token: ${process.env.APIFY_TOKEN ? '✅ configurado' : '❌ ausente'}\n`);
  });
}

module.exports = app;
