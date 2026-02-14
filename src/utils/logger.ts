type LogLevel = 'debug' | 'info' | 'warn' | 'error';
const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('debug')) console.debug(`[DEBUG] ${message}`, meta || '');
  },
  info(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('info')) console.info(`[INFO] ${message}`, meta || '');
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('warn')) console.warn(`[WARN] ${message}`, meta || '');
  },
  error(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('error')) console.error(`[ERROR] ${message}`, meta || '');
  },
};
