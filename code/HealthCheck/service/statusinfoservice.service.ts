import { StatusInfo } from "../model/statusinfo.model";

export interface StatusInfoService {
    getStatusInfo(): Promise<StatusInfo>;
}