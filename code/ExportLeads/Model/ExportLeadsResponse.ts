import { Lead } from "../../shared/model/Lead";
import { Response } from "../../shared/model/response";

export class ExportLeadsResponse implements Response {
    data: string;
    Error: boolean;
}
