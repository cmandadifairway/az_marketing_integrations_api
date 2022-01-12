import * as appInsights from "applicationinsights";
import { Context } from "@azure/functions";
import { ConfigBase } from "../serviceBase";
import { TYPES } from "../../inversify/types";
import { AppConfigService } from "../appConfiguration/appConfig.service";

export class AppInsightsService extends ConfigBase {
    private readonly appConfigService = this.resolve<AppConfigService>(TYPES.AppConfigService);

    public async StartService(context: Context, functionName: string) {
        const env = this.appConfigService.getConfiguration("environment");
        if (env !== "unittest" && env !== "local") {
            try {
                const appInsightsKey = process.env["APPINSIGHTS_INSTRUMENTATIONKEY"];
                appInsights
                    .setup(appInsightsKey)
                    .setAutoDependencyCorrelation(true)
                    .setAutoCollectRequests(true)
                    .setAutoCollectPerformance(true)
                    .setAutoCollectExceptions(true)
                    .setAutoCollectDependencies(true)
                    .setAutoCollectConsole(true)
                    .setUseDiskRetryCaching(true)
                    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C);

                const appInsightClient: appInsights.TelemetryClient = appInsights.defaultClient;
                appInsightClient.setAutoPopulateAzureProperties(true);
                appInsights.start();

                appInsightClient.commonProperties["requestId"] = context.invocationId;
                appInsightClient.commonProperties["function"] = functionName;
                appInsightClient.commonProperties["APPINFO"] = "APPINFO::";
                // Use this with "tagOverrides" to correlate custom telemetry to the parent function invocation.
                const operationIdKey = appInsightClient.context.keys.operationId;
                appInsightClient.context.tags[operationIdKey] = context.traceContext.traceparent;
            } catch (error) {
                // Do not use custom logger as that creates a loop and breaks all logging
                console.log("APPINFO::Error From AppInsights Service Module", error);
            }
        }
    }
}
