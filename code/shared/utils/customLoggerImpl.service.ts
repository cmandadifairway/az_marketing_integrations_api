import "reflect-metadata";

import { CustomLogger } from "./customLogger.service";
import { injectable } from "inversify";
import * as appInsights from "applicationinsights";
import { SeverityLevel } from "applicationinsights/out/Declarations/Contracts";
import { BaseError } from "../model/baseError.model";
import { classToPlain } from "class-transformer";


@injectable()
 export class CustomLoggerImpl implements CustomLogger{
      private readonly env=process.env["environment"];
      private readonly client: appInsights.TelemetryClient = appInsights.defaultClient;
      private readonly LogLevelMap:Map<string,number[]>=new Map([
        ["DEBUG",[SeverityLevel.Verbose,SeverityLevel.Information,SeverityLevel.Warning,SeverityLevel.Error,SeverityLevel.Critical]],
        ["INFO",[SeverityLevel.Information,SeverityLevel.Warning,SeverityLevel.Error,SeverityLevel.Critical]],
        ["WARN",[SeverityLevel.Warning,SeverityLevel.Error,SeverityLevel.Critical]],
        ["ERROR",[SeverityLevel.Error,SeverityLevel.Critical]]
      ]);
     trace(message: string): void {
      this.logMessage(message,SeverityLevel.Verbose);
    }
    info( message: string): void {
      this.logMessage(message,SeverityLevel.Information);
    }
    warn(message: string): void {
      this.logMessage(message,SeverityLevel.Warning);
    }
   async error(message: string, error: Error): Promise<void> {
      message=await this.createDetailedMsg(message, error);
      this.logMessage(message,SeverityLevel.Error);
      this.trackException(error,SeverityLevel.Error);
       
   }
    async critical(message: string, error: Error): Promise<void> {
      message=await this.createDetailedMsg(message, error);
      this.logMessage(message,SeverityLevel.Critical);
      this.trackException(error,SeverityLevel.Critical);
    }

    private async createDetailedMsg(message:string,error:Error): Promise<string>{
      let errorDetails:string;
      if(error){
        message=`${message} - ${error.message}`;
        if(error instanceof BaseError){
          errorDetails=JSON.stringify(classToPlain(error));
          
        }
      }
      if(errorDetails){
        message=`message - ${message} , errordetails -${errorDetails}
        and error stack trace is ${error.stack}`;
      }else{
		  message=`message - ${message} ,
		  and error stack trace is ${error.stack}`;
	  }
      return message;
    }
    private async logMessage(message: string,severity:SeverityLevel): Promise<void>{
      const isFilterRequired=await this.filterTrace(severity)
      if(!isFilterRequired){
        if(this.env==="local"){
          console.log(`${message}`);
        }else{
            this.client.trackTrace({ 
              message: `${message} `, 
              severity,
              properties: { 
                "environment":this.env ,
                "APPINFO":"APPINFO"
              }
            });
        }
      }
      
  }

   private async filterTrace (severity:SeverityLevel): Promise<boolean> {
    let loglevel=process.env["LOG_LEVEL"];
    if(!loglevel){
      loglevel="ERROR";
    }
    if (loglevel && this.LogLevelMap.get(loglevel).includes(severity)) {
        return false;
    }
  
    return true;
  }
  private async trackException(error:Error,severity:SeverityLevel): Promise<void>{
    if(this.env!=="local"){
        this.client.trackException({exception:error,severity})
      }
    }
}
