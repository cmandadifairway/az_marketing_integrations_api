import "reflect-metadata";
import * as appInsights from "applicationinsights";
appInsights.setup()// assuming ikey is in env var
    .setAutoDependencyCorrelation(true,true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .start();
const appInsightClient = appInsights.defaultClient;
import * as HttpStatusCodes from "http-status-codes";
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import container from "../inversify.config";
import { CustomLogger } from "../shared/utils/customLogger.service";
import { TYPES } from "../shared/inversify/types";
import { ResponseModel } from "../shared/model/response.model";
import { BaseError } from "../shared/model/baseError.model";
import { ApplicationError } from "../shared/model/appError.model";
import { classToPlain } from "class-transformer";
import { StatusInfoService } from "./service/statusinfoservice.service";
import { StatusInfo } from "./model/statusinfo.model";
import { AppConfigService } from "../shared/service/appconfig/appconfig.service";


const appConfigService: AppConfigService = container.get<
  AppConfigService
>(TYPES.AppConfigService);

const healthCheck: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const logger = container.get<CustomLogger>(TYPES.CustomLogger);
  logger.info("Health Check Request started.");
  const responseModel = new ResponseModel();
  const headers = {
    "Content-Type": "application/json"
  }
  
  responseModel.setResponseHeader(headers);
  try{

      const statusInfoService = container.get<StatusInfoService>(TYPES.StatusInfoService);
      const statusInfo: StatusInfo = await statusInfoService.getStatusInfo();
      responseModel.setResponseBody(JSON.stringify(classToPlain(statusInfo)));
      responseModel.setResponseStatus(HttpStatusCodes.OK);
  } catch (error) {
        logger.error(`Error in Http Trigger function healthcheck -index file::`, error);
        const errorResponseObj = await errorResponse(`Error in health check `
            , "APP_ERROR", HttpStatusCodes.INTERNAL_SERVER_ERROR, context.traceContext.traceparent, error);
        responseModel.setResponseBody(JSON.stringify(classToPlain(errorResponseObj)));
        responseModel.setResponseStatus(errorResponseObj.getStatusCode());
    }
  prepareResponse(context, responseModel);

};

const errorResponse = async (customMessage: string, errorName: string,
  statusCode: number, requestId: string, error?: Error)
  : Promise<BaseError> => {

  if (error instanceof BaseError) {
      error.setRequestId(requestId);
      return error;

  } else {
      let errorDescription: string;
      if (error && error.message) {
          errorDescription = error.message;
      }
      return new ApplicationError(error, errorName, statusCode,
          customMessage, requestId, errorDescription);
  }
};

const prepareResponse = (context: Context, responseModel: ResponseModel): void => {
  context.res.headers = responseModel.getResponseHeader();
  context.res.status = responseModel.getResponseStatus();
  context.res.body = responseModel.getResponseBody();

};

const httpTrigger: AzureFunction =  async function contextPropagatingHttpTrigger(context, req) {
  // Start an AI Correlation Context using the provided Function context
  const correlationContext = appInsights.startOperation(context, req);
  // Wrap the Function runtime with correlationContext
  return appInsights.wrapWithCorrelationContext(async () => {
    appInsightClient.context.tags[appInsightClient.context.keys.cloudRole] = process.env["WEBSITE_SITE_NAME"];
    //set the name of funtion to define the operationName
    appInsightClient.context.tags[appInsightClient.context.keys.operationName] = "HealthCheck";
      const startTime = Date.now(); // Start trackRequest timer
      appInsightClient.trackTrace({message:`lets start the correlation - 
          OperationParentId::  ${correlationContext.operation.parentId} 
          - TRACEPARENT:: ${context.traceContext.traceparent} `});
      // Run the Function
      await healthCheck(context, req);
      appInsightClient.trackTrace({message:`lets end the correlation - OperationParentId - ${correlationContext.operation.parentId} 
      - TRACEPARENT-${context.traceContext.traceparent} `});
      // Track Request on completion
      appInsightClient.trackRequest({
          name: context.req.method + " " + context.req.url,
          resultCode: context.res.status,
          success: true,
          url: req.url,
          duration: Date.now() - startTime,
          id: correlationContext.operation.parentId,
          
      });
      appInsights.defaultClient.flush();
  }, correlationContext)();
};
export default httpTrigger;