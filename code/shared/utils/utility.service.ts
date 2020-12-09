import "reflect-metadata";
import container from "../../inversify.config";
import { TYPES } from "../inversify/types";
import { injectable } from "inversify";
import axios, { Method, AxiosResponse } from "axios";
import { ErrorHandlerService } from "../service/exception/errorHandler.service";
import { CustomLogger } from "./customLogger.service";
@injectable()
export class UtilityService {
  private readonly logger = container.get<CustomLogger>(TYPES.CustomLogger);
  public getBoolean(value: string): boolean {
    switch (value) {
      case "true":
      case "yes":
      case "y":
      case "Y":
        return true;
      default:
        return false;
    }
  }
  public async axiosCall(
    endpoint: string,
    method: Method,
    config: unknown,
    body?: unknown
  ): Promise<AxiosResponse> {
    this.logger.info(
      `UtilityService.axiosCall -> config are  ${JSON.stringify(
        config
      )} and body is ${JSON.stringify(body)}`
    );
    let responseObj: AxiosResponse;

    try {
      if (body) {
        responseObj = await axios[method.toLowerCase()](endpoint, body, config);
      } else {
        responseObj = await axios[method.toLowerCase()](endpoint, config);
      }
    } catch (error) {
      const axiosErrorHandler = container.get<ErrorHandlerService>(
        TYPES.AxiosErrorHandler
      );
      axiosErrorHandler.handleError(
        error,
        `error while making integration call to URL:- ${endpoint}`
      );
    }

    return responseObj;
  }
}
