import { LeadsRequest } from "./../classes/leadsRequest";
import { ServiceBase } from "../../shared/services/serviceBase";
import { LeadFilterService } from "./LeadFilter.service";

export class LeadFilterServiceImpl extends ServiceBase implements LeadFilterService {
    public async getOptionalFilters(requestData: LeadsRequest): Promise<any[]> {
        let filter = [];
        const statusFilters = this.getStatusFilters(requestData);
        filter = filter.concat(statusFilters);
        const dateRangeFilters = this.getDateRangeFilters(requestData);
        filter = filter.concat(dateRangeFilters);
        const loanStatusFilters = this.getLoanStatusFilters(requestData);
        filter = filter.concat(loanStatusFilters);
        const liveTransferFilters = this.getLiveTransferFilters(requestData);
        filter = filter.concat(liveTransferFilters);

        return filter;
    }

    private getStatusFilters(requestData: LeadsRequest) {
        let filter = [];
        if (requestData.leadRating) {
            const rating = Number(requestData.leadRating);
            filter.push({ leadRating: rating });
        }

        if (requestData.currentLeadStatus) {
            filter.push({ currentLeadStatus: { $in: requestData.currentLeadStatus } });
        }

        if (requestData.isEngaged) {
            filter.push({
                $or: [
                    { "activity.title": { $regex: ".*Inbound.*" } },
                    { "activity.title": "Live Transfer Successful" },
                ],
            });
        }

        if (requestData.loanType && requestData.loanType.length > 0) {
            filter.push({ leadType: { $in: requestData.loanType } });
        }

        if (requestData.loanSource && requestData.loanSource.length > 0) {
            filter.push({ channelWebsite: { $in: requestData.loanSource } });
        }

        if (requestData.state && requestData.state.length > 0) {
            filter.push({ state: { $in: requestData.state } });
        }
        return filter;
    }

    private getDateRangeFilters(requestData: LeadsRequest) {
        let filter = [];

        if (
            (requestData.liveTransfer && requestData.minDate && requestData.maxDate) ||
            (requestData.ltMinDate && requestData.ltMaxDate)
        ) {
            let minDate = requestData.minDate;
            let maxDate = requestData.maxDate;
            if (!minDate) {
                minDate = requestData.ltMinDate;
            }
            if (!maxDate) {
                maxDate = requestData.ltMaxDate;
            }
            filter.push({
                $and: [
                    {
                        activity: {
                            $elemMatch: {
                                title: "Live Transfer Attempt",
                                activityDateTime: this.getGteObj(minDate),
                            },
                        },
                    },
                    {
                        activity: {
                            $elemMatch: {
                                title: "Live Transfer Attempt",
                                activityDateTime: this.getLteObj(maxDate),
                            },
                        },
                    },
                ],
            });
        }
        if (requestData.createdMinDate && requestData.createdMaxDate) {
            filter.push({
                $and: [
                    { leadCreateDt: this.getGteObj(requestData.createdMinDate) },
                    { leadCreateDt: this.getLteObj(requestData.createdMaxDate) },
                ],
            });
        }
        if (requestData.qualifiedMinDate && requestData.qualifiedMaxDate) {
            filter.push({
                $and: [
                    {
                        leadStatus: {
                            $elemMatch: {
                                type: "Qualified Lead",
                                statusDateTime: this.getGteObj(requestData.qualifiedMinDate),
                            },
                        },
                    },
                    {
                        leadStatus: {
                            $elemMatch: {
                                type: "Qualified Lead",
                                statusDateTime: this.getLteObj(requestData.qualifiedMaxDate),
                            },
                        },
                    },
                ],
            });
        }
        if (filter.length > 0) {
            return { $or: filter };
        }
        return filter;
    }

    private getLoanStatusFilters(requestData: LeadsRequest) {
        let filter = [];
        if (requestData.loanStatus) {
            filter.push({
                "loanStatus.statusName": { $in: requestData.loanStatus },
            });
        }
        return filter;
    }

    private getLiveTransferFilters(requestData: LeadsRequest) {
        let filter = [];
        if (requestData.liveTransfer && Array.isArray(requestData.liveTransfer)) {
            let ltFilter = [];
            requestData.liveTransfer.forEach((option: string) => {
                let title = "";
                switch (option.toLowerCase()) {
                    case "successful":
                        title = "Live Transfer Successful";
                        break;
                    case "unsuccessful":
                        title = "Live Transfer Unsuccessful";
                        break;
                    default:
                        break;
                }
                ltFilter.push({ "activity.title": title });
            });
            filter.push({ $or: ltFilter });
        }
        return filter;
    }

    private getGteObj(minDate: string) {
        let gteMinDate = new Date(minDate).toISOString();
        gteMinDate = this.replaceISOtime(gteMinDate, "T00:00:00.000Z");
        const gteObj = { $gte: gteMinDate };
        return gteObj;
    }

    private getLteObj(maxDate: string) {
        let lteMaxDate = new Date(maxDate).toISOString();
        lteMaxDate = this.replaceISOtime(lteMaxDate, "T23:59:59.999Z");
        const lteObj = { $lte: lteMaxDate };
        return lteObj;
    }

    private replaceISOtime(isoDate: string, replacementTime: string) {
        let newDateStr = isoDate;
        const split = isoDate.split("T");
        if (split.length > 0) {
            newDateStr = split[0] + replacementTime;
        }
        return newDateStr;
    }
}
