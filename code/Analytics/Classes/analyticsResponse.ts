import { AnalyticsData } from "../../shared/model/AnalyticsData";
import { Response } from "../../shared/model/response";

export class AnalyticsResponse implements Response {
    data: { [key: string]: AnalyticsData };
    Error: boolean;
}
