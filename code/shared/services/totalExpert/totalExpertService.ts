import { Change, Changes, Delta } from "./../../model/deltas";
import { WebDataApiService } from "./webDataApiService";
import { IAppSettings } from "../../model/appSettings";
import { ConfigHelper } from "../../utils/config.helper";
import { UtilityService } from "../../utils/utility.service";
import { DataLakeService, IntegrationType } from "../dataLake/dataLakeService";
import { ServiceBase } from "../serviceBase";
import { container } from "../../../inversify.config";
import { TYPES } from "../../inversify/types";

export class TotalExpertService extends ServiceBase {
    private readonly dataLakeService = container.get<DataLakeService>(TYPES.DataLakeService);
    private readonly utilityService = container.get<UtilityService>(TYPES.UtilityService);
    private readonly webDataApiService = container.get<WebDataApiService>(TYPES.WebDataApiService);
    private configHelper = container.get<ConfigHelper>(TYPES.ConfigHelper);
    private appSettings: IAppSettings;
    private webData = [];

    private DBACompanyNames = {
        "Fairway Independent Mortgage Corporation": [],
        "Fairway Wholesale Lending": [1100, 1120, 1140, 1300],
        "Eversmeyer Mortgage Team": [6110],
        Homefinity: [4180, 5180, 6180, 8545],
        MortgageBanc: [1660],
        "Northpoint Mortgage": [4060],
        "The Kris Heichel Team": [5830],
        "The Wood Group": [3561, 3670, 3680, 3690, 3700, 3720, 3740, 3750, 3790, 3810, 3820, 3860, 3870, 3890],
        "Allison Olson - Loans Can Be Fun": [6630],
        "Mortgage Reel": [3200],
    };
    private teMappingFields = [
        { FlowPropertyName: "workday_data.cost_center_id", TEPropertyName: "info.cost_center", UpdateOnlyifEmpty: "" },
        { FlowPropertyName: "encompass_data.enc_user_id", TEPropertyName: "external_id", UpdateOnlyifEmpty: "" },
        { FlowPropertyName: "workday_data.fax", TEPropertyName: "info.phone_fax", UpdateOnlyifEmpty: "" },
        { FlowPropertyName: "workday_data.business_title", TEPropertyName: "info.job_title", UpdateOnlyifEmpty: "" },
        { FlowPropertyName: "workday_data.time_zone", TEPropertyName: "info.timezone_name", UpdateOnlyifEmpty: "" },
        { FlowPropertyName: "totalexpert_data.total_expert_id", TEPropertyName: "id", UpdateOnlyifEmpty: "" },
        { FlowPropertyName: "workday_data.work_phone", TEPropertyName: "info.phone_office", UpdateOnlyifEmpty: "" },
        { FlowPropertyName: "workday_data.active_status", TEPropertyName: "status", UpdateOnlyifEmpty: "" },
        { FlowPropertyName: "workday_data.work_email", TEPropertyName: "email", UpdateOnlyifEmpty: "" },
        { FlowPropertyName: "totalexpert_data.info.website", TEPropertyName: "info.website", UpdateOnlyifEmpty: "true" },
        {
            FlowPropertyName: "totalexpert_data.settings_marketing.application_url",
            TEPropertyName: "settings_marketing.application_url",
            UpdateOnlyifEmpty: "true",
        },
        {
            FlowPropertyName: "totalexpert_data.settings_marketing.social_google",
            TEPropertyName: "settings_marketing.social_google",
            UpdateOnlyifEmpty: "true",
        },
        {
            FlowPropertyName: "totalexpert_data.settings_marketing.profile_img_url",
            TEPropertyName: "settings_marketing.profile_img_url",
            UpdateOnlyifEmpty: "true",
        },
        {
            FlowPropertyName: "totalexpert_data.settings_marketing.social_facebook",
            TEPropertyName: "settings_marketing.social_facebook",
            UpdateOnlyifEmpty: "true",
        },
        {
            FlowPropertyName: "totalexpert_data.settings_marketing.social_linkedin",
            TEPropertyName: "settings_marketing.social_linkedin",
            UpdateOnlyifEmpty: "true",
        },
        {
            FlowPropertyName: "totalexpert_data.settings_marketing.social_twitter",
            TEPropertyName: "settings_marketing.social_twitter",
            UpdateOnlyifEmpty: "true",
        },
        {
            FlowPropertyName: "totalexpert_data.settings_marketing.social_youtube",
            TEPropertyName: "settings_marketing.social_youtube",
            UpdateOnlyifEmpty: "true",
        },
        { FlowPropertyName: "workday_data.nmls", TEPropertyName: "settings_marketing.license_title", UpdateOnlyifEmpty: "" },
    ];
    private webDataMappingFields = [
        { webField: "url", teField: "info.website" },
        { webField: "application_link", teField: "settings_marketing.application_url" },
        { webField: "head_shot_url", teField: "settings_marketing.profile_img_url" },
        { webField: "social_media_links.social_facebook", teField: "settings_marketing.social_facebook" },
        { webField: "social_media_links.social_twitter", teField: "settings_marketing.social_twitter" },
        { webField: "social_media_links.social_google", teField: "settings_marketing.social_google" },
        { webField: "social_media_links.social_linkedin", teField: "settings_marketing.social_linkedin" },
        { webField: "social_media_links.social_youtube", teField: "settings_marketing.social_youtube" },
        { webField: "social_media_links.social_homebot", teField: "disclaimers.Homebot_Link" },
        { webField: "social_media_links.social_yelp", teField: "disclaimers.Yelp" },
        { webField: "social_media_links.social_instagram", teField: "disclaimers.Instagram" },
        { webField: "social_media_links.social_zillow", teField: "disclaimers.Zillow" },
        { webField: "social_media_links.social_homescout", teField: "disclaimers.HomeScout_Link" },
        { webField: "lightstream_debt_consolidation", teField: "disclaimers.LightStream_Debt" },
        { webField: "lightstream_improvement", teField: "disclaimers.LightStream_HomeImprovement" },
        { webField: "calendly", teField: "disclaimers.Calendar_Link" },
    ];

    constructor() {
        super();
        this.appSettings = this.configHelper.appSettings;
    }

    async saveDeltasToLake(): Promise<any> {
        let data = { source: [], target: [] };
        let deltas;
        let activeUsers;
        let inActiveUsers;
        const asynCalls = [];
        try {
            this.customLogger.info("Begin saveDeltasToLake");

            this.webData = await this.webDataApiService.getMarketingWebData();
            data = await this.dataLakeService.getData(IntegrationType.TotalExpert);
            inActiveUsers = data.source.filter((o) => o.workday_data.active_status === "0");
            activeUsers = data.source.filter((o) => o.workday_data.active_status === "1");

            const result = await Promise.all(asynCalls);

            deltas = {
                archives: this.getUsersToArchive(inActiveUsers),
                additions: this.getUsersToAdd(activeUsers),
                updates: this.getUsersToUpdate(activeUsers),
            };

            if (deltas) {
                await this.dataLakeService.uploadDeltasToDataLake(deltas, IntegrationType.TotalExpert);
            }
            this.customLogger.info("End saveDeltasToLake");
        } catch (error) {
            this.customLogger.error("Error in saveDeltasToLake", error);
            throw error;
        }
        return true;
    }

    private getUsersToArchive(flowApiUsers): Delta {
        let _users = [];
        let users = [];
        let changes: Changes[] = [];
        try {
            this.customLogger.info("Begin getUsersToArchive");
            if (flowApiUsers?.length > 0) {
                // get users who are active in totalexpert, but inactive in flowapi, so we can deactivate them in totalexpert
                _users = flowApiUsers.filter((o) => o.totalexpert_data?.status === "true" || o.totalexpert_data?.status === "1");

                users = _users.map((o) => {
                    changes.push({
                        action: "archive",
                        emailAddr: `${o.totalexpert_data.total_expert_id}-${o.totalexpert_data.saml_subject_id}`,
                        changes: [{ key: "status", oldValue: "1", newValue: "0" }],
                    });
                    return { id: o.totalexpert_data.total_expert_id, status: "0" };
                });
            }
            this.customLogger.info("End getUsersToArchive");
        } catch (error) {
            this.customLogger.error("Error in getUsersToArchive", error);
            throw error;
        }
        return { count: users?.length, users, changes };
    }

    private getUsersToAdd(flowApiUsers: any): Delta {
        let users: any[];
        let changes: Changes[] = [];
        try {
            this.customLogger.info("Begin getUsersToAdd");
            // get users whose totalexpert details are null, so we can add them on totalexpert
            users = flowApiUsers.filter((o) => {
                return !o.totalexpert_data?.total_expert_id && o.encompass_data?.enc_license_states?.length > 0;
            });

            users = users.map((o) => {
                const convertedObj = this.convertFlowUserToTotalExpert(o, "add");
                const { totalexpertObj } = this.compareEncompassAndTotalExpertLicenses(convertedObj, o);
                changes.push({ action: "add", emailAddr: totalexpertObj.saml_subject_id });
                return totalexpertObj;
            });

            this.customLogger.info("End getUsersToAdd");
        } catch (error) {
            this.customLogger.error("Error in getUsersToAdd", error);
            throw error;
        }
        return { count: users?.length, users, changes };
    }

    private getUsersToUpdate(flowApiUsers: any): Delta {
        let changes: Changes[] = [];
        let users = [];
        try {
            this.customLogger.info("Begin getUsersToUpdate");

            // only if activeStatus is 1, then we get deltas
            if (flowApiUsers && flowApiUsers.length > 0) {
                // we only concernced about users who has already profile in totalexpert
                flowApiUsers = flowApiUsers.filter((o) => o.totalexpert_data?.total_expert_id !== undefined);

                flowApiUsers.forEach((flowApiUser) => {
                    // if totalexpert user has team name called DO NOT UPDATE, then we should not update this user
                    const teamName = flowApiUser.totalexpert_data?.teams?.filter((o) => o.team_name.toLowerCase() === "do not update");
                    if ((teamName?.length || 0) === 0) {
                        // convert workday and totalexpert data from flowapi to totalexpert api format
                        let convertedObj = this.convertFlowUserToTotalExpert(flowApiUser, "update");
                        let totalexpertData = flowApiUser.totalexpert_data;

                        if (convertedObj && totalexpertData) {
                            const _convertedObj = this.utilityService.flattenJSON_Sync(convertedObj);
                            const _totalexpertData = this.utilityService.flattenJSON_Sync(totalexpertData);

                            let _changes: Change[] = this.compareObjects(_convertedObj, _totalexpertData);
                            const { totalexpertObj } = this.compareEncompassAndTotalExpertLicenses(convertedObj, flowApiUser, _changes);
                            convertedObj = totalexpertObj;

                            const newTeams = this.getTeams(flowApiUser, _changes);
                            if (newTeams?.length > 0) {
                                convertedObj["teams"] = newTeams;
                            }

                            // remove the fields which are unchanged
                            if (_changes?.length > 0) {
                                const flattenFlowApiUser = this.utilityService.flattenJSON_Sync(convertedObj);
                                const keys = Object.keys(flattenFlowApiUser);

                                keys.forEach((key) => {
                                    const changeKey = _changes.find((o) => key.indexOf(o.key) > -1);
                                    if (!changeKey && key.indexOf("disclaimers") < 0) {
                                        delete flattenFlowApiUser[key];
                                    }
                                });
                                convertedObj = this.unFlattenJSON(flattenFlowApiUser);

                                users.push({
                                    action: "update",
                                    id: flowApiUser.totalexpert_data.total_expert_id,
                                    saml_subject_id: flowApiUser.totalexpert_data.saml_subject_id,
                                    user: convertedObj,
                                });
                                changes.push({
                                    action: "update",
                                    emailAddr: `${flowApiUser.totalexpert_data.total_expert_id}-${flowApiUser.totalexpert_data.saml_subject_id}`,
                                    changes: _changes,
                                });
                            }
                        }
                    }
                });
            }
            this.customLogger.info("End getUsersToUpdate");
        } catch (error) {
            this.customLogger.error("Error in getUsersToUpdate", error);
            throw error;
        }
        return {
            count: changes?.length,
            users,
            changes,
        };
    }

    private convertFlowUserToTotalExpert = (flowApiUser, action) => {
        let _webData = this.webData.find((o) => o?.nmls === flowApiUser.workday_data?.nmls);
        let company = this.getCompanyName(flowApiUser.workday_data.cost_center_id);
        let obj = { info: { company }, settings_marketing: {}, saml_subject_id: flowApiUser.workday_data?.upn || "" };
        const flattenFlowApiUser = this.utilityService.flattenJSON_Sync(flowApiUser);

        this.teMappingFields.forEach((field) => {
            let value = flattenFlowApiUser[field.FlowPropertyName];
            if (value) {
                value === "-" ? "" : value;
                obj[field.TEPropertyName] = value;
            }
        });

        obj = this.unFlattenJSON(obj);

        // add the below fields manually
        let firstName, lastName;

        // if user has encompass info, then take first and last name from encompass, else take from workday
        if (flowApiUser.encompass_data?.enc_first_name) {
            firstName = flowApiUser.encompass_data.enc_first_name;
            lastName = flowApiUser.encompass_data.enc_last_name;
            const arrFullName = flowApiUser.encompass_data.enc_full_name?.split(" ");
            if (arrFullName?.length > 2) firstName = `${firstName} ${arrFullName[1]}`;
        } else {
            firstName =
                flowApiUser.workday_data.preferred_name !== "-" ? flowApiUser.workday_data.preferred_name : flowApiUser.workday_data.first_name;
            lastName = flowApiUser.workday_data.last_name;
        }
        obj.info["first_name"] = firstName;
        obj.info["last_name"] = lastName;
        this.setAddress(flowApiUser, obj);

        if (action === "add") {
            obj["role"] = { role_name: "Loan Officer - Base" };
        }
        obj = this.setVanityUrls(_webData, obj, action);
        if (action === "add") {
            obj["type"] = "Lender";
            obj["teams"] = [...this.getTeams(flowApiUser)];
        } else {
            obj["id"] = flowApiUser.totalexpert_data.total_expert_id;
        }
        this.replaceHyphen(obj);
        return obj;
    };

    private setVanityUrls = (webData, obj, action) => {
        var regex = /[0-9.]+/g;
        const _flattenedWebData = this.utilityService.flattenJSON_Sync(webData);
        const flattenObj = this.utilityService.flattenJSON_Sync(obj);
        let _obj = {};

        if (_flattenedWebData) {
            Object.keys(_flattenedWebData).forEach((key) => {
                const _key = key.replace(regex, ".");
                const webMappingField = this.webDataMappingFields.find((o) => o.webField === _key);
                if (webMappingField) {
                    const value = _flattenedWebData[key] ? _flattenedWebData[key].toString().replace("-", "") : "";
                    if (value !== "") {
                        const mappingField = this.teMappingFields.find((o) => o.TEPropertyName === webMappingField.teField);
                        if (action === "update" && flattenObj && mappingField && mappingField.UpdateOnlyifEmpty === "true") {
                            if (!flattenObj[webMappingField.teField] || flattenObj[webMappingField.teField] === "") {
                                _obj[webMappingField.teField] = value;
                            } else {
                                delete flattenObj[webMappingField.teField];
                            }
                        } else {
                            _obj[webMappingField.teField] = value;
                        }
                    }
                }
            });
            _obj = this.unFlattenJSON(_obj);
            obj = this.unFlattenJSON(flattenObj);

            if (_obj && _obj["disclaimers"]) {
                const disclaimers = { ..._obj["disclaimers"] };
                const arr = [];
                Object.keys(disclaimers).forEach((key) => {
                    const newDisclaimer = {};
                    newDisclaimer["disclaimer_name"] = key;
                    newDisclaimer["content"] = disclaimers[key];
                    newDisclaimer["type"] = { name: "Sub-Disclaimer" };
                    arr.push(newDisclaimer);
                });
                if (arr.length > 0) {
                    _obj["disclaimers"] = arr;
                }
            }
        }

        if (obj && _obj) {
            obj = this.mergeObject(obj, _obj);
        }
        if (action === "update") {
            // remove some fields which are not comparable since FLOW doesn't have those values,
            // so we are not updating them
            delete obj["disclaimers"];
            delete obj["settings_marketing.profile_img_url"];
        }
        return obj;
    };

    private mergeObject(obj1, obj2) {
        for (const key of Object.keys(obj2)) {
            if (!obj1.hasOwnProperty(key) || typeof obj2[key] !== "object") obj1[key] = obj2[key];
            else if (obj1[key] instanceof Array && obj2[key] instanceof Array) obj1[key] = obj1[key].concat(obj2[key]);
            else this.mergeObject(obj1[key], obj2[key]);
        }
        return obj1;
    }

    private getTeams = (flowApiUser, changes?: any[]) => {
        // get default teams
        let teamNames = [];
        let newTeams = [];
        const teams = flowApiUser.totalexpert_data?.teams || [];

        if (flowApiUser.encompass_data?.enc_license_states?.length > 0) {
            teamNames.push("Retail: Loan Officer");
        }

        let obj = {};
        const additional = "additional_";
        const isAdditional = flowApiUser.workday_data.work_address_additional_line1 !== "-";
        obj["city"] = flowApiUser.workday_data[`work_${isAdditional ? additional : ""}city`];
        obj["state"] = flowApiUser.workday_data[`work_${isAdditional ? additional : ""}state`];
        obj["costCenter"] = flowApiUser.workday_data?.cost_center_id;

        if (obj) {
            teamNames.push(`${obj["costCenter"]} ${obj["city"]}, ${obj["state"]}`);
        }
        if (!changes) changes = [];
        teamNames.forEach((team) => {
            if (!teams.find((o) => o?.team_name?.toLowerCase()?.trim() === team.toLowerCase()?.trim())) {
                newTeams.push({ team_name: team });
                changes.push({
                    key: "teams.team_name",
                    oldValue: "",
                    newValue: team,
                });
            }
        });
        return newTeams;
    };

    private replaceHyphen = (obj) => {
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === "object") {
                this.replaceHyphen(obj[key]);
            }
            obj[key] = obj[key] === "-" ? "" : obj[key];
        });
    };

    private compareObjects(obj1, obj2): Change[] {
        let changes: Change[] = [];
        try {
            if (obj1 && obj2) {
                // exclude some keys from comparision
                let keys = Object.keys(obj1).filter((o) => !["company", "username", "licenses", "id", "type", "email"].includes(o.toLowerCase()));
                keys = keys.filter((o) => o.toLowerCase().indexOf("disclaimers") < 0 && o.toLowerCase().indexOf("profile_img_url") < 0);

                keys.forEach((key) => {
                    const val1 = obj1[key] === "-" ? "" : this.utilityService.convertToLowerCase(obj1[key]);
                    const val2 = obj2[key] === "-" ? "" : this.utilityService.convertToLowerCase(obj2[key]);

                    if (val1 !== val2) {
                        changes.push({
                            key,
                            oldValue: val2,
                            newValue: val1,
                        });
                    }
                });
            }
        } catch (error) {
            this.customLogger.error("Error in compareObjects", error);
            throw error;
        }
        return changes;
    }

    private compareEncompassAndTotalExpertLicenses = (totalexpertObj, flowApiUser, changes?: any[]) => {
        const totalexpert_data = flowApiUser["totalexpert_data"];
        const encompass_data = flowApiUser["encompass_data"];
        const encompassLicenses = encompass_data?.enc_license_states || [];
        const totalexpertLicenses = totalexpert_data?.licenses || [];

        let _encompassLicenses = [];
        if (encompassLicenses?.length > 0) {
            _encompassLicenses = encompassLicenses
                .filter((i) => i.enabled?.toString() === "true")
                .map((o) => {
                    return { license_name: o.state, content: o.license };
                });
        }
        let _totalexpertLicenses = [];
        if (totalexpertLicenses?.length > 0) {
            _totalexpertLicenses = totalexpertLicenses.map((o) => {
                return { license_name: o.license_name, content: o.content };
            });
        }
        const licensesToAdd = this.getLicensesToAdd(_encompassLicenses, _totalexpertLicenses, "add");
        const licensesToRemove = this.getLicensesToAdd(_encompassLicenses, _totalexpertLicenses, "remove");

        if (licensesToAdd.length > 0 || licensesToRemove.length > 0) {
            if (!changes) changes = [];
            if (licensesToAdd.length > 0) {
                totalexpertObj["licenses"] = licensesToAdd;

                changes.push({
                    key: "licenses",
                    oldValue: "Not showing here",
                    newValue: licensesToAdd,
                });
            }
            if (licensesToRemove.length > 0) {
                totalexpertObj["remove_licenses"] = licensesToRemove;

                changes.push({
                    key: "remove_licenses",
                    oldValue: "Not showing here",
                    newValue: licensesToRemove,
                });
            }
        }
        return { totalexpertObj };
    };

    private compareLicenses = (licenses1, licenses2) => {
        // Get licenses that are in licenses1, but not in licenses2
        let licenses = [];
        if (licenses1 && licenses1.length > 0 && licenses2 && licenses2.length > 0) {
            licenses.push(
                ...licenses1.filter(function (o) {
                    return !licenses2.some(function (i) {
                        return i["license_name"]?.trim() === o["license_name"]?.trim() && i["content"]?.trim() === o["content"]?.trim();
                    });
                })
            );
            return licenses;
        }
        return licenses1;
    };

    private getLicensesToAdd = (encompassLicenses, totalExpertLicenses, addOrRemove) => {
        let licenses = [];
        if (encompassLicenses && totalExpertLicenses) {
            if (addOrRemove == "add") {
                licenses = this.compareLicenses(encompassLicenses, totalExpertLicenses);
            } else {
                licenses = this.compareLicenses(totalExpertLicenses, encompassLicenses);
            }
        }
        return licenses;
    };

    private getCompanyName = (costCenterId) => {
        let companyName;
        const companyNames = Object.keys(this.DBACompanyNames);
        companyNames.forEach((cName) => {
            const costCentersArray = this.DBACompanyNames[cName];
            if (costCentersArray.length === 0) {
                companyName = cName;
            } else if (costCentersArray.includes(parseInt(costCenterId))) {
                companyName = cName;
            }
        });
        return companyName;
    };

    private setAddress = (flowApiUser, obj) => {
        const additional = "additional_";
        const isAdditional = flowApiUser.workday_data.work_address_additional_line1 !== "-";
        obj.info["address"] = flowApiUser.workday_data[`work_address_${isAdditional ? additional : ""}line1`];
        obj.info["address_2"] = flowApiUser.workday_data[`work_address_${isAdditional ? additional : ""}line2`];
        obj.info["city"] = flowApiUser.workday_data[`work_${isAdditional ? additional : ""}city`];
        obj.info["state"] = flowApiUser.workday_data[`work_${isAdditional ? additional : ""}state`];
        obj.info["zip_code"] = flowApiUser.workday_data[`work_${isAdditional ? additional : ""}zip`];
    };

    private unFlattenJSON(flattedObject) {
        var _ = require("lodash");
        let result;
        _.keys(flattedObject).forEach(function (key, value) {
            if (!result) result = {};
            _.set(result, key, flattedObject[key]);
        });
        return result;
    }
}
