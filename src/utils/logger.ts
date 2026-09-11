export const logger = {
  info: (...messages: unknown[]) => {
    console.info('[WorkdayAI]', ...messages);
  },
  warn: (...messages: unknown[]) => {
    console.warn('[WorkdayAI]', ...messages);
  },
  error: (...messages: unknown[]) => {
    console.error('[WorkdayAI]', ...messages);
  },
  debug: (...messages: unknown[]) => {
    if (import.meta.env.DEV) {
      console.debug('[WorkdayAI]', ...messages);
    }
  }
};
