import { ConfigBase } from "../shared/service/__mocks__/serviceBase";
import { CustomLogger } from "../shared/utils/customLogger.service";

export class CustomLoggerMockImpl extends ConfigBase implements CustomLogger {
    trace(message: string): void {}
    info(message: string): void {}
    warn(message: string): void {}
    error(message: string, error: Error): Promise<void> { return Promise.resolve(); }
    logData(data?: any): void {}
}
