import "reflect-metadata";
import { AxiosError } from "../../model/axiosError.model";
import { injectable } from "inversify";
import { BaseErrorHandlerServiceImpl } from "./baseErrorHandlerImpl.service";
import * as HttpStatusCodes from "http-status-codes";
@injectable()
export class AxiosErrorHandlerServiceImpl extends BaseErrorHandlerServiceImpl {
    handleError(error: any, message: string): Promise<void> {
        let axiosError: AxiosError;
        if (error.response) {
            axiosError = new AxiosError(error, error.response.status, error.message, null, error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            axiosError = new AxiosError(
                error,
                HttpStatusCodes.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                null,
                "The request was made but no response was received"
            );
        } else {
            // Something happened in setting up the request that triggered an Error
            axiosError = new AxiosError(
                error,
                HttpStatusCodes.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                null,
                "Something happened in setting up the request that triggered an Error"
            );
        }
        super.handleError(error, message);
        throw axiosError;
    }
}
