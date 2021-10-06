import { TimelineRequest } from "../model/timelineRequest";
import { TimelineResponse } from "../model/timelineResponse";

export interface TimelineService {
    getTimelineService: (request: TimelineRequest) => Promise<TimelineResponse>;
}
