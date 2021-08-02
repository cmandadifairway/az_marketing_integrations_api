import { CustomLoggerImpl } from "../../utils/customLoggerImpl.service";
import { AxiosErrorHandlerServiceImpl } from "./axiosErrorHandlerImpl.service";
import { BaseError } from "../../model/baseError.model";
import { AxiosErrorResponseMock } from "../../../testing/mock/AxiosErrorResponseMock.model";

describe("handleError Method testing", () => {
    jest.spyOn(CustomLoggerImpl.prototype, "error").mockImplementation(() => Promise.resolve());
    test("test handleError throws Base Error", async () => {
        const errorHandler = new AxiosErrorHandlerServiceImpl();
        try {
            errorHandler.handleError(
                new Error("Something happened in setting up the request that triggered an Error"),
                "Failure"
            );
        } catch (error) {
            expect(error).toBeInstanceOf(BaseError);
        }
    });
    test("test handleError throws error with proper message when no Axios Response", async () => {
        const errorHandler = new AxiosErrorHandlerServiceImpl();
        try {
            errorHandler.handleError(
                new Error("Something happened in setting up the request that triggered an Error"),
                "Failure"
            );
        } catch (error) {
            expect(error.name).toEqual("INTEGRATION_ERROR");
        }
    });

    test("test handleError handles Axios error with response code ", async () => {
        const errorHandler = new AxiosErrorHandlerServiceImpl();
        try {
            const axiosResponse = {
                status: 400,
                statusText: "Bad Request",
                data: {
                    error_description: "Invalid username or password. Please try again.",
                    error: "invalid_grant",
                },
            };
            const axiosError = new AxiosErrorResponseMock("AxiosResponse", "Bad Request", null, axiosResponse);
            errorHandler.handleError(axiosError, "Failure");
        } catch (error) {
            expect(error.statusCode).toEqual(400);
        }
    });

    test("test handleError handles Axios error with response data ", async () => {
        const errorHandler = new AxiosErrorHandlerServiceImpl();
        try {
            const axiosResponse = {
                status: 400,
                statusText: "Bad Request",
                data: {
                    error_description: "Invalid username or password. Please try again.",
                    error: "invalid_grant",
                },
            };
            const axiosError = new AxiosErrorResponseMock("AxiosResponse", "Bad Request", null, axiosResponse);
            errorHandler.handleError(axiosError, "Failure");
        } catch (error) {
            const errorData = {
                error_description: "Invalid username or password. Please try again.",
                error: "invalid_grant",
            };
            expect(error.description).toEqual(errorData);
        }
    });

    test("test handleError handles Axios error with no response for give request ", async () => {
        const errorHandler = new AxiosErrorHandlerServiceImpl();
        try {
            const axiosRequest = {
                method: "POST",
            };
            const axiosError = new AxiosErrorResponseMock("AxiosResponse", "Bad Request", axiosRequest);
            errorHandler.handleError(axiosError, "Failure");
        } catch (error) {
            const errorData = "The request was made but no response was received";
            expect(error.description).toEqual(errorData);
            expect(error.statusCode).toEqual(500);
        }
    });
});
