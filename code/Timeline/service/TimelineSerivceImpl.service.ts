import { ServiceBase } from "../../shared/services/serviceBase";
import { TimelineService } from "./Timeline.service";
import { TYPES } from "../../shared/inversify/types";
import { TimelineRequest } from "../model/timelineRequest";
import { TimelineData, TimelineResponse } from "../model/timelineResponse";
import { EventName, EventNameText } from "../model/eventName";
import { BigQueryService } from "../../shared/services/bigQuery/bigQuery";
import { UtilityService } from "../../shared/utils/utility.service";
import { LoanOfficerDataService } from "../../shared/services/loanOfficer/repository/loanOfficerDataAccess";

export class TimelineImpl extends ServiceBase implements TimelineService {
    private readonly bigQueryService = this.resolve<BigQueryService>(TYPES.BigQueryService);
    private readonly utility = this.resolve<UtilityService>(TYPES.UtilityService);
    private readonly loDataService = this.resolve<LoanOfficerDataService>(TYPES.LoanOfficerDataService);

    private readonly notTimelineEvents = [
        EventName.user_engagement,
        EventName.screen_view,
        EventName.leads_information,
        EventName.session_start,
        EventName.login_success,
        EventName.app_update,
        EventName.os_update,
        EventName.first_open,
        EventName.app_remove,
        EventName.logout,
        EventName.notification_receive,
        EventName.notificaton_open,
        EventName.notification_dismiss,
        EventName.notification_foreground,
        EventName.ff_banner_viewbanner,
        EventName.ff_livetransfer_tap,
        EventName.ff_dashboard_tap_btbleads,
    ];

    async getTimelineService(request: TimelineRequest): Promise<TimelineResponse> {
        const projectId = "fairwayfirst-42aee";
        const notIncludedEvents = this.notIncluded(this.notTimelineEvents);

        const user_id = request.loEmail;
        let minDate = this.utility.convertStringToDate(request.minDate);
        let maxDate = this.utility.convertStringToDate(request.maxDate);

        let minDateString = this.convertToYYYYMMDD(minDate);
        let maxDateString = this.convertToYYYYMMDD(maxDate);

        const sqlQuery = `SELECT
            TIMESTAMP_MICROS(event_timestamp) as event_datetime_utc,
            LOWER(event_name) as event_name,
            event_params
        FROM \`${projectId}.analytics_247936889.events_*\`
        WHERE
            user_id = "${user_id}"
            AND _TABLE_SUFFIX BETWEEN "${minDateString}" AND "${maxDateString}"
            AND LOWER(event_name) NOT IN (${notIncludedEvents})
        ORDER BY event_datetime_utc desc`;

        const options = {
            // Location must match that of the dataset(s) referenced in the query.
            location: "US",
        };

        // Query returns an array of an array of objects
        const [results] = await this.bigQueryService.queryData(sqlQuery, options);

        let responses: Array<TimelineData> = [];
        let userParams = {};

        for (const result of results) {
            if (!EventNameText[result.event_name]) {
                continue;
            }

            const userParam = result.event_params.find((param: { key: string }) => param.key === "User");
            if (!userParam) {
                console.log(`${result.event_name} doesn't have a user param`);
            }
            const userEmail = userParam?.value?.string_value || "";

            let eventText = await this.getName(userParams, result.event_name, userEmail);
            if (eventText.includes("$QueryText")) {
                const queryText = result.event_params.find((param: { key: string }) => param.key === "QueryText");
                eventText.replace("$QueryText", queryText);
            }

            let response: TimelineData = {
                eventName: eventText,
                eventTimestamp: result.event_datetime_utc?.value,
            };

            const leads = result.event_params.filter((properties: { key: string }) => properties.key === "LeadID");

            if (leads.length > 0) {
                const leadID = leads[0].value.string_value;
                response.leadId = leadID;
            }

            responses.push(response);
        }
        return { data: responses, Error: false };
    }

    private notIncluded(notIncludedEvents: EventName[]): string {
        const values = Object.keys(notIncludedEvents)
            .map((key) => notIncludedEvents[key])
            .filter((value) => typeof value === "string") as string[];
        return '"' + values.join('", "') + '"';
    }

    private convertToYYYYMMDD(date: Date) {
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 1).toString();
        var day = date.getDate().toString();
        day.length == 1 && (day = "0" + day);
        month.length == 1 && (month = "0" + month);
        var yyyymmdd = year + month + day;
        return yyyymmdd;
    }

    private async getName(userParams: any, eventName: string, loEmail?: string): Promise<string> {
        let eventText: string = EventNameText[eventName]?.valueOf() || "";
        const unknown = "Unknown";
        if (eventText.includes("$User")) {
            let name: string = unknown;
            if (loEmail && !userParams[loEmail]) {
                const loResponse = await this.loDataService.getLoanOfficer({ partitionKey: loEmail }, false);
                if (loResponse && loResponse.data) {
                    const lo = loResponse.data;
                    name = `${lo.firstName} ${lo.lastName}`;
                    userParams[loEmail] = name;
                }
            } else if (loEmail && userParams[loEmail]) {
                name = userParams[loEmail];
            }
            return eventText.replace("$User", name);
        } else {
            return eventText;
        }
    }
}
