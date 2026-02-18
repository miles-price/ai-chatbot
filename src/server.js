import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ChatStorage } from './storage.js';
import { ChatService } from './chatService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const app = express();

const storage = new ChatStorage(process.env.CHAT_DB_PATH || 'chat.json');

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

function now() {
  return new Date().toISOString();
}

function ensureSessionExists() {
  const sessions = storage.listSessions();
  if (sessions.length === 0) {
    const id = crypto.randomUUID();
    storage.createSession({ id, title: 'First Chat', createdAt: now() });
  }
}

ensureSessionExists();

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: now() });
});

app.get('/api/config', (_req, res) => {
  res.json({
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.get('/api/sessions', (_req, res) => {
  res.json(storage.listSessions());
});

app.post('/api/sessions', (req, res) => {
  const id = crypto.randomUUID();
  const title = String(req.body?.title || 'New Chat').trim() || 'New Chat';
  storage.createSession({ id, title, createdAt: now() });
  res.status(201).json({ id, title });
});

app.patch('/api/sessions/:id', (req, res) => {
  const title = String(req.body?.title || '').trim();
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  storage.renameSession(req.params.id, title);
  return res.json({ ok: true });
});

app.delete('/api/sessions/:id', (req, res) => {
  storage.deleteSession(req.params.id);

  const sessions = storage.listSessions();
  if (sessions.length === 0) {
    const id = crypto.randomUUID();
    storage.createSession({ id, title: 'New Chat', createdAt: now() });
  }

  return res.json({ ok: true });
});

app.get('/api/sessions/:id/messages', (req, res) => {
  const messages = storage.getAllMessages(req.params.id);
  return res.json(messages);
});

app.post('/api/chat', async (req, res) => {
  try {
    const {
      sessionId,
      prompt,
      provider = 'demo',
      model = 'gpt-4o-mini',
      temperature = 0.2,
      maxTokens = 300
    } = req.body || {};

    if (!sessionId || !String(prompt || '').trim()) {
      return res.status(400).json({ error: 'sessionId and prompt are required.' });
    }

    const userContent = String(prompt).trim();
    storage.addMessage({ sessionId, role: 'user', content: userContent, createdAt: now() });

    const context = storage.getMessages(sessionId, 20);
    const service = new ChatService({ provider });
    const reply = await service.reply(context, {
      model: String(model),
      temperature: Number(temperature),
      maxTokens: Number(maxTokens)
    });

    storage.addMessage({
      sessionId,
      role: 'assistant',
      content: reply,
      createdAt: now()
    });

    const allMessages = storage.getAllMessages(sessionId);
    return res.json({ reply, messages: allMessages });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`AI chatbot JS app running on http://localhost:${PORT}`);
});
