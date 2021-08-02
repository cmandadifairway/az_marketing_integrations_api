export interface ErrorHandlerService {
    handleError(err: Error, message?: string): Promise<void>;
}
