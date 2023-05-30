import { Change, Changes, Delta, Deltas } from "./../../model/deltas";
import { WorkfrontMappingHelper } from "./workfrontMappingHelper";
import { IAppSettings } from "../../model/appSettings";
import { ConfigHelper } from "../../utils/config.helper";
import { UtilityService } from "../../utils/utility.service";
import { DataLakeService, IntegrationType } from "../dataLake/dataLakeService";
import { ServiceBase } from "../serviceBase";
import { container } from "../../../inversify.config";
import { TYPES } from "../../inversify/types";

export class WorkfrontService extends ServiceBase {
    private readonly dataLakeService = container.get<DataLakeService>(TYPES.DataLakeService);
    private readonly utilityService = container.get<UtilityService>(TYPES.UtilityService);
    private readonly workfrontMappingHelper = container.get<WorkfrontMappingHelper>(TYPES.WorkfrontMappingHelper);
    private configHelper = container.get<ConfigHelper>(TYPES.ConfigHelper);
    private appSettings: IAppSettings;

    constructor() {
        super();
        this.appSettings = this.configHelper.appSettings;
    }

    async saveDeltasToLake(): Promise<any> {
        let data = { source: [], target: [] };
        let deltas: Deltas;
        let activeUsers;
        let inActiveUsers;
        const asynCalls = [];
        try {
            this.customLogger.info("Begin saveDeltasToLake");

            data = await this.dataLakeService.getData(IntegrationType.Workfront);
            data.source = data.source ? await this.utilityService.flattenJSONArray(data.source) : [];
            data.target = data.target ? await this.utilityService.flattenJSONArray(data.target) : [];

            // conver the source data to target data, so it's easy to compare
            const convertedFlowApiUsers = await this.workfrontMappingHelper.convertflowApiUsersToWorkfrontFormat(data.source, data.target);

            activeUsers = convertedFlowApiUsers.filter((o) => o.isActive === "true");
            inActiveUsers = convertedFlowApiUsers.filter((o) => o.isActive === "false");

            asynCalls.push(this.getUsersToUpdate(activeUsers, data.target));
            asynCalls.push(this.getUsersToArchive(inActiveUsers, data.target));
            asynCalls.push(this.getUsersToAdd(activeUsers, data.target));

            const result = await Promise.all(asynCalls);

            deltas = {
                archives: result[1],
                additions: result[2],
                updates: result[0],
            };

            if (deltas) {
                await this.dataLakeService.uploadDeltasToDataLake(deltas, IntegrationType.Workfront);
            }
            this.customLogger.info("End saveDeltasToLake");
        } catch (error) {
            this.customLogger.error("Error in saveDeltasToLake", error);
            throw error;
        }
        return true;
    }

    async getUsersToArchive(flowApiUsers: any, workfrontUsers: any): Promise<Delta> {
        let _users = [];
        let users = [];
        let changes: Changes[] = [];
        try {
            this.customLogger.info("Begin getUsersToArchive");
            if (workfrontUsers?.length > 0) {
                const _workfrontUsers = workfrontUsers.filter((o) => o.isActive === "true" && o.ssoUsername?.length > 0);

                // get the users that exists in workfrontUsers and flowApiUsers
                _users = await _workfrontUsers.filter(function (i) {
                    return flowApiUsers.some(function (o) {
                        return (
                            i.isActive === "true" &&
                            (i.emailAddr.toLowerCase() === o.emailAddr.toLowerCase() ||
                                `${i.ssoUsername.toLowerCase()}@fairwaymc.com` === o.emailAddr.toLowerCase())
                        );
                    });
                });

                _users.forEach((o) => {
                    users.push({ ID: o.ID, emailAddr: o.emailAddr, isActive: "false" });
                    changes.push({
                        action: "archive",
                        emailAddr: o.emailAddr,
                        changes: [{ key: "isActive", oldValue: "true", newValue: "false" }],
                    });
                });
            }
            this.customLogger.info("End getUsersToArchive");
        } catch (error) {
            this.customLogger.error("Error in getUsersToArchive", error);
            throw error;
        }
        return { count: users?.length, users, changes };
    }

    async getUsersToAdd(flowApiUsers: any, workfrontUsers: any): Promise<Delta> {
        let users: any[];
        let changes: Changes[] = [];
        try {
            this.customLogger.info("Begin getUsersToAdd");
            // get the users that exists in flowApiUsers but not in mailchimpUsers
            users = await flowApiUsers.filter(function (o) {
                return !workfrontUsers.some(function (i) {
                    return (
                        i.emailAddr.toLowerCase() === o.emailAddr.toLowerCase() ||
                        i["parameterValues.DE:Alternate Email"] === o["parameterValues.DE:Alternate Email"] ||
                        i.ssoUsername?.toLowerCase() === o.ssoUsername?.toLowerCase()
                    );
                });
            });

            users = users.map((o) => {
                const obj = this.convertLicensesToArray(o);
                obj["categoryID"] = "5edab60301d54edbc6fda03dc07fcaa8";
                changes.push({ action: "add", emailAddr: o.emailAddr });
                return obj;
            });

            this.customLogger.info("End getUsersToAdd");
        } catch (error) {
            this.customLogger.error("Error in getUsersToAdd", error);
            throw error;
        }
        return { count: users?.length, users, changes };
    }

    async getUsersToUpdate(flowApiUsers: any, workfrontUsers: any): Promise<Delta> {
        let changes: Changes[] = [];
        let users = [];
        try {
            this.customLogger.info("Begin getUsersToUpdate");

            if (flowApiUsers?.length > 0 && workfrontUsers?.length > 0) {
                for await (const workfrontUser of workfrontUsers) {
                    let wSSOUserName = `${workfrontUser.ssoUsername?.toLowerCase()}@fairwaymc.com`;
                    let wEmailAddr = workfrontUser.emailAddr.toLowerCase();
                    let flowApiUser = flowApiUsers.find((o) => o.emailAddr.toLowerCase() == wSSOUserName || o.emailAddr.toLowerCase() === wEmailAddr);

                    // find user with alternate email
                    if (!flowApiUser) {
                        flowApiUser = flowApiUsers.find((o) => o["parameterValues.DE:Alternate Email"]?.toLowerCase() === wEmailAddr);
                        const wAltEmailAddr = workfrontUser["parameterValues.DE:Alternate Email"]?.toLowerCase();
                        if (!flowApiUser && wAltEmailAddr?.length > 0) {
                            flowApiUser = flowApiUsers.find((o) => o["parameterValues.DE:Alternate Email"]?.toLowerCase() === wAltEmailAddr);
                        }
                        if (flowApiUser) {
                            wEmailAddr = flowApiUser["parameterValues.DE:Alternate Email"]?.toLowerCase();
                        }
                    }

                    if (flowApiUser) {
                        let licenses = workfrontUser["parameterValues.DE:Loan Officer State Licenses"];
                        if (licenses) {
                            workfrontUser["parameterValues.DE:Loan Officer State Licenses"] = await this.formatLicensesAsString(licenses);
                        }

                        let _changes: Change[] = await this.compareObjects(flowApiUser, workfrontUser);
                        if (_changes?.length > 0) {
                            let obj = { ID: workfrontUser.ID, emailAddr: wEmailAddr };
                            // Note: Access levels are only applied when adding a new user or activating an exiting user profile.  Access level should never be updated on active users.
                            // If user is inactive in workfront, and activating back, we should re apply access level
                            const isActive = _changes.filter((o) => o.key.toLowerCase() === "isactive");
                            if (isActive?.length > 0) {
                                obj["accessLevelId"] = await this.getAccessLevelId(flowApiUser["parameterValues.DE:Corporate_or_Branch"]);
                                obj["layoutTemplateId"] = await this.getLayoutTemplateId(flowApiUser["parameterValues.DE:Corporate_or_Branch"]);
                                obj["homeGroupId"] = "7e169c335e91e5e2e0530a093a0a7512";
                            }
                            changes.push({ action: "update", emailAddr: wEmailAddr, changes: _changes });

                            _changes.forEach((change) => {
                                obj[change.key] = change.newValue;
                            });

                            obj = await this.convertLicensesToArray(obj);
                            users.push(obj);
                        }
                    }
                }
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

    private convertLicensesToArray = (obj) => {
        obj = JSON.parse(JSON.stringify(obj).replace(/parameterValues./g, ""));
        const licenses = obj["DE:Loan Officer State Licenses"];
        if (licenses) {
            obj["DE:Loan Officer State Licenses"] = licenses.split(",");
        }
        return obj;
    };

    private async compareObjects(flowApiUser, workfrontUser): Promise<Change[]> {
        let changes: Change[] = [];
        try {
            if (flowApiUser && workfrontUser) {
                // exclude some keys from comparision
                const keys = Object.keys(flowApiUser).filter((o) => !["emailaddr", "ssoUsername"].includes(o.toLowerCase()));

                for (let index = 0; index < keys.length; index++) {
                    const key = keys[index];
                    if (this.utilityService.convertToLowerCase(flowApiUser[key]) !== this.utilityService.convertToLowerCase(workfrontUser[key])) {
                        changes.push({
                            key,
                            oldValue: workfrontUser[key] || "",
                            newValue: flowApiUser[key] || "",
                        });
                    }
                }
            }
        } catch (error) {
            this.customLogger.error("Error in compareObjects", error);
            throw error;
        }
        return changes;
    }

    /**
     * Note: Access levels are only applied when adding a new user or activating an exiting user profile.  Access level should never be updated on active users. 
        If user is inactive in workfront, and activating back, we should re apply access level
    * @param {string} orgType : user orgType (corporate or branc)
    * @returns {string} : access id
    */
    private async getAccessLevelId(orgType) {
        if (!orgType) return "";

        if (orgType.toLowerCase() === "branch") {
            // FIM Reviewer (DEFAULT) with sysID
            return "5cb8df28008fc573e617192f669c0d31";
        } else {
            // Corporate Collaborator with sysID
            return "60f5bbc3001134ace3bf16ca07e3a793";
        }
    }

    /**
     * Note: Interface Templates are only applied when adding a new user or activating an exiting user profile.
     * @param {string} orgType : user orgType (corporate or branc)
     * @returns {string} : interface template id
     */
    private async getLayoutTemplateId(orgType) {
        if (!orgType) return "";

        if (orgType.toLowerCase() === "branch") {
            // MKTG_Requestor/Reviewer LT (Default System-Wide) with sysID
            return "5d48347e0343c479f0b332122a22a77e";
        } else {
            // MKTG_Corporate Requestor Reviewer LT with sysID
            return "6001ddad00a2d2c525b3f37be2ccfeef";
        }
    }

    /**
     *
     * @param {Array} licenses : Array of licenses
     * @returns {string}: comma separated licenses
     */
    private async formatLicensesAsString(licenses) {
        if (licenses?.length > 0) {
            if (Array.isArray(licenses)) {
                return licenses.sort().join(",");
            } else if (licenses.indexOf("[") >= 0) {
                const _licenses = JSON.parse(licenses);
                return _licenses.join(",");
            }
        }
        return licenses;
    }
}
