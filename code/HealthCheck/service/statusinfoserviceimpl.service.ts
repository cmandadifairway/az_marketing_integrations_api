import container from "../../inversify.config";
import { TYPES } from "../../shared/inversify/types";
import { AppConfigService } from "../../shared/service/appconfig/appconfig.service";
import { injectable } from "inversify";
import { StatusInfoService } from "./statusinfoservice.service";
import { StatusInfo } from "../model/statusinfo.model";
import { Info } from "../model/info.model";
import { KeyVaultService } from "../../shared/service/keyvault/keyvault.service";

@injectable()
export class StatusInfoServiceImpl implements StatusInfoService {

    appConfigService: AppConfigService = container.get<
        AppConfigService
    >(TYPES.AppConfigService);

    keyVaultService: KeyVaultService = container.get<KeyVaultService>(
        TYPES.KeyVaultService
    );

    async getStatusInfo(): Promise<StatusInfo> {
        const statusInfo: StatusInfo = new StatusInfo();
        statusInfo.healthy = true;

        statusInfo.infos = new Array<Info>();

        let info: Info = new Info();
        info.key = "environment";
        info.value = process.env["environment"];
        statusInfo.infos.push(info);

        info = new Info();
        info.key = "app-config-endpoint";
        info.value = (process.env["app-config-endpoint"]?process.env["app-config-endpoint"]:"NOT DEFINED");
        statusInfo.infos.push(info);

        info = new Info();
        info.key = "global-config-endpoint";
        info.value = (process.env["global-config-endpoint"]?process.env["global-config-endpoint"]:"NOT DEFINED");
        statusInfo.infos.push(info);

        info = new Info();
        info.key = "KeyVault-url";
        info.value = (process.env["KEY_VAULT_URL"]?process.env["KEY_VAULT_URL"]:"NOT DEFINED");
        statusInfo.infos.push(info);

        return statusInfo;
    }
}