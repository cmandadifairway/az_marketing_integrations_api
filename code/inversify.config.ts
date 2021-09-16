import "reflect-metadata";
import { Container } from "inversify";
import { KeyVaultService } from "./shared/service/keyvault/keyvault.service";
import { KeyVaultServiceImpl } from "./shared/service/keyvault/keyvaultImpl.service";
import { TYPES } from "./shared/inversify/types";
import { AppConfigService } from "./shared/service/appconfig/appconfig.service";
import { AppConfigServiceImpl } from "./shared/service/appconfig/appconfigimpl.service";
import { CustomLogger } from "./shared/utils/customLogger.service";
import { CustomLoggerImpl } from "./shared/utils/customLoggerImpl.service";
import { UtilityService } from "./shared/utils/utility.service";
import { StatusInfoService } from "./HealthCheck/service/statusinfoservice.service";
import { StatusInfoServiceImpl } from "./HealthCheck/service/statusinfoserviceimpl.service";

const container = new Container();

container.bind<KeyVaultService>(TYPES.KeyVaultService).to(KeyVaultServiceImpl).inSingletonScope();

container.bind<AppConfigService>(TYPES.AppConfigService).to(AppConfigServiceImpl).inSingletonScope();
container.bind<CustomLogger>(TYPES.CustomLogger).to(CustomLoggerImpl).inSingletonScope();
container.bind<UtilityService>(TYPES.UtilityService).to(UtilityService).inSingletonScope();
container.bind<StatusInfoService>(TYPES.StatusInfoService).to(StatusInfoServiceImpl).inSingletonScope();

export { container };
