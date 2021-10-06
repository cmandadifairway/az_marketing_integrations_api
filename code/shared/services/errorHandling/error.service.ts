export class ErrorService {
    static getErrorStack(error) {
        let errorMsg = error;
        if (error.stack) {
            errorMsg = error.stack;
        }
        return errorMsg;
    }

    static getFriendlyErrorMsg() {
        return "An error has occurred, please check log for details.";
    }

    static invalidRequest = "Invalid request";
    static genericError = { Error: true, data: ErrorService.getFriendlyErrorMsg() };
}
