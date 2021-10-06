import { Response } from "../../shared/model/response";
import { UpdateLeadInfoRequest } from "../Model/updateLeadInfoRequest";

export interface UpdateLeadInfoService {
    updateLeadInfo: (data: UpdateLeadInfoRequest) => Promise<Response>;
}
