import { CustomLogger } from "../../shared/utils/customLogger.service";
import { Context } from "@azure/functions";
import { injectable } from "inversify";

@injectable()
export class CustomLoggerMockImpl implements CustomLogger{
    setContext(context: Context): void {
    }
    trace(message: string): void {
       
    }
    info(message: string): void {
    }
    warn(message: string): void {
    }
    error(message: string, error: Error): void {
    }
	critical(message: string, error: Error): void {
	}
    
}