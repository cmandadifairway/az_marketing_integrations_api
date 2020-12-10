import { BaseError } from "./baseError.model";

export class ApplicationError extends BaseError{

   constructor(error:Error,name?: string,statusCode?: number,message?: string,requestId?: string,description?: string){
        super(error,name,statusCode,message,requestId,description);
    }
 }
 