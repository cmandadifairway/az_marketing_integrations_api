import { ErrorHandlerService } from "./errorHandler.service";
import { injectable } from "inversify";
import  container  from "../../../inversify.config";
import { TYPES } from "../../inversify/types";
import { CustomLogger } from "../../utils/customLogger.service";



@injectable()
export class BaseErrorHandlerServiceImpl implements ErrorHandlerService{
    private readonly logger= container.get<CustomLogger>(TYPES.CustomLogger);
    async handleError(error: Error,message:string): Promise<void> {
        this.logger.error(message,error);
        //build any logic if required
        //  await sendMailToAdminIfCritical();
    }
}
