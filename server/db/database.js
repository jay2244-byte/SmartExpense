const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { createClient } = require('@libsql/client');

const isLibsql = process.env.TURSO_URL && process.env.TURSO_TOKEN;

async function openDb() {
  if (isLibsql) {
    const client = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_TOKEN,
    });

    // Wrapper for libsql client to match sqlite API
    return {
      all: (sql, params) => client.execute({ sql, args: params || [] }).then(r => r.rows),
      get: (sql, params) => client.execute({ sql, args: params || [] }).then(r => r.rows[0]),
      run: (sql, params) => client.execute({ sql, args: params || [] }).then(r => ({ lastID: Number(r.lastInsertRowid) })),
      exec: (sql) => client.execute(sql),
    };
  }

  return open({
    filename: './db/expense.db',
    driver: sqlite3.Database
  });
}

async function initDb() {
  const db = await openDb();

  // Enable Foreign Keys (not needed for libsql but good for local)
  if (!isLibsql) await db.run('PRAGMA foreign_keys = ON');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT,
      budget REAL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      category_id INTEGER,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      currency TEXT DEFAULT 'USD',
      FOREIGN KEY (category_id) REFERENCES categories (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  // Migrations for existing tables (only for local sqlite)
  if (!isLibsql) {
    try {
      await db.run("ALTER TABLE expenses ADD COLUMN currency TEXT DEFAULT 'USD'");
    } catch (e) { }

    try {
      await db.run("ALTER TABLE categories ADD COLUMN budget REAL DEFAULT 0");
    } catch (e) { }

    try {
      await db.run("ALTER TABLE expenses ADD COLUMN user_id INTEGER");
    } catch (e) { }

    try {
      await db.run("ALTER TABLE categories ADD COLUMN user_id INTEGER");
    } catch (e) { }
  }

  return db;
}

module.exports = { openDb, initDb };
