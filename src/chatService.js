export class ChatService {
  constructor() {}

  async reply(messages) {
    return this.demoReply(messages);
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
