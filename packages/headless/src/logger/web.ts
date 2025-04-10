import { Logger as ILogger, Loggable } from "@/logger/types";

export class Logger implements ILogger {
  logs: string[] = [];

  private asString(value: Loggable) {
    if (value instanceof Error)
      return `[${value.name}]: ${value.message}\n${value.stack}`;
    return JSON.stringify(value, null, 2);
  }

  private base<T extends Loggable>(
    type: "log" | "debug" | "error" | "info" | "warn",
    ...values: T[]
  ) {
    const log = values.map((value) => this.asString(value)).join(" ");
    const date = new Date().toISOString();
    this.logs.push(`[${type}][${date}]: ${log}`);
    console[type](...values);
  }

  log(...values: Loggable[]): void {
    this.base("log", ...values);
  }

  debug(...values: Loggable[]): void {
    this.base("debug", ...values);
  }

  info(...values: Loggable[]): void {
    this.base("info", ...values);
  }

  warn(...values: Loggable[]): void {
    this.base("warn", ...values);
  }

  error(...values: Loggable[]): void {
    this.base("error", ...values);
  }

  private header(): string[] {
    const agent = navigator.userAgent;
    const url = window.location.href;
    return [`User Agent: ${agent}`, `URL: ${url}`];
  }

  async save(context?: Loggable): Promise<void> {
    const { saveAs } = await import("file-saver");
    const logs = this.header();
    if (context) logs.push(this.asString(context));
    logs.push(...this.logs);

    const blob = new Blob([logs.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    const nonce = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    const name = new Date() // example: thu-apr-10-2025-001.log
      .toDateString()
      .toLowerCase()
      .replace(/\s/g, "-")
      .concat("-", nonce.toString(), ".log");

    saveAs(blob, name);
  }
}
