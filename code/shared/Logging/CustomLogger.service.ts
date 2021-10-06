export interface CustomLogger {
    trace(message: string): void;
    info(message: string, data?: any): void;
    warn(message: string): void;
    error(message: string, error: Error): void;
    logData(data?: any): void;
}
