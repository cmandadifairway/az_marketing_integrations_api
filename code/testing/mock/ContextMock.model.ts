import { Context, ExecutionContext, TraceContext, HttpRequest,BindingDefinition } from "@azure/functions";
    
  
export class ContextMock implements Context{
    done(err?: string | Error, result?: any): void {
        throw new Error("Method not implemented.");
    }
    invocationId: string;
    executionContext: ExecutionContext;
    bindings: { [key: string]: any; };
    bindingData: { [key: string]: any; };
    traceContext: TraceContext;
    bindingDefinitions:BindingDefinition[];
    log;
    req?: HttpRequest;
    res?: { [key: string]: any; };
    
}
