import { AnalyticsRequest } from "../Classes/analyticsRequest";
import { AnalyticsResponse } from "../Classes/analyticsResponse";

export interface AnalyticsService {
    getAnalytics: (requestData: AnalyticsRequest) => Promise<AnalyticsResponse>;
}
