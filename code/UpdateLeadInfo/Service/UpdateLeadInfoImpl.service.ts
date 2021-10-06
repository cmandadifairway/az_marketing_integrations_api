import { ServiceBase } from "../../shared/services/serviceBase";
import { UpdateLeadInfoService } from "./UpdateLeadInfo.service";
import { LeadDetailsDao } from "../Model/leadDetailsDao";
import { LeadDataService } from "../../shared/services/leads/repository/leadDataAccess";
import { TYPES } from "../../shared/inversify/types";
import { Response } from "../../shared/model/response";
import { UpdateLeadInfoRequest } from "../Model/updateLeadInfoRequest";

export class UpdateLeadInfoImpl extends ServiceBase implements UpdateLeadInfoService {
    private readonly leadDataService = this.resolve<LeadDataService>(TYPES.LeadDataService);

    async updateLeadInfo(data: UpdateLeadInfoRequest): Promise<Response> {
        const updateLeadInfoObj = new LeadDetailsDao();
        const currentDate = new Date().toISOString();
        updateLeadInfoObj.leadID = data.id;
        updateLeadInfoObj.leadRating = data.leadRating || null;
        updateLeadInfoObj.referral = data.referral
            ? {
                  method: data.referral,
                  referredTo: data.referredTo || null,
                  referredDT: currentDate,
              }
            : null;
        updateLeadInfoObj.leadNotes = data.leadNotes
            ? [
                  {
                      note: data.leadNotes,
                      noteDT: currentDate,
                  },
              ]
            : [];
        updateLeadInfoObj.loanStatus = [];
        if (data.loanStatus) {
            for (let i = 0, len = data.loanStatus.length; i < len; i++) {
                const loanStatus = data.loanStatus
                    ? {
                          statusName: data.loanStatus[i],
                          statusDT: currentDate,
                      }
                    : null;
                updateLeadInfoObj.loanStatus.push(loanStatus);
            }
        }
        updateLeadInfoObj.lastUpdated = currentDate;

        const updateQuery = this.updateQueryBuilder(updateLeadInfoObj);
        return await this.leadDataService.updateLead(updateLeadInfoObj.leadID, updateQuery);
    }

    private updateQueryBuilder(data: LeadDetailsDao): object {
        const updateQuery = {
            $push: {
                loanStatus: { $each: data.loanStatus },
                leadNotes: { $each: data.leadNotes },
            },
        };
        let obj = { lastUpdated: data.lastUpdated };
        if (data.leadRating) {
            obj["leadRating"] = data.leadRating;
        }
        if (data.referral) {
            updateQuery["$push"]["referral"] = data.referral;
        }
        updateQuery["$set"] = obj;
        return updateQuery;
    }
}
