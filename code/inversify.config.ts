import "reflect-metadata";
import { WebDataApiService } from "./shared/services/totalExpert/webDataApiService";
import { MarketingEmailService } from "./shared/services/emailHelper/marketingEmailService";
import { WorkfrontMappingHelper } from "./shared/services/workFront/workfrontMappingHelper";
import { WorkfrontService } from "./shared/services/workFront/workfrontService";
import { SendGridEmailService } from "./shared/services/emailHelper/sendGridEmailService";
import { MailChimpService } from "./shared/services/mailChimp/mailChimpService";
import { DataLakeService } from "./shared/services/dataLake/dataLakeService";
import { MailChimpApiService } from "./shared/services/mailChimp/mailChimpApiService";
import { UtilityService } from "./shared/utils/utility.service";
import { Container } from "inversify";
import { CustomLogger } from "./shared/Logging/CustomLogger.service";
import { CustomLoggerImpl } from "./shared/Logging/CustomLoggerImpl.service";
import { TYPES } from "./shared/inversify/types";
import { AppInsightsService } from "./shared/services/monitoring/applicationInsights";
import { CustomValidator } from "./shared/validators/customValidator";
import { CustomValidatorImpl } from "./shared/validators/customValidatorImpl";
import { DbConnectionService } from "./shared/services/databaseConfig/databaseConn.service";
import { KeyVaultService } from "./shared/services/keyVault/keyVault.service";
import { ConfigHelper } from "./shared/utils/config.helper";
import { TotalExpertService } from "./shared/services/totalExpert/totalExpertService";

/**
 * inversify is same as implementing oops concept in .net
 * object instance will be only created once when chosen singleton option, there are other options available
 * @injectable() attribute is required in the implementing class
 */
const container = new Container();
container.bind<CustomLogger>(TYPES.CustomLogger).to(CustomLoggerImpl).inSingletonScope();
container.bind<CustomValidator>(TYPES.CustomValidator).to(CustomValidatorImpl).inSingletonScope();
container.bind<KeyVaultService>(TYPES.KeyVaultService).to(KeyVaultService).inSingletonScope();
container.bind<ConfigHelper>(TYPES.ConfigHelper).to(ConfigHelper).inSingletonScope();
container.bind<AppInsightsService>(TYPES.AppInsightsService).to(AppInsightsService).inSingletonScope();
container.bind<DbConnectionService>(TYPES.DbConnectionService).to(DbConnectionService).inSingletonScope();
container.bind<UtilityService>(TYPES.UtilityService).to(UtilityService).inSingletonScope();
container.bind<MailChimpApiService>(TYPES.MailChimpApiService).to(MailChimpApiService).inSingletonScope();
container.bind<DataLakeService>(TYPES.DataLakeService).to(DataLakeService).inSingletonScope();
container.bind<MailChimpService>(TYPES.MailChimpService).to(MailChimpService).inSingletonScope();
container.bind<WorkfrontService>(TYPES.WorkfrontService).to(WorkfrontService).inSingletonScope();
container.bind<WorkfrontMappingHelper>(TYPES.WorkfrontMappingHelper).to(WorkfrontMappingHelper).inSingletonScope();
container.bind<SendGridEmailService>(TYPES.SendGridEmailService).to(SendGridEmailService).inSingletonScope();
container.bind<MarketingEmailService>(TYPES.MarketingEmailService).to(MarketingEmailService).inSingletonScope();
container.bind<TotalExpertService>(TYPES.TotalExpertService).to(TotalExpertService).inSingletonScope();
container.bind<WebDataApiService>(TYPES.WebDataApiService).to(WebDataApiService).inSingletonScope();

export { container };
