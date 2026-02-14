/**
 * Logger Utility
 * Structured logging for MCP Server
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogMessage {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, any>;
}

export class Logger {
  private module: string;
  private minLevel: LogLevel;

  constructor(module: string, minLevel: LogLevel = LogLevel.INFO) {
    this.module = module;
    this.minLevel = minLevel;
  }

  debug(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: Record<string, any> | Error | unknown): void {
    let errorData: Record<string, any> = {};

    if (data instanceof Error) {
      errorData = {
        error: data.message,
        stack: data.stack,
      };
    } else if (typeof data === 'object' && data !== null) {
      errorData = data as Record<string, any>;
    }

    this.log(LogLevel.ERROR, message, errorData);
  }

  private log(level: LogLevel, message: string, data?: Record<string, any>): void {
    const severity = this.getLevelSeverity(level);
    const minSeverity = this.getLevelSeverity(this.minLevel);

    if (severity < minSeverity) {
      return;
    }

    const logMessage: LogMessage = {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      data,
    };

    const output = this.formatLog(logMessage);
    console.log(output);
  }

  private formatLog(logMessage: LogMessage): string {
    const { timestamp, level, module, message, data } = logMessage;
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] ${level} [${module}] ${message}${dataStr}`;
  }

  private getLevelSeverity(level: LogLevel): number {
    const severities: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
    };
    return severities[level];
  }
}
