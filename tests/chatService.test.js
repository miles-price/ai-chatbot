import test from 'node:test';
import assert from 'node:assert/strict';

import { ChatService } from '../src/chatService.js';

test('demo mode returns resume-oriented guidance', async () => {
  const service = new ChatService();
  const reply = await service.reply([{ role: 'user', content: 'How should I show this on my resume?' }]);

  assert.equal(typeof reply, 'string');
  assert.equal(reply.length > 0, true);
});

test('demo mode returns guidance for generic prompts', async () => {
  const service = new ChatService();
  const reply = await service.reply([{ role: 'user', content: 'hello' }]);
  assert.match(reply, /Demo mode is active/i);
});
