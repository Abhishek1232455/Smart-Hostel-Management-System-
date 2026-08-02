const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../hostel.db');
const schemaPath = path.join(__dirname, 'schema.sql');

let dbInstance = null;

function saveDb() {
  if (dbInstance) {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function getDbSync() {
  if (dbInstance) return dbInstance;
  throw new Error("Database not initialized yet! Call initDb() first.");
}

async function initDb() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  let filebuffer = null;
  if (fs.existsSync(dbPath)) {
    filebuffer = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(filebuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // Always apply schema
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  dbInstance.exec(schemaSql);
  saveDb();

  return dbInstance;
}

// Wrapper for easy query execution
const dbHelper = {
  initDb,
  getDbSync,
  saveDb,
  exec: (sql) => {
    const db = getDbSync();
    db.exec(sql);
    saveDb();
  },
  run: (sql, params = []) => {
    const db = getDbSync();
    const stmt = db.prepare(sql);
    stmt.run(params);
    stmt.free();
    const res = db.exec("SELECT last_insert_rowid() as id");
    const id = (res && res[0] && res[0].values && res[0].values[0]) ? res[0].values[0][0] : null;
    saveDb();
    return { lastInsertRowid: id };
  },
  get: (sql, params = []) => {
    const db = getDbSync();
    const stmt = db.prepare(sql);
    stmt.bind(params);
    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  },
  all: (sql, params = []) => {
    const db = getDbSync();
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
};

module.exports = dbHelper;
