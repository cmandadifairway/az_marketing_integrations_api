import { Context } from "@azure/functions";

export interface CustomLogger{
   trace(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string,error: Error): void;
	critical(message: string,error: Error): void;
}
