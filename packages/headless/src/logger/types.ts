export type Loggable = string | number | object | Error | Loggable[] | unknown;

export interface Logger {
  logs: string[];
  log(...values: Loggable[]): void;
  debug(...values: Loggable[]): void;
  info(...values: Loggable[]): void;
  warn(...values: Loggable[]): void;
  error(...values: Loggable[]): void;
  save(context?: Loggable): Promise<void>;
}
