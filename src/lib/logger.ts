// ponytail: zero-dependency structured JSON logger utility
export const Logger = {
  info(event: string, meta: Record<string, any> = {}) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      event,
      ...meta
    }));
  },
  error(event: string, error: any, meta: Record<string, any> = {}) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      event,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...meta
    }));
  }
};
