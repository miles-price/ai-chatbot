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
const providerEl = document.querySelector('#provider');
const modelEl = document.querySelector('#model');
const temperatureEl = document.querySelector('#temperature');
const maxTokensEl = document.querySelector('#max-tokens');

let activeSessionId = null;

function renderMessages(messages) {
  messagesEl.innerHTML = '';

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

  sessions.forEach((session) => {
    const opt = document.createElement('option');
    opt.value = session.id;
    opt.textContent = `${session.title} (${session.id.slice(0, 8)})`;
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

  const result = await api.sendChat({
    sessionId: activeSessionId,
    prompt,
    provider: providerEl.value,
    model: modelEl.value,
    temperature: Number(temperatureEl.value),
    maxTokens: Number(maxTokensEl.value)
  });

  if (result.error) {
    alert(result.error);
    return;
  }

  renderMessages(result.messages || []);

  if ((result.messages || []).length === 2) {
    await api.renameSession(activeSessionId, prompt.slice(0, 50));
    await refreshSessions();
  }
});

(async function init() {
  await refreshSessions();
  await refreshMessages();
})();
