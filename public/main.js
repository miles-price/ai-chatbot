const api = {
  async getSessions() {
    const res = await fetch('/api/sessions');
    return res.json();
  },
  async createSession(title = 'New Chat') {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    return res.json();
  },
  async renameSession(id, title) {
    await fetch(`/api/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
  },
  async deleteSession(id) {
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
  },
  async getMessages(id) {
    const res = await fetch(`/api/sessions/${id}/messages`);
    return res.json();
  },
  async sendChat(payload) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};

const sessionSelect = document.querySelector('#session-select');
const renameInput = document.querySelector('#rename-input');
const newChatBtn = document.querySelector('#new-chat-btn');
const renameBtn = document.querySelector('#rename-btn');
const deleteBtn = document.querySelector('#delete-chat-btn');
const chatForm = document.querySelector('#chat-form');
const promptInput = document.querySelector('#prompt');
const messagesEl = document.querySelector('#chat-messages');
const statusBannerEl = document.querySelector('#status-banner');
const themeToggleEl = document.querySelector('#theme-toggle');

let activeSessionId = null;

function setBanner(text = '') {
  if (!text) {
    statusBannerEl.classList.add('hidden');
    statusBannerEl.textContent = '';
    return;
  }

  statusBannerEl.textContent = text;
  statusBannerEl.classList.remove('hidden');
}

function applyTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggleEl.textContent = next === 'dark' ? 'Light' : 'Dark';
}

function renderMessages(messages) {
  messagesEl.innerHTML = '';

  if (!messages || messages.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent =
      'Start a new conversation. Try: "Rewrite this resume bullet", "Help debug this error", or "Design a REST API for a task app".';
    messagesEl.appendChild(empty);
    return;
  }

  for (const msg of messages) {
    const div = document.createElement('div');
    div.className = `message ${msg.role}`;
    div.textContent = msg.content;
    messagesEl.appendChild(div);
  }

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function refreshSessions() {
  const sessions = await api.getSessions();
  sessionSelect.innerHTML = '';

  sessions.forEach((session, idx) => {
    const opt = document.createElement('option');
    opt.value = session.id;
    opt.textContent = session.title || `Chat ${idx + 1}`;
    sessionSelect.appendChild(opt);
  });

  if (!activeSessionId && sessions.length > 0) {
    activeSessionId = sessions[0].id;
  }

  if (activeSessionId) {
    sessionSelect.value = activeSessionId;
    const selected = sessions.find((s) => s.id === activeSessionId);
    renameInput.value = selected?.title || '';
  }
}

async function refreshMessages() {
  if (!activeSessionId) return;
  const messages = await api.getMessages(activeSessionId);
  renderMessages(messages);
}

newChatBtn.addEventListener('click', async () => {
  const created = await api.createSession('New Chat');
  activeSessionId = created.id;
  await refreshSessions();
  await refreshMessages();
});

sessionSelect.addEventListener('change', async () => {
  activeSessionId = sessionSelect.value;
  await refreshSessions();
  await refreshMessages();
});

renameBtn.addEventListener('click', async () => {
  if (!activeSessionId) return;
  const title = renameInput.value.trim();
  if (!title) return;
  await api.renameSession(activeSessionId, title);
  await refreshSessions();
});

deleteBtn.addEventListener('click', async () => {
  if (!activeSessionId) return;
  await api.deleteSession(activeSessionId);
  activeSessionId = null;
  await refreshSessions();
  await refreshMessages();
});

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt || !activeSessionId) return;

  promptInput.value = '';
  setBanner('');

  const result = await api.sendChat({
    sessionId: activeSessionId,
    prompt
  });

  if (result.error) {
    setBanner(result.error);
    return;
  }

  renderMessages(result.messages || []);

  if ((result.messages || []).length === 2) {
    await api.renameSession(activeSessionId, prompt.slice(0, 50));
    await refreshSessions();
  }
});

themeToggleEl.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'light' ? 'dark' : 'light');
});

(async function init() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
  setBanner('Demo mode is enabled for reliable public access.');

  await refreshSessions();
  await refreshMessages();
})();
