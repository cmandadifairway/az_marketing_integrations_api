import { LeadNote } from "../../shared/model/leadNote";
import { LoanStatus } from "../../shared/model/loanStatus";
import { Referral } from "../../shared/model/referral";

export class LeadDetailsDao {
    leadID: string;
    leadRating: number;
    leadNotes: LeadNote[];
    loanStatus: LoanStatus[];
    lastUpdated: string;
    referral?: Referral;
}
