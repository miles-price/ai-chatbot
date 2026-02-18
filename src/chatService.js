import OpenAI from 'openai';

const SYSTEM_PROMPT =
  'You are a concise software engineering assistant. Give practical, direct answers with clear steps.';

export class ChatService {
  constructor({ provider = 'demo', openAiApiKey = process.env.OPENAI_API_KEY } = {}) {
    this.provider = provider;
    this.hasOpenAIKey = Boolean(openAiApiKey);
    this.client = this.hasOpenAIKey ? new OpenAI({ apiKey: openAiApiKey }) : null;
  }

  async reply(messages, { model = 'gpt-4o-mini', temperature = 0.2, maxTokens = 300 } = {}) {
    if (this.provider === 'openai') {
      if (!this.client) {
        return (
          'OPENAI_API_KEY is not configured on this deployment, so I switched to demo mode. ' +
          this.demoReply(messages)
        );
      }
      return this.openAiReply(messages, { model, temperature, maxTokens });
    }
    return this.demoReply(messages);
  }

  async openAiReply(messages, { model, temperature, maxTokens }) {
    try {
      const response = await this.client.chat.completions.create({
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
      });

      return response.choices?.[0]?.message?.content?.trim() || 'No response generated.';
    } catch (error) {
      const message = String(error?.message || '').toLowerCase();
      const status = Number(error?.status || 0);

      if (status === 429 || message.includes('quota') || message.includes('rate limit')) {
        return (
          'OpenAI quota/rate limit reached, so I switched to demo mode. ' +
          this.demoReply(messages)
        );
      }

      if (status === 401 || message.includes('api key')) {
        return (
          'OpenAI authentication failed, so I switched to demo mode. ' +
          this.demoReply(messages)
        );
      }

      return (
        'OpenAI request failed, so I switched to demo mode. ' +
        this.demoReply(messages)
      );
    }
  }

  demoReply(messages) {
    const userMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const text = userMessage.toLowerCase();

    if (text.includes('resume') || text.includes('project') || text.includes('portfolio')) {
      return 'Lead with action + tech + measurable outcome. Add a GitHub link and a live demo for each project.';
    }

    if (text.includes('bug') || text.includes('error') || text.includes('debug')) {
      return 'Debug sequence: reproduce, isolate, inspect logs, add a failing test, patch root cause, rerun tests.';
    }

    if (text.includes('api') || text.includes('backend') || text.includes('database')) {
      return 'Backend checklist: clear API contracts, validation, auth, DB schema, migrations, and integration tests.';
    }

    return 'Demo mode active. Ask about SWE projects, debugging, APIs, interview prep, or architecture tradeoffs.';
  }
}
