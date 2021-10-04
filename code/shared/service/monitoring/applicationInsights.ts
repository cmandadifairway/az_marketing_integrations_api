import * as appInsights from "applicationinsights";
import { Context } from "@azure/functions";
import { ConfigBase } from "../serviceBase";
import { TYPES } from "../../inversify/types";
import { AppConfigService } from "../appconfig/appconfig.service";

export class AppInsightsService extends ConfigBase {
    private readonly appConfigService = this.resolve<AppConfigService>(TYPES.AppConfigService);

    public async startService(context: Context, functionName: string): Promise<void> {
        const env = this.appConfigService.getConfiguration("environment");
        if (env !== "unittest" && env !== "local") {
            try {
                appInsights
                    .setup()
                    .setAutoDependencyCorrelation(true, true)
                    .setAutoCollectDependencies(true)
                    .setAutoCollectConsole(true)
                    .setUseDiskRetryCaching(true)
                    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
                    .start();
                const appInsightClient = appInsights.defaultClient;
                let requestId: string = context.invocationId;
                appInsightClient.commonProperties["requestId"] = requestId;
                appInsightClient.commonProperties["function"] = functionName;
                appInsightClient.commonProperties["APPINFO"] = "APPINFO::";
                // Use this with "tagOverrides" to correlate custom telemetry to the parent function invocation.
                const operationIdKey = appInsightClient.context.keys.operationId;
                appInsightClient.context.tags[operationIdKey] = context.traceContext.traceparent;
            } catch (error) {
                // Do not use custom logger as that creates a loop and breaks all logging
                console.log("APPINFO::Error From AppInsightsService Service Module while starting service", error);
            }
        }
    }

    public start(): void {
        const env = this.appConfigService.getConfiguration("environment");
        if (env !== "unittest" && env !== "local") {
            try {
                appInsights
                    .setup()
                    .setAutoDependencyCorrelation(true, true)
                    .setAutoCollectDependencies(true)
                    .setAutoCollectConsole(true)
                    .setUseDiskRetryCaching(true)
                    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
                    .start();
            } catch (error) {
                // Do not use custom logger as that creates a loop and breaks all logging
                console.log("APPINFO::Error From AppInsightsService Service Module while starting service", error);
            }
        }
    }

    public async setupProperties(context: Context, functionName: string): Promise<void> {
        const env = this.appConfigService.getConfiguration("environment");
        if (env !== "unittest" && env !== "local") {
            try {
                const appInsightClient = appInsights.defaultClient;
                let requestId: string = context.invocationId;
                appInsightClient.commonProperties["requestId"] = requestId;
                appInsightClient.commonProperties["function"] = functionName;
                appInsightClient.commonProperties["APPINFO"] = "APPINFO::";
                // Use this with "tagOverrides" to correlate custom telemetry to the parent function invocation.
                const operationIdKey = appInsightClient.context.keys.operationId;
                appInsightClient.context.tags[operationIdKey] = context.traceContext.traceparent;
            } catch (error) {
                // Do not use custom logger as that creates a loop and breaks all logging
                console.log("APPINFO::Error From AppInsightsService Service Module while setting up properties", error);
            }
        }
    }
}
