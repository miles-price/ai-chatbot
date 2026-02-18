import test from 'node:test';
import assert from 'node:assert/strict';

import { ChatService } from '../src/chatService.js';

test('demo provider returns resume-oriented guidance', async () => {
  const service = new ChatService({ provider: 'demo' });
  const reply = await service.reply([{ role: 'user', content: 'How should I show this on my resume?' }]);

  assert.equal(typeof reply, 'string');
  assert.equal(reply.length > 0, true);
});

test('openai provider without key throws a clear error', async () => {
  const service = new ChatService({ provider: 'openai', openAiApiKey: '' });

  await assert.rejects(
    () => service.reply([{ role: 'user', content: 'hello' }]),
    /OPENAI_API_KEY is missing/
  );
});
