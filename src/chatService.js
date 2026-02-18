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

    if (
      text.includes('resume') ||
      text.includes('project') ||
      text.includes('portfolio') ||
      text.includes('linkedin')
    ) {
      return [
        'For portfolio/resume writing, I can help with:',
        '1) Bullet rewrites (impact-first)',
        '2) Project summaries (short or ATS-friendly)',
        '3) STAR-style interview talking points',
        '',
        'Quick tip: Lead with action + tech + measurable outcome.'
      ].join('\n');
    }

    if (
      text.includes('bug') ||
      text.includes('error') ||
      text.includes('debug') ||
      text.includes('traceback') ||
      text.includes('crash')
    ) {
      return [
        'Debug workflow:',
        '1) Reproduce the issue consistently',
        '2) Isolate the smallest failing case',
        '3) Inspect logs/stack trace',
        '4) Patch root cause',
        '5) Re-test and add a regression test'
      ].join('\n');
    }

    if (
      text.includes('api') ||
      text.includes('backend') ||
      text.includes('database') ||
      text.includes('sql') ||
      text.includes('schema')
    ) {
      return [
        'Backend/API checklist:',
        '- Define endpoints and request/response contracts',
        '- Validate inputs and handle errors cleanly',
        '- Design DB schema + indexes',
        '- Add auth/authorization as needed',
        '- Add integration tests for critical flows'
      ].join('\n');
    }

    if (text.includes('interview') || text.includes('behavioral') || text.includes('leetcode')) {
      return [
        'I can help with interview prep in demo mode:',
        '- Behavioral answers (STAR)',
        '- Project walkthrough scripts',
        '- Technical explanation practice',
        '- Study plans for coding interviews'
      ].join('\n');
    }

    return [
      'Demo mode is active. You can ask me to help with:',
      '- Resume/project bullets',
      '- Debugging steps for an error',
      '- API/backend design ideas',
      '- Interview prep and project walkthroughs',
      '',
      'Try prompts like:',
      '"Rewrite this resume bullet for backend SWE roles"',
      '"Help me debug this Python error: ..."',
      '"Design a simple REST API for a task tracker"'
    ].join('\n');
  }
}
