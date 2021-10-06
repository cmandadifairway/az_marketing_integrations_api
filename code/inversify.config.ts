import "reflect-metadata";
import { JSONHelper, JSONHelperService } from "./shared/JSON/JSON.Helper";
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
import { EmailService } from "./SendEmail/service/Email.service";
import { EmailServiceImpl } from "./SendEmail/service/EmailServiceImpl.service";
import { GetDashBoardDaoImpl } from "./Dashboard/Repository/GetDashBoardDaoImpl.repository";
import { GetDashBoardDaoService } from "./Dashboard/Repository/GetDashBoardDaoService.repository";
import { SendToHomeBirdService } from "./HomeBird/service/SendToHomeBird.service";
import { SendToHomeBirdImpl } from "./HomeBird/service/SendToHomeBirdServiceImpl.service";
import { TimelineService } from "./Timeline/service/Timeline.service";
import { TimelineImpl } from "./Timeline/service/TimelineSerivceImpl.service";
import { GetLeadService } from "./LeadInfo/service/GetLead.service";
import { GetLeadServiceImpl } from "./LeadInfo/service/GetLeadServiceImpl.service";
import { LeadFilterService } from "./Leads/Service/LeadFilter.service";
import { LeadFilterServiceImpl } from "./Leads/Service/LeadFilterImpl.service";
import { LeadsService } from "./Leads/Service/Leads.service";
import { LeadsServiceImpl } from "./Leads/Service/LeadsImpl.service";
import { LoanOfficerService, LoanOfficerServiceImpl } from "./shared/services/loanOfficer/loanOfficerService";
import { LOByNameService } from "./LoanOfficerByName/Service/LOByName.service";
import { LOByNameServiceImpl } from "./LoanOfficerByName/Service/LOByNameImpl.service";
import { UpdateLeadInfoService } from "./UpdateLeadInfo/Service/UpdateLeadInfo.service";
import { UpdateLeadInfoImpl } from "./UpdateLeadInfo/Service/UpdateLeadInfoImpl.service";
import { AnalyticsService } from "./Analytics/Service/Analytics.service";
import { AnalyticsServiceImpl } from "./Analytics/Service/AnalyticsImpl.service";
import { GetDashboardService } from "./Dashboard/Service/GetDashboard.service";
import { GetDashBoardImpl } from "./Dashboard/Service/GetDashBoardImpl.service";
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
import { LeadDataAccess, LeadDataService } from "./shared/services/leads/repository/leadDataAccess";
import { UpdateLoGroupService, UpdateLoService } from "./UpdateLoGroup/services/updateLoGroup";
import { HelpFaqDataAccess, HelpFaqDataService } from "./shared/services/helpFaq/repository/helpFaqDataAccess";
import { HelpFaq, HelpFaqService } from "./shared/services/helpFaq/helpFaqService";
import { Banners, BannerService } from "./shared/services/banner/bannerService";
import { BannerDataAccess, BannerDataService } from "./shared/services/banner/repository/bannerDataAccess";
import { ServiceBusUtility } from "./shared/services/servicebus/serviceBus.service";
import { ExportLeadsService } from "./ExportLeads/Service/ExportLeads.service";
import { ExportLeadsServiceImpl } from "./ExportLeads/Service/ExportLeadsImpl.service";
import { Relationships, RelationshipService } from "./shared/services/relationship/relationshipService";
import {
    RelationshipDataAccess,
    RelationshipDataService,
} from "./shared/services/relationship/repository/relationshipDataAccess";
import { BigQueryService, BigQueryWrapper } from "./shared/services/bigQuery/bigQuery";
import {
    RelationshipHtmlService,
    RelationshipEmailHelper,
} from "./shared/services/relationship/relationshipEmailHelper";
import {
    LeadsFilterOptionsService,
    LeadsFilterOptionsServiceImpl,
} from "./LeadsFilterOptions/Service/LeadsFilterOptions.service";

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
container.bind<EmailService>(TYPES.EmailServiceImpl).to(EmailServiceImpl).inSingletonScope();
container.bind<UtilityService>(TYPES.UtilityService).to(Utility).inSingletonScope();
container.bind<ServiceBusUtility>(TYPES.ServiceBusService).to(ServiceBusUtility).inSingletonScope();
container.bind<GetDashboardService>(TYPES.GetDashBoardImpl).to(GetDashBoardImpl).inSingletonScope();
container.bind<GetDashBoardDaoService>(TYPES.GetDashBoardDaoImpl).to(GetDashBoardDaoImpl).inSingletonScope();
container.bind<RelationshipHtmlService>(TYPES.RelationshipHtmlService).to(RelationshipEmailHelper).inSingletonScope();
container.bind<SendToHomeBirdService>(TYPES.SendToHomeBirdImpl).to(SendToHomeBirdImpl).inSingletonScope();
container.bind<TimelineService>(TYPES.TimelineService).to(TimelineImpl).inSingletonScope();
container.bind<GetLeadService>(TYPES.GetLeadServiceImpl).to(GetLeadServiceImpl).inSingletonScope();
container.bind<LeadFilterService>(TYPES.LeadFilterServiceImpl).to(LeadFilterServiceImpl).inSingletonScope();
container.bind<LeadsService>(TYPES.LeadsServiceImpl).to(LeadsServiceImpl).inSingletonScope();
container
    .bind<LeadsFilterOptionsService>(TYPES.LeadsFilterOptionsServiceImpl)
    .to(LeadsFilterOptionsServiceImpl)
    .inSingletonScope();
container.bind<LoanOfficerService>(TYPES.LoanOfficerService).to(LoanOfficerServiceImpl).inSingletonScope();
container.bind<LOByNameService>(TYPES.LOByNameServiceImpl).to(LOByNameServiceImpl).inSingletonScope();
container.bind<UpdateLeadInfoService>(TYPES.UpdateLeadInfoImpl).to(UpdateLeadInfoImpl).inSingletonScope();
container.bind<AnalyticsService>(TYPES.AnalyticsServiceImpl).to(AnalyticsServiceImpl).inSingletonScope();
container.bind<GroupDataAccess>(TYPES.CampaignGroupDataAccess).to(CampaignGroupDataAccess).inSingletonScope();
container.bind<GroupService>(TYPES.CampaignGroupService).to(CampaignGroupService).inSingletonScope();
container.bind<LoanOfficerDataService>(TYPES.LoanOfficerDataService).to(LoanOfficerDataAccess).inSingletonScope();
container.bind<LeadDataService>(TYPES.LeadDataService).to(LeadDataAccess).inSingletonScope();
container.bind<UpdateLoService>(TYPES.UpdateLoService).to(UpdateLoGroupService).inSingletonScope();
container.bind<HelpFaqDataService>(TYPES.HelpFaqDataService).to(HelpFaqDataAccess).inSingletonScope();
container.bind<HelpFaqService>(TYPES.HelpFaqService).to(HelpFaq).inSingletonScope();
container.bind<BannerService>(TYPES.BannerService).to(Banners).inSingletonScope();
container.bind<BannerDataService>(TYPES.BannerDataService).to(BannerDataAccess).inSingletonScope();
container.bind<ExportLeadsService>(TYPES.ExportLeadsServiceImpl).to(ExportLeadsServiceImpl).inSingletonScope();
container.bind<JSONHelperService>(TYPES.JSONHelper).to(JSONHelper).inSingletonScope();
container.bind<RelationshipDataService>(TYPES.RelationshipDataService).to(RelationshipDataAccess).inSingletonScope();
container.bind<RelationshipService>(TYPES.RelationshipService).to(Relationships).inSingletonScope();
container.bind<BigQueryService>(TYPES.BigQueryService).to(BigQueryWrapper).inSingletonScope();

export { container };
