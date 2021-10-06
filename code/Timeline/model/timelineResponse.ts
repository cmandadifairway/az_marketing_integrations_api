import { Response } from "../../shared/model/response";

export class TimelineResponse implements Response {
    data: Array<TimelineData>;
    Error: boolean;
}
export type TimelineData = {
    eventName: string;
    eventTimestamp: string;
    leadId?: string;
};
