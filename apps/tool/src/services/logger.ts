
export type LogSeverity = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
    severity: LogSeverity;
    message: string;
    context?: Record<string, unknown>;
    timestamp: string;
}

/**
 * Centralized logger service.
 * Handles production gating for debug logs and provides consistent formatting.
 */
class Logger {
    private isProd = import.meta.env.PROD;

    private print(severity: LogSeverity, message: string, context?: Record<string, unknown>): void {
        // Gate debug logs in production
        if (this.isProd && severity === 'debug') {
            return;
        }

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${severity.toUpperCase()}]`;
        const style = this.getStyle(severity);

        // Use native console methods which handle object inspection better than JSON.stringify
        const consoleMethod = severity === 'error' ? 'error' : severity === 'warn' ? 'warn' : 'log';

        if (context) {
            // Create a shallow copy of context to avoid mutation surprises if we were modifying it
            // And to ensure we aren't passing massive objects if we can help it (though responsibility is on caller)
            console[consoleMethod](`%c${prefix}`, style, message, context);
        } else {
            console[consoleMethod](`%c${prefix}`, style, message);
        }
    }

    private getStyle(severity: LogSeverity): string {
        switch (severity) {
            case 'debug': return 'color: #9CA3AF'; // Gray-400
            case 'info': return 'color: #3B82F6'; // Blue-500
            case 'warn': return 'color: #F59E0B'; // Amber-500
            case 'error': return 'color: #EF4444; font-weight: bold'; // Red-500
            default: return '';
        }
    }

    public debug(message: string, context?: Record<string, unknown>) {
        this.print('debug', message, context);
    }

    public info(message: string, context?: Record<string, unknown>) {
        this.print('info', message, context);
    }

    public warn(message: string, context?: Record<string, unknown>) {
        this.print('warn', message, context);
    }

    public error(message: string, context?: Record<string, unknown>) {
        this.print('error', message, context);
    }
}

export const logger = new Logger();
