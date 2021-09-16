const TYPES = {
    AppConfigService: Symbol.for("AppConfigService"),
    AppInsightsService: Symbol.for("AppInsightsService"),
    CustomLogger: Symbol.for("CustomLogger"),
    CustomValidator: Symbol.for("CustomValidator"),
    DbConnectionService: Symbol.for("DbConnectionService"),
    KeyVaultService: Symbol.for("KeyVaultService"),
    UtilityService: Symbol.for("UtilityService"),
    StatusInfoService: Symbol.for("StatusInfoService"),

    BannerDataService: Symbol.for("BannerDataService"),
    BannerService: Symbol.for("BannerService"),
    CampaignGroupDataAccess: Symbol.for("CampaignGroupDataAccess"),
    CampaignGroupService: Symbol.for("CampaignGroupService"),
    HelpFaqDataService: Symbol.for("HelpFaqDataService"),
    HelpFaqService: Symbol.for("HelpFaqService"),
    LoanOfficerDataService: Symbol.for("LoanOfficerDataService"),
    LoanOfficerServiceImpl: Symbol.for("LoanOfficerServiceImpl"),
    LOByNameServiceImpl: Symbol.for("LOByNameServiceImpl"),
    UpdateLoService: Symbol.for("UpdateLoService"),
};

export { TYPES };
