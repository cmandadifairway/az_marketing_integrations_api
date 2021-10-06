import { ConfigBase } from "../services/serviceBase";
import { CustomLogger } from "./CustomLogger.service";
import * as appInsights from "applicationinsights";
import { SeverityLevel } from "applicationinsights/out/Declarations/Contracts";
import { BaseError } from "../Model/baseError.model";
import { classToPlain } from "class-transformer";

export class CustomLoggerImpl extends ConfigBase implements CustomLogger {
    private readonly client: appInsights.TelemetryClient = appInsights.defaultClient;

    trace(message: string): void {
        this.logMessage(message, SeverityLevel.Verbose);
    }

    info(message: string, data?: any): void {
        this.logMessage(message, SeverityLevel.Information, data);
    }

    logData(data?: any): void {
        this.logMessage("", SeverityLevel.Information, data);
    }

    warn(message: string): void {
        this.logMessage(message, SeverityLevel.Warning);
    }

    async error(message: string, error: Error): Promise<void> {
        message = await this.createDetailedMsg(message, error);
        this.logMessage(message, SeverityLevel.Error);
    }

    async critical(message: string, error: Error): Promise<void> {
        message = await this.createDetailedMsg(message, error);
        this.logMessage(message, SeverityLevel.Critical);
    }

    private async createDetailedMsg(message: string, error: Error): Promise<string> {
        let errorDetails: string;
        if (error) {
            message = `${message} - ${error.message}`;
            if (error instanceof BaseError) {
                errorDetails = JSON.stringify(classToPlain(error));
            }
        }
        if (errorDetails) {
            message = `message - ${message} and errordetails -${errorDetails}`;
        }
        message = `${message} and error stackTraces -${error.stack}`;
        return message;
    }

    private logMessage(message: string, severity: SeverityLevel, data?: any): void {
        const env = process.env["environment"];
        let _data = "";
        if (data) {
            if (typeof data === "string") {
                _data = data;
            } else {
                _data = JSON.stringify(classToPlain(data));
            }
        }
        if (env === "unittest") {
            return;
        } else if (env === "local") {
            console.log(message, _data);
        } else {
            this.client?.trackTrace({ message: `${message}, ${_data}`, severity });
        }
    }
}
