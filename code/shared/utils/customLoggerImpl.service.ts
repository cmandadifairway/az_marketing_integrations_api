import { CustomLogger } from "./customLogger.service";
import { ConfigBase } from "../service/serviceBase";
import * as appInsights from "applicationinsights";
import { SeverityLevel } from "applicationinsights/out/Declarations/Contracts";
import { BaseError } from "../model/baseError.model";
import { classToPlain } from "class-transformer";

export class CustomLoggerImpl extends ConfigBase implements CustomLogger {
    private readonly env = process.env["environment"] || "";
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
        this.trackException(error, SeverityLevel.Error);
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

    private async logMessage(message: string, severity: SeverityLevel, data?: any): Promise<void> {
        let _data = "";
        if (data) {
            if (typeof data === "string") {
                _data = data;
            } else {
                _data = JSON.stringify(classToPlain(data));
            }
        }
        if (this.env === "unittest") {
            return;
        } else if (this.env === "local") {
            console.log(`${message}, ${_data}`);
        } else {
            this.client?.trackTrace({ message: `${message}, ${_data}`, severity });
        }
    }

    private async trackException(error: Error, severity: SeverityLevel): Promise<void> {
        if (this.env === "unittest") {
            return;
        } else if (this.env !== "local") {
            this.client?.trackException({ exception: error, severity });
        }
    }
}
