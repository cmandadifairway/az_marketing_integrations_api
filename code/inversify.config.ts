import "reflect-metadata";
import { CampaignGroupService } from "./shared/services/groups/campaignGroup";
import { GroupService } from "./shared/services/groups/group";
import { CampaignGroupDataAccess } from "./shared/services/groups/repository/campaignGroupDataAccess";
import { GroupDataAccess } from "./shared/services/groups/repository/groupDataAccess";
import { Utility } from "./shared/utils/utilityImpl.service";
import { UtilityService } from "./shared/utils/utility.service";
import { Container } from "inversify";
import { CustomLogger } from "./shared/Logging/CustomLogger.service";
import { CustomLoggerImpl } from "./shared/Logging/CustomLoggerImpl.service";
import { TYPES } from "./shared/inversify/types";
import { LoanOfficerService, LoanOfficerServiceImpl } from "./shared/services/loanOfficer/loanOfficerService";
import { LOByNameService } from "./LoanOfficerByName/Service/LOByName.service";
import { LOByNameServiceImpl } from "./LoanOfficerByName/Service/LOByNameImpl.service";
import { KeyVaultService } from "./shared/services/keyVault/keyVault.service";
import { KeyVaultServiceImpl } from "./shared/services/keyVault/keyVaultImpl.service";
import { AppConfigService } from "./shared/services/appConfiguration/appConfig.service";
import { AppConfigServiceImpl } from "./shared/services/appConfiguration/appConfigImpl.service";
import { AppInsightsService } from "./shared/services/monitoring/applicationInsights";
import { CustomValidator } from "./shared/validators/customValidator";
import { CustomValidatorImpl } from "./shared/validators/customValidatorImpl";
import { DbConnectionService } from "./shared/services/databaseConfig/databaseConn.service";
import {
    LoanOfficerDataAccess,
    LoanOfficerDataService,
} from "./shared/services/loanOfficer/repository/loanOfficerDataAccess";
import { UpdateLoGroupService, UpdateLoService } from "./UpdateLoGroup/services/updateLoGroup";
import { HelpFaqDataAccess, HelpFaqDataService } from "./shared/services/helpFaq/repository/helpFaqDataAccess";
import { HelpFaq, HelpFaqService } from "./shared/services/helpFaq/helpFaqService";
import { Banners, BannerService } from "./shared/services/banner/bannerService";
import { BannerDataAccess, BannerDataService } from "./shared/services/banner/repository/bannerDataAccess";

/**
 * inversify is same as implementing oops concept in .net
 * object instance will be only created once when chosen singleton option, there are other options available
 * @injectable() attribute is required in the implementing class
 */
const container = new Container();
container.bind<CustomLogger>(TYPES.CustomLogger).to(CustomLoggerImpl).inSingletonScope();
container.bind<CustomValidator>(TYPES.CustomValidator).to(CustomValidatorImpl).inSingletonScope();
container.bind<KeyVaultService>(TYPES.KeyVaultService).to(KeyVaultServiceImpl).inSingletonScope();
container.bind<AppConfigService>(TYPES.AppConfigService).to(AppConfigServiceImpl).inSingletonScope();
container.bind<AppInsightsService>(TYPES.AppInsightsService).to(AppInsightsService).inSingletonScope();
container.bind<DbConnectionService>(TYPES.DbConnectionService).to(DbConnectionService).inSingletonScope();
container.bind<UtilityService>(TYPES.UtilityService).to(Utility).inSingletonScope();
container.bind<LoanOfficerService>(TYPES.LoanOfficerService).to(LoanOfficerServiceImpl).inSingletonScope();
container.bind<LOByNameService>(TYPES.LOByNameService).to(LOByNameServiceImpl).inSingletonScope();
container.bind<GroupDataAccess>(TYPES.CampaignGroupDataAccess).to(CampaignGroupDataAccess).inSingletonScope();
container.bind<GroupService>(TYPES.CampaignGroupService).to(CampaignGroupService).inSingletonScope();
container.bind<LoanOfficerDataService>(TYPES.LoanOfficerDataService).to(LoanOfficerDataAccess).inSingletonScope();
container.bind<UpdateLoService>(TYPES.UpdateLoService).to(UpdateLoGroupService).inSingletonScope();
container.bind<HelpFaqDataService>(TYPES.HelpFaqDataService).to(HelpFaqDataAccess).inSingletonScope();
container.bind<HelpFaqService>(TYPES.HelpFaqService).to(HelpFaq).inSingletonScope();
container.bind<BannerService>(TYPES.BannerService).to(Banners).inSingletonScope();
container.bind<BannerDataService>(TYPES.BannerDataService).to(BannerDataAccess).inSingletonScope();

export { container };
