import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_DATA = { sessions: [], messages: [] };

export class ChatStorage {
  constructor(dataPath = 'chat.json') {
    this.dataPath = dataPath;
    this.init();
  }

  init() {
    if (!fs.existsSync(this.dataPath)) {
      this.write(DEFAULT_DATA);
      return;
    }

    try {
      const raw = fs.readFileSync(this.dataPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.sessions) || !Array.isArray(parsed.messages)) {
        this.write(DEFAULT_DATA);
      }
    } catch {
      this.write(DEFAULT_DATA);
    }
  }

  read() {
    const raw = fs.readFileSync(this.dataPath, 'utf-8');
    return JSON.parse(raw);
  }

  write(payload) {
    const dir = path.dirname(this.dataPath);
    if (dir && dir !== '.') {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.dataPath, JSON.stringify(payload, null, 2), 'utf-8');
  }

  listSessions() {
    const data = this.read();
    return [...data.sessions].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  createSession({ id, title, createdAt }) {
    const data = this.read();
    data.sessions.push({ id, title, created_at: createdAt });
    this.write(data);
  }

  renameSession(id, title) {
    const data = this.read();
    const session = data.sessions.find((s) => s.id === id);
    if (session) {
      session.title = title;
      this.write(data);
    }
  }

  deleteSession(id) {
    const data = this.read();
    data.sessions = data.sessions.filter((s) => s.id !== id);
    data.messages = data.messages.filter((m) => m.session_id !== id);
    this.write(data);
  }

  addMessage({ sessionId, role, content, createdAt }) {
    const data = this.read();
    data.messages.push({
      id: data.messages.length + 1,
      session_id: sessionId,
      role,
      content,
      created_at: createdAt
    });
    this.write(data);
  }

  getMessages(sessionId, limit = 20) {
    const data = this.read();
    return data.messages
      .filter((m) => m.session_id === sessionId)
      .slice(-limit)
      .map((m) => ({ role: m.role, content: m.content }));
  }

  getAllMessages(sessionId) {
    const data = this.read();
    return data.messages
      .filter((m) => m.session_id === sessionId)
      .map((m) => ({ role: m.role, content: m.content }));
  }

  close() {}
}
