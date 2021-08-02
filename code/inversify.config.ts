import "reflect-metadata";
import { Container } from "inversify";
import { KeyVaultService } from "./shared/service/keyvault/keyvault.service";
import { KeyVaultServiceImpl } from "./shared/service/keyvault/keyvaultImpl.service";
import { TYPES } from "./shared/inversify/types";
import { AppConfigService } from "./shared/service/appconfig/appconfig.service";
import { AppConfigServiceImpl } from "./shared/service/appconfig/appconfigimpl.service";
import { BaseErrorHandlerServiceImpl } from "./shared/service/exception/baseErrorHandlerImpl.service";
import { ErrorHandlerService } from "./shared/service/exception/errorHandler.service";
import { AxiosErrorHandlerServiceImpl } from "./shared/service/exception/axiosErrorHandlerImpl.service";
import { CustomLogger } from "./shared/utils/customLogger.service";
import { CustomLoggerImpl } from "./shared/utils/customLoggerImpl.service";
import { UtilityService } from "./shared/utils/utility.service";
import { StatusInfoService } from "./HealthCheck/service/statusinfoservice.service";
import { StatusInfoServiceImpl } from "./HealthCheck/service/statusinfoserviceimpl.service";
import { OAuthTokenService } from "./shared/service/oauth/oauthtoken.service";
import { OAuthTokenSeviceImpl } from "./shared/service/oauth/oauthtokenimpl.service";

const container = new Container();

container.bind<KeyVaultService>(TYPES.KeyVaultService).to(KeyVaultServiceImpl).inSingletonScope();

container.bind<AppConfigService>(TYPES.AppConfigService).to(AppConfigServiceImpl).inSingletonScope();
container.bind<ErrorHandlerService>(TYPES.BaseErrorHandler).to(BaseErrorHandlerServiceImpl).inSingletonScope();
container.bind<ErrorHandlerService>(TYPES.AxiosErrorHandler).to(AxiosErrorHandlerServiceImpl).inSingletonScope();
container.bind<CustomLogger>(TYPES.CustomLogger).to(CustomLoggerImpl).inSingletonScope();
container.bind<UtilityService>(TYPES.UtilityService).to(UtilityService).inSingletonScope();
container.bind<OAuthTokenService>(TYPES.OAUTH).to(OAuthTokenSeviceImpl).inSingletonScope();
container.bind<StatusInfoService>(TYPES.StatusInfoService).to(StatusInfoServiceImpl).inSingletonScope();

export default container;
