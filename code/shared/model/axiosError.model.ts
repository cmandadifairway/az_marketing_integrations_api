import { BaseError } from "./baseError.model";

export class AxiosError extends BaseError{

   constructor(error:Error,statusCode?: number,message?: string,requestId?: string,description?: string){
        super(error,"INTEGRATION_ERROR",statusCode,message,requestId,description);
    }
 }
 