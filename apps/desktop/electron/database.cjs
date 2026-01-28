const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db = null;

/**
 * Initialize SQLite database
 */
function initDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'linkage-health.db');
  
  db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables
  createTables();
  
  console.log('[Database] Initialized at:', dbPath);
  return db;
}

/**
 * Create database tables
 */
function createTables() {
  // Conversations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversationId INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `);

  // Health records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS healthRecords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      unit TEXT NOT NULL,
      notes TEXT,
      recordedAt INTEGER NOT NULL,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Health reports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS healthReports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      trendAnalysis TEXT NOT NULL,
      riskAssessment TEXT NOT NULL,
      recommendations TEXT NOT NULL,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Reminders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      frequency TEXT NOT NULL,
      time TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);
}

/**
 * Get database instance
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

/**
 * Close database connection
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('[Database] Closed');
  }
}

// Conversation operations
const conversationOps = {
  create: (title) => {
    const stmt = db.prepare('INSERT INTO conversations (title) VALUES (?)');
    const result = stmt.run(title);
    return { id: result.lastInsertRowid };
  },
  
  list: () => {
    const stmt = db.prepare('SELECT * FROM conversations ORDER BY updatedAt DESC');
    return stmt.all();
  },
  
  get: (id) => {
    const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
    return stmt.get(id);
  },
  
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM conversations WHERE id = ?');
    stmt.run(id);
    return { success: true };
  }
};

// Message operations
const messageOps = {
  create: (conversationId, role, content) => {
    const stmt = db.prepare('INSERT INTO messages (conversationId, role, content) VALUES (?, ?, ?)');
    const result = stmt.run(conversationId, role, content);
    
    // Update conversation updatedAt
    const updateStmt = db.prepare('UPDATE conversations SET updatedAt = ? WHERE id = ?');
    updateStmt.run(Date.now(), conversationId);
    
    return { id: result.lastInsertRowid };
  },
  
  list: (conversationId) => {
    const stmt = db.prepare('SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC');
    return stmt.all(conversationId);
  }
};

// Health record operations
const healthOps = {
  create: (type, value, unit, notes, recordedAt) => {
    const stmt = db.prepare('INSERT INTO healthRecords (type, value, unit, notes, recordedAt) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(type, value, unit, notes, recordedAt);
    return { id: result.lastInsertRowid };
  },
  
  list: (type) => {
    let stmt;
    if (type) {
      stmt = db.prepare('SELECT * FROM healthRecords WHERE type = ? ORDER BY recordedAt DESC');
      return stmt.all(type);
    } else {
      stmt = db.prepare('SELECT * FROM healthRecords ORDER BY recordedAt DESC');
      return stmt.all();
    }
  },
  
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM healthRecords WHERE id = ?');
    stmt.run(id);
    return { success: true };
  }
};

// Health report operations
const reportOps = {
  create: (title, summary, trendAnalysis, riskAssessment, recommendations) => {
    const stmt = db.prepare('INSERT INTO healthReports (title, summary, trendAnalysis, riskAssessment, recommendations) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(title, summary, trendAnalysis, riskAssessment, recommendations);
    return { id: result.lastInsertRowid };
  },
  
  list: () => {
    const stmt = db.prepare('SELECT * FROM healthReports ORDER BY createdAt DESC');
    return stmt.all();
  },
  
  get: (id) => {
    const stmt = db.prepare('SELECT * FROM healthReports WHERE id = ?');
    return stmt.get(id);
  }
};

// Reminder operations
const reminderOps = {
  create: (title, description, type, frequency, time) => {
    const stmt = db.prepare('INSERT INTO reminders (title, description, type, frequency, time) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(title, description, type, frequency, time);
    return { id: result.lastInsertRowid };
  },
  
  list: () => {
    const stmt = db.prepare('SELECT * FROM reminders ORDER BY createdAt DESC');
    return stmt.all();
  },
  
  update: (id, enabled) => {
    const stmt = db.prepare('UPDATE reminders SET enabled = ? WHERE id = ?');
    stmt.run(enabled ? 1 : 0, id);
    return { success: true };
  },
  
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM reminders WHERE id = ?');
    stmt.run(id);
    return { success: true };
  }
};

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  conversationOps,
  messageOps,
  healthOps,
  reportOps,
  reminderOps
};
