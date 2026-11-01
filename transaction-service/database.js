const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'transactions.db');
let db = null;

async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      from_account_id TEXT,
      to_account_id TEXT,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'COMPLETED',
      created_at TEXT
    )
  `);

  saveDatabase();
  console.log(' Transaction Database initialized (sql.js / SQLite3)');
  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

function getDb() {
  return db;
}

module.exports = { initDatabase, saveDatabase, getDb };