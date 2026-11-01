const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'accounts.db');

let db = null;

async function initDatabase() {
  const SQL = await initSqlJs();

  // Charger la DB si elle existe, sinon créer une nouvelle
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Créer la table
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      owner_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      balance REAL DEFAULT 0,
      account_type TEXT DEFAULT 'CHECKING',
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  saveDatabase();
  console.log(' Account Database initialized (sql.js / SQLite3)');
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