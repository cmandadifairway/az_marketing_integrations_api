import { injectable } from "inversify";
import { StatusInfoService } from "./statusinfoservice.service";
import { StatusInfo } from "../model/statusinfo.model";
import { Info } from "../model/info.model";

@injectable()
export class StatusInfoServiceImpl implements StatusInfoService {
    async getStatusInfo(): Promise<StatusInfo> {
        const statusInfo: StatusInfo = new StatusInfo();
        statusInfo.healthy = true;

        statusInfo.infos = new Array<Info>();

        let info: Info = new Info();
        info.key = "environment";
        info.value = process.env["environment"];
        statusInfo.infos.push(info);

        return statusInfo;
    }
}
