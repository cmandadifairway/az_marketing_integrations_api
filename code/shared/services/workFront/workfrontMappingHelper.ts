import { UtilityService } from "../../utils/utility.service";
import { ServiceBase } from "../serviceBase";
import { container } from "../../../inversify.config";
import { TYPES } from "../../inversify/types";

export class WorkfrontMappingHelper extends ServiceBase {
    private readonly utilityService = container.get<UtilityService>(TYPES.UtilityService);
    private allFlowApiUsers = [];

    private mappingFields = [
        { wKey: "isActive", fKey: "logical" },
        { wKey: "firstName", fKey: "logical" },
        { wKey: "phoneNumber", fKey: "logical" },
        { wKey: "address", fKey: "logical" },
        { wKey: "ssoUsername", fKey: "logical" },
        { wKey: "parameterValues.DE:Loan Officer State Licenses", fKey: "logical" },
        { wKey: "parameterValues.DE:TID", fKey: "logical" },
        { wKey: "parameterValues.DE:Is_User_a_Manager", fKey: "logical" },
        { wKey: "parameterValues.DE:User Profile URL", fKey: "logical" },
        { wKey: "parameterValues.DE:What_Time_Zone", fKey: "logical" },
        { wKey: "parameterValues.DE:Enc Persona", fKey: "logical" },
        { wKey: "parameterValues.DE:Terminated Date", fKey: "logical" },

        { wKey: "lastName", fKey: "workday_data.last_name" },
        { wKey: "city", fKey: "workday_data.work_city" },
        { wKey: "state", fKey: "workday_data.work_state" },
        { wKey: "postalCode", fKey: "workday_data.work_zip" },
        { wKey: "emailAddr", fKey: "workday_data.upn" },
        { wKey: "title", fKey: "workday_data.position_title" },
        { wKey: "parameterValues.DE:Alternate Email", fKey: "workday_data.work_email" },
        { wKey: "parameterValues.DE:User Workday WID", fKey: "workday_data.unique_id" },
        { wKey: "parameterValues.DE:Loan Officer NMLS", fKey: "workday_data.nmls" },
        { wKey: "parameterValues.DE:Cost Center", fKey: "workday_data.cost_center" },
        { wKey: "parameterValues.DE:Reports to Manager Name", fKey: "workday_data.manager" },
        { wKey: "parameterValues.DE:Reports To Workday WID", fKey: "workday_data.manager_id" },
        { wKey: "parameterValues.DE:Branch_or_Cost_Center_Number", fKey: "workday_data.cost_center_id" },
        { wKey: "parameterValues.DE:Corporate_or_Branch", fKey: "workday_data.org_type" },
        { wKey: "parameterValues.DE:Enc LO Phone", fKey: "workday_data.work_phone" },
        { wKey: "parameterValues.DE:Birth Day", fKey: "workday_data.birth_day" },
        { wKey: "parameterValues.DE:Birth Month", fKey: "workday_data.birth_month" },
        { wKey: "parameterValues.DE:Pronouns", fKey: "workday_data.pronoun" },
        { wKey: "parameterValues.DE:Location Identifier", fKey: "workday_data.location_identifier" },
        { wKey: "parameterValues.DE:Phone_Type", fKey: "workday_data.work_phone_type" },
        { wKey: "parameterValues.DE:Position", fKey: "workday_data.business_title" },
        { wKey: "parameterValues.DE:Fax or eFax", fKey: "workday_data.fax" },
        { wKey: "parameterValues.DE:Rehire Date", fKey: "workday_data.rehire_date" },
        { wKey: "parameterValues.DE:Original Hire Date", fKey: "workday_data.hire_date" },
        { wKey: "parameterValues.DE:Continuous Service Date", fKey: "workday_data.continuous_service_date" },

        { wKey: "parameterValues.DE:Enc User Id", fKey: "encompass_data.enc_user_id" },
        { wKey: "parameterValues.DE:Enc Employee Id", fKey: "encompass_data.enc_employee_id" },
        { wKey: "parameterValues.DE:Enc LO NMLS", fKey: "encompass_data.enc_nmls" },
        { wKey: "parameterValues.DE:Enc LO Mobile", fKey: "encompass_data.enc_cell_phone" },
        { wKey: "parameterValues.DE:Enc LO Fax or eFax", fKey: "encompass_data.enc_fax" },
        { wKey: "parameterValues.DE:Enc Full Name", fKey: "encompass_data.enc_full_name" },
        { wKey: "parameterValues.DE:Enc Email", fKey: "encompass_data.enc_email" },
        { wKey: "parameterValues.DE:Enc First Name", fKey: "encompass_data.enc_first_name" },
        { wKey: "parameterValues.DE:Enc Last Name", fKey: "encompass_data.enc_last_name" },

        { wKey: "parameterValues.DE:Enc Org Code", fKey: "encompass_data.enc_organization_detail.id" },
        { wKey: "parameterValues.DE:Enc Branch Name", fKey: "encompass_data.enc_organization_detail.name" },
        { wKey: "parameterValues.DE:Enc Org ID", fKey: "encompass_data.enc_organization_detail.orgInformation.orgCode" },
        { wKey: "parameterValues.DE:Enc Branch Street", fKey: "encompass_data.enc_organization_detail.orgInformation.address.street1" },
        { wKey: "parameterValues.DE:Enc Branch City", fKey: "encompass_data.enc_organization_detail.orgInformation.address.city" },
        { wKey: "parameterValues.DE:Enc Branch State", fKey: "encompass_data.enc_organization_detail.orgInformation.address.state" },
        { wKey: "parameterValues.DE:Enc Branch Zip", fKey: "encompass_data.enc_organization_detail.orgInformation.address.zip" },
        { wKey: "parameterValues.DE:Enc Branch Phone", fKey: "encompass_data.enc_organization_detail.orgInformation.phone" },
        { wKey: "parameterValues.DE:Enc Branch Fax or eFax", fKey: "encompass_data.enc_organization_detail.orgInformation.fax" },
    ];

    async convertflowApiUsersToWorkfrontFormat(flowApiUsers, workfrontUsers) {
        let _flowApiUsers = [];
        try {
            this.customLogger.info("Begin convertflowApiUsersToWorkfrontFormat");
            // activeWorkfrontUsers = workfrontUsers.filter((o) => o.isActive === true);
            if (flowApiUsers && flowApiUsers.length > 0) {
                flowApiUsers.forEach((o) => {
                    if (o["workday_data.active_status"] === "0") {
                        _flowApiUsers.push({
                            emailAddr: o["workday_data.upn"],
                            isActive: "false",
                            terminatedDate: o["workday_data.termination_date"],
                        });
                    } else {
                        const _mappingFields = this.mappingFields.filter((o) => o.fKey !== "logical");
                        let flowApiUser = {};
                        _mappingFields.forEach((mappingField) => {
                            let val = o[mappingField.fKey];
                            if (val) {
                                val = val ? (val !== "-" ? val : "") : "";
                                flowApiUser[mappingField.wKey] = val;
                            }
                        });

                        let unFlattenUser = this.unFlattenJSON(o);
                        let licenses = "";
                        let managerId = "";
                        let companyId =
                            unFlattenUser.workday_data.org_type.toLowerCase() === "branch"
                                ? "5fa40a94002a054c97862c1e765b3b61"
                                : "5d3618a40168a18d824eb4bfe50aae26";

                        if (unFlattenUser.encompass_data && unFlattenUser.encompass_data.enc_license_states?.length > 0) {
                            licenses = unFlattenUser.encompass_data.enc_license_states
                                .filter((o) => o.enabled?.toString() === "true")
                                .map((o) => o.state)
                                .sort()
                                .join(",");
                        }

                        // do not assign manager to SteveJ@fairwaymc.com
                        // sample manager info looks like this
                        // {"workdayId":"103738","workfrontId":"5d152f74008d1edce28d58638d9bb9ab","companyId":"5d3618a40168a18d824eb4bfe50aae26","orgType":"Corporate"}

                        if (unFlattenUser.workday_data.unique_id !== "100046") {
                            // find manager's record
                            const manager = flowApiUsers.find(
                                (manager) => manager["workday_data.unique_id"] === unFlattenUser.workday_data.manager_id
                            );

                            if (manager && manager["workday_data.org_type"] === unFlattenUser.workday_data.org_type) {
                                // find manager record in workfront to get his id
                                const workfrontManger = workfrontUsers?.find(
                                    (o) =>
                                        o.emailAddr.toLowerCase() === manager["workday_data.upn"].toLowerCase() ||
                                        `${o.ssoUsername?.toLowerCase()}@fairwaymc.com` === manager["workday_data.upn"].toLowerCase()
                                );
                                managerId = workfrontManger.ID;
                            }
                        }

                        flowApiUser["managerID"] = managerId;
                        flowApiUser["companyID"] = companyId;

                        flowApiUser["isActive"] = unFlattenUser.workday_data.active_status === "1" ? "true" : "false";
                        flowApiUser["firstName"] =
                            unFlattenUser.workday_data.preferred_name?.length > 1
                                ? unFlattenUser.workday_data.preferred_name
                                : unFlattenUser.workday_data.first_name;

                        flowApiUser["phoneNumber"] =
                            unFlattenUser.workday_data.work_phone_type !== "fax" ? unFlattenUser.workday_data.work_phone : "";
                        flowApiUser["address"] = `${
                            unFlattenUser.workday_data.work_address_line1
                        } ${unFlattenUser.workday_data.work_address_line2?.replace("-", "")}`.trim();
                        flowApiUser["ssoUsername"] = unFlattenUser.workday_data.upn.split("@")[0];

                        flowApiUser["parameterValues.DE:Loan Officer State Licenses"] = licenses;
                        flowApiUser["parameterValues.DE:TID"] =
                            unFlattenUser.workday_data.quartile?.trim().replace("-", "") !== "" ? "TID" + unFlattenUser.workday_data.quartile : "";
                        flowApiUser["parameterValues.DE:Is_User_a_Manager"] =
                            unFlattenUser.workday_data.is_manager === "-" ? "No" : unFlattenUser.workday_data.is_manager;

                        flowApiUser["parameterValues.DE:User Profile URL"] = this.getLOUrl(unFlattenUser.workday_data.nmls);
                        flowApiUser["parameterValues.DE:What_Time_Zone"] = this.getTimeZone(unFlattenUser.workday_data.time_zone);
                        flowApiUser["parameterValues.DE:Terminated Date"] =
                            unFlattenUser.workday_data.rehire_date === "-" ? unFlattenUser.workday_data.termination_date || "" : "";

                        if (unFlattenUser.encompass_data?.enc_personas) {
                            flowApiUser["parameterValues.DE:Enc Persona"] = unFlattenUser.encompass_data.enc_personas
                                ? unFlattenUser.encompass_data.enc_personas
                                      .map((o) => o.entityName)
                                      .join(",")
                                      ?.trim()
                                : "";
                        }

                        let _flowApiUser = { ...flowApiUser, ...this.getCostCenterManagers(unFlattenUser.workday_data) };

                        // replace hyphen with empty
                        Object.keys(_flowApiUser).forEach((key) => {
                            if (_flowApiUser[key] === "-") {
                                _flowApiUser[key] = "";
                            }
                            if (key !== "parameterValues") {
                                _flowApiUser[key] = _flowApiUser[key]?.trim();
                            }
                        });

                        _flowApiUsers.push(_flowApiUser);
                    }
                });
            }
            this.customLogger.info("End convertflowApiUsersToWorkfrontFormat");
        } catch (error) {
            this.customLogger.error("Error in convertflowApiUsersToWorkfrontFormat", error);
            throw error;
        }
        return _flowApiUsers;
    }

    /**
     *
     * @param {*} timeZone
     * @returns timeZone in workfront format
     */
    private getTimeZone(timeZone) {
        const workdayTimeZones = [
            "America/Anchorage",
            "America/Chicago",
            "America/Denver",
            " America/Indiana/Indianapolis",
            "America/Los_Angeles",
            "America/New_York",
            "America/Phoenix",
        ];
        const workfrontTimeZones = ["Alaskan", "Central", "Mountain Standard", "Eastern", "Pacific", "Eastern", "Mountain Daylight (Arizona)"];

        if (timeZone?.length > 0) {
            const itemIndex = workdayTimeZones.indexOf(timeZone);
            if (itemIndex > -1) {
                return workfrontTimeZones[itemIndex];
            }
        }
        return "";
    }

    /**
     *
     * @param {*} workday_data
     * @returns {Object}: formatted managers
     */
    private getCostCenterManagers(workday_data) {
        // The format should be like below, when there is no value, replace it with question mark
        // "Cost_Center_Manager_1": "Full-name | Cost Center | NMLS | Phone | Phone Type | Email | Alternate Email | Street Address | City | State | Zip"
        const ccmgrs = {};
        if (workday_data) {
            for (let index = 1; index < 6; index++) {
                const prefix = `ccmgr${index}`;
                const str = `${workday_data[`${prefix}_full_name`] || "?"} | ${workday_data[`${prefix}_cc`] || "?"} | ${
                    workday_data[`${prefix}_nmls`] || "?"
                } | ${workday_data[`${prefix}_phone_number`] || "?"} | ${workday_data[`${prefix}_phone_type`] || "?"} | ${
                    workday_data[`${prefix}_email`] || "?"
                } | ${workday_data[`${prefix}_vanity_email`] || "?"} | ${workday_data[`${prefix}_address`] || "?"} | ${
                    workday_data[`${prefix}_city`] || "?"
                } | ${workday_data[`${prefix}_state`] || "?"} | ${workday_data[`${prefix}_zip`] || "?"}`;
                ccmgrs[`parameterValues.DE:Cost Center Manager ${index}`] = str.replace(/- \|/g, "? |").replace(/\| -/g, "| ?");
            }
            ccmgrs["parameterValues.DE:Branch Manager Name"] = workday_data.ccmgr1_full_name || "";
            ccmgrs["parameterValues.DE:Branch Manager Cost Center"] = workday_data.ccmgr1_cc || "";
            ccmgrs["parameterValues.DE:Branch Manager NMLS"] = workday_data.ccmgr1_nmls || "";
            ccmgrs["parameterValues.DE:Branch Manager Phone Number"] = workday_data.ccmgr1_phone_number || "";
            ccmgrs["parameterValues.DE:Branch Manager Phone Type"] = workday_data.ccmgr1_phone_type || "";
            ccmgrs["parameterValues.DE:Branch Manager Email Address"] = workday_data.ccmgr1_email || "";
            ccmgrs["parameterValues.DE:Branch Manager Alternate Email"] = workday_data.ccmgr1_vanity_email || "";
            ccmgrs["parameterValues.DE:Branch Manager Street Address"] = workday_data.ccmgr1_address || "";
            ccmgrs["parameterValues.DE:Branch Manager City"] = workday_data.ccmgr1_city || "";
            ccmgrs["parameterValues.DE:Branch Manager State"] = workday_data.ccmgr1_state || "";
            ccmgrs["parameterValues.DE:Branch Manager Zip Code"] = workday_data.ccmgr1_zip || "";
        }
        return ccmgrs;
    }

    /**
     *
     * @param {*} nmls
     * @returns formatted user website url
     */
    private getLOUrl(nmls) {
        if (nmls !== "-") {
            return `https://www.fairwayindependentmc.com/loan-officer/${nmls}`;
        }
        return "";
    }

    async convertflowApiUsersToWorkfrontFormat_not_useful_much(flowApiUsers, workfrontUsers) {
        const asycCalls = [];
        let _flowApiUsers = [];
        try {
            this.allFlowApiUsers = [...flowApiUsers];

            if (flowApiUsers?.length > 0) {
                const chunks = this.utilityService.chunkArray(flowApiUsers, 500);
                // for (let i = 0; i < chunks.length; i++) {
                //     asycCalls.push(this._convertflowApiUsersToWorkfrontFormat(chunks[i], workfrontUsers));
                // }

                // _flowApiUsers = await Promise.all(
                //     chunks.map(async (o) => {
                //         return await this._convertflowApiUsersToWorkfrontFormat(o, workfrontUsers);
                //     })
                // );
            }
        } catch (error) {
            this.customLogger.error("Error in convertflowApiUsersToWorkfrontFormat", error);
            throw error;
        }
        return _flowApiUsers;
    }

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
