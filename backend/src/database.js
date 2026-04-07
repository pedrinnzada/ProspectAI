const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'prospectai.json');

let db;

function getDb() {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const adapter = new FileSync(DB_PATH);
    db = low(adapter);
    db.defaults({ contacts: [], history: [], cache: [], _nextId: { contacts: 1, history: 1, cache: 1 } }).write();
  }
  return db;
}

function nextId(db, collection) {
  const ids = db.get('_nextId').value();
  const id = ids[collection] || 1;
  db.set(`_nextId.${collection}`, id + 1).write();
  return id;
}

function init() {
  getDb();
  console.log('✅ Banco de dados JSON inicializado em', DB_PATH);
}

module.exports = { getDb, nextId, init };
