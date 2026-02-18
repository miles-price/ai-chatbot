import Database from 'better-sqlite3';

export class ChatStorage {
  constructor(dbPath = 'chat.db') {
    this.db = new Database(dbPath);
    this.init();
  }

  init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(session_id) REFERENCES sessions(id)
      );
    `);
  }

  listSessions() {
    const stmt = this.db.prepare(
      'SELECT id, title, created_at FROM sessions ORDER BY created_at DESC'
    );
    return stmt.all();
  }

  createSession({ id, title, createdAt }) {
    const stmt = this.db.prepare(
      'INSERT INTO sessions (id, title, created_at) VALUES (?, ?, ?)'
    );
    stmt.run(id, title, createdAt);
  }

  renameSession(id, title) {
    const stmt = this.db.prepare('UPDATE sessions SET title = ? WHERE id = ?');
    stmt.run(title, id);
  }

  deleteSession(id) {
    this.db.prepare('DELETE FROM messages WHERE session_id = ?').run(id);
    this.db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
  }

  addMessage({ sessionId, role, content, createdAt }) {
    const stmt = this.db.prepare(
      'INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)'
    );
    stmt.run(sessionId, role, content, createdAt);
  }

  getMessages(sessionId, limit = 20) {
    const stmt = this.db.prepare(
      `SELECT role, content FROM (
         SELECT role, content, id
         FROM messages
         WHERE session_id = ?
         ORDER BY id DESC
         LIMIT ?
       )
       ORDER BY id ASC`
    );
    return stmt.all(sessionId, limit);
  }

  getAllMessages(sessionId) {
    const stmt = this.db.prepare(
      'SELECT role, content FROM messages WHERE session_id = ? ORDER BY id ASC'
    );
    return stmt.all(sessionId);
  }

  close() {
    this.db.close();
  }
}
