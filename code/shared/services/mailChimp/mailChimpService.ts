import { Change, Changes, Delta, Deltas } from "./../../model/deltas";
import { IAppSettings } from "../../model/appSettings";
import { ConfigHelper } from "../../utils/config.helper";
import { UtilityService } from "../../utils/utility.service";
import { DataLakeService, IntegrationType } from "../dataLake/dataLakeService";
import { ServiceBase } from "../serviceBase";
import { container } from "../../../inversify.config";
import { TYPES } from "../../inversify/types";

export class MailChimpService extends ServiceBase {
    private readonly dataLakeService = container.get<DataLakeService>(TYPES.DataLakeService);
    private mailChimpRelativeUrl = "";
    private operationId = "";
    private configHelper = container.get<ConfigHelper>(TYPES.ConfigHelper);
    private appSettings: IAppSettings;

    constructor() {
        super();
        this.appSettings = this.configHelper.appSettings;
    }

    async saveDeltasToLake(): Promise<any> {
        let deltas: Deltas;
        let archiveUsers: Delta;
        let addUsers: Delta;
        let updateUsers: Delta;
        let activeUsers = [];
        let inActiveUsers = [];
        let data = { source: [], target: [] };
        try {
            this.customLogger.info("Begin saveDeltasToLake");

            this.mailChimpRelativeUrl = `/lists/${this.appSettings.MailChimp_List_Id}/members`;
            this.operationId = this.appSettings.MailChimp_Operation_Id;
            data = await this.dataLakeService.getData(IntegrationType.MailChimp);

            activeUsers = data.source.filter((o) => o.workday_data.active_status === "1" && o.workday_data.upn.indexOf("@") > 0);
            inActiveUsers = data.source.filter((o) => o.workday_data.active_status === "0" && o.workday_data.upn.indexOf("@") > 0);

            archiveUsers = this.getUsersToArchive(inActiveUsers, data.target);
            addUsers = this.getUsersToAdd(activeUsers, data.target);
            updateUsers = this.getUsersToUpdate(activeUsers, data.target);

            deltas = {
                archives: archiveUsers,
                additions: addUsers,
                updates: updateUsers,
            };

            if (deltas) {
                await this.dataLakeService.uploadDeltasToDataLake(deltas, IntegrationType.MailChimp);
            }
            this.customLogger.info("End saveDeltasToLake");
        } catch (error) {
            this.customLogger.error("Error in saveDeltasToLake", error);
            throw error;
        }
        return true;
    }

    private getUsersToArchive(flowApiUsers: any, mailchimpUsers: any): Delta {
        let _users = [];
        let changes: Changes[] = [];
        let users = [];
        // const todaysDate = new Date();
        try {
            this.customLogger.info("Begin getUsersToArchive");

            // get the users that exists in mailchimpUsers and flowApiUsers
            _users = mailchimpUsers.filter(function (o) {
                return flowApiUsers.some(function (i) {
                    return i.workday_data.upn.toLowerCase() === o.email_address.toLowerCase();
                });
            });

            // filter mailchimp users. we can only update the users with below status
            const status = ["subscribed", "unsubscribed"];
            _users = _users.filter((o) => status.includes(o.status));

            _users.forEach((o) => {
                users.push(this.getArchiveBody(o.email_address));
                changes.push({
                    action: "archive",
                    emailAddr: o.email_address,
                    changes: [{ key: "status", oldValue: "subscribed", newValue: "archived" }],
                });
            });
            this.customLogger.info("End getUsersToArchive");
        } catch (error) {
            this.customLogger.error("Error in getUsersToArchive", error);
            throw error;
        }

        return { count: users?.length, users: { operations: users }, changes };
    }

    private getUsersToAdd(flowApiUsers: any, mailchimpUsers: any): Delta {
        let _users = [];
        let users = [];
        let changes: Changes[] = [];
        try {
            this.customLogger.info("Begin getUsersToAdd");

            // get the users that exists in flowApiUsers but not in mailchimpUsers
            _users = flowApiUsers.filter(function (o) {
                return !mailchimpUsers.some(function (i) {
                    return o.workday_data.upn.toLowerCase() === i.email_address.toLowerCase();
                });
            });

            if (_users) {
                _users = this.convertToMailchimpFormat(_users);
                users = _users.map((o) => {
                    const tags = this.getTagsFromRules(o);
                    if (tags) {
                        o["tags"] = tags;
                    }
                    const body = this.getBody(o, "POST", true);
                    changes.push({ action: "add", emailAddr: o.email_address });
                    return body;
                });
            }
            this.customLogger.info("End getUsersToAdd");
        } catch (error) {
            this.customLogger.error("Error in getUsersToAdd", error);
            throw error;
        }
        return { count: users?.length, users: { operations: users }, changes };
    }

    private getUsersToUpdate(flowApiUsers: any, mailchimpUsers: any): Delta {
        let changes: Changes[] = [];
        let users = [];
        let removeUserTags = [];
        let subscribeMembers = [];
        try {
            this.customLogger.info("Begin getUsersToUpdate");
            // get the users that exists in mailchimpUsers and flowApiUsers
            flowApiUsers = flowApiUsers.filter(function (o) {
                return mailchimpUsers.some(function (i) {
                    return o.workday_data.upn.toLowerCase() === i.email_address.toLowerCase();
                });
            });

            const converted = this.convertflowApiUsersToMailchimpFormat(mailchimpUsers, flowApiUsers);
            flowApiUsers = converted.flowApiUsers;
            mailchimpUsers = converted.mailchimpUsers;

            flowApiUsers.forEach((flowApiUser) => {
                // filter mailchimp users. we can only update the users with below status
                let mailchimpUser = mailchimpUsers.find((o) => o.email_address.toLowerCase() === flowApiUser.email_address.toLowerCase());
                if (mailchimpUser) {
                    const _changes: Change[] = this.compareObjects(flowApiUser, mailchimpUser);

                    // if (_changes && _changes.length === 1 && _changes[0]["key"] === "status" && _changes[0]["newValue"] === "subscribed") {
                    //     subscribeMembers.push({ status: "subscribed", email_address: flowApiUser.email_address });
                    // } else
                    //  {
                    const tagsFromRules = this.getTagsFromRules(flowApiUser);
                    const missingTags = this.getMissingTags(mailchimpUser, tagsFromRules);

                    if (missingTags?.length > 0) {
                        _changes.push({
                            key: "tags",
                            oldValue: mailchimpUser.tags?.sort(),
                            newValue: missingTags,
                        });
                    }
                    if (_changes.length > 0) {
                        changes.push({ action: "update", emailAddr: flowApiUser.email_address, changes: [..._changes] });
                        const obj = { status: "subscribed", email_address: flowApiUser.email_address };
                        _changes.forEach((change) => {
                            obj[change.key] = change["newValue"];
                        });

                        if (missingTags.length > 0) {
                            // if user has some tags to remove, we have to call separate endpoint. We cannot use members path endpoint
                            const inActiveTags = missingTags?.filter((o) => o.status === "inactive");
                            if (inActiveTags.length > 0) {
                                removeUserTags.push(this.getTagsPost(obj, inActiveTags));
                            }
                            const activeTags = missingTags?.filter((o) => o.status === "active")?.map((o) => o.name);
                            if (activeTags.length > 0) {
                                obj["tags"] = activeTags;
                            }
                        }

                        const body = this.getBody(obj, "PATCH", true);
                        users.push(body);
                    }
                }
                // }
            });
            this.customLogger.info("End getUsersToUpdate");
        } catch (error) {
            this.customLogger.error("Error in getUsersToUpdate", error);
            throw error;
        }
        return {
            count: changes?.length,
            users: { operations: users },
            removeUserTags: { operations: removeUserTags },
            // subscribeMembers: { members: [...subscribeMembers], sync_tags: true, update_existing: true },
            changes,
        };
    }

    private compareObjects(flowApiUser, mailchimpUser): Change[] {
        let changes: Change[] = [];
        try {
            if (flowApiUser && mailchimpUser) {
                const keys = Object.keys(flowApiUser);

                for (let index = 0; index < keys.length; index++) {
                    const key = keys[index];
                    if (flowApiUser[key].toLowerCase() !== mailchimpUser[key].toLowerCase()) {
                        changes.push({
                            key,
                            oldValue: mailchimpUser[key],
                            newValue: flowApiUser[key],
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

    private getMissingTags = (mailchimpUser, tagsFromRules) => {
        if (mailchimpUser && tagsFromRules) {
            let missingTags = [];
            let tagsToAdd = [];
            let mailchimpTags = [];
            try {
                const _tagRules = this.tagRules?.map((o) => o.tagName.toLowerCase().trim()).sort();
                const _tagsFromRules = tagsFromRules?.map((o) => o.toLowerCase().trim()).sort();

                // if mailchimp has extra tags which are not in tagsFromRules (user suppose to have these tags), then remove it from mTags
                if (mailchimpUser?.tags?.length > 0) {
                    mailchimpTags = mailchimpUser.tags?.map((o) => o.toLowerCase().trim());
                }
                // first remove the tags which are added manually (not in tagRules) by someone on mailchimp, example: "TE Base", "TE Premium", "Fingerprint". We should not touch them.
                let extraTags = mailchimpTags?.filter((o) => !_tagsFromRules.includes(o));
                extraTags = extraTags?.filter((o) => _tagRules.includes(o));
                mailchimpTags = mailchimpTags.filter((o) => _tagsFromRules.includes(o));

                // get the tags we want to add to user
                tagsToAdd = tagsFromRules?.map((o) => {
                    return { name: o, status: "active" };
                });
                // get the missing tags which are not in mailchimp
                missingTags = tagsToAdd?.filter((o) => {
                    return !mailchimpTags.some((m) => m.toLowerCase() === o.name.toLowerCase());
                });

                if (extraTags?.length > 0) {
                    // get the tags we want to remove from user
                    if (!missingTags) missingTags = [];
                    missingTags.push(
                        ...extraTags.map((o) => {
                            return { name: this.getTagName(o), status: "inactive" };
                        })
                    );
                }
            } catch (error) {
                this.customLogger.error("Error in getMissingTags", error);
                throw error;
            }
            return missingTags?.sort((a, b) => a.name.localeCompare(b.name));
        }
        return [];
    };

    private getTagName = (tagName) => {
        let _tagName = this.tagRules?.find((o) => o.tagName.toLowerCase() === tagName.toLowerCase())?.tagName;
        return _tagName || "";
    };

    private getTagsFromRules = (user) => {
        try {
            if (user) {
                const tags = [];
                this.tagRules?.forEach((tagRule) => {
                    const titleContains =
                        tagRule.titleContains?.length > 0 ? tagRule.titleContains?.split(",").map((o) => o.trim().toLowerCase()) : [];
                    const titleDoesNotContain =
                        tagRule.titleDoesNotContain?.length > 0 ? tagRule.titleDoesNotContain?.split(",").map((o) => o.trim().toLowerCase()) : [];
                    const includeCostCenter =
                        tagRule.includeCostCenter?.length > 0 ? tagRule.includeCostCenter?.split(",").map((o) => o.trim().toLowerCase()) : [];
                    const excludeCostCenter =
                        tagRule.excludeCostCenter?.length > 0 ? tagRule.excludeCostCenter?.split(",").map((o) => o.trim().toLowerCase()) : [];
                    const userTitle = user.BUS_TITLE.split(" ")
                        .filter((o) => o.trim() !== "")
                        .map((o) => o.trim().toLowerCase())
                        .join(" ");
                    const userTitleArray = user.BUS_TITLE.split(" ")
                        .filter((o) => o.trim() !== "")
                        .map((o) => o.trim().toLowerCase());
                    const COST_CTR = user.COST_CTR.split(" ")[0].trim();
                    let bFlag = false;

                    titleContains.forEach((title) => {
                        if (userTitle.includes(title)) {
                            bFlag = true;
                        }
                    });

                    if (titleContains.length > 0 && titleDoesNotContain.length > 0) {
                        titleDoesNotContain.forEach((title1) => {
                            userTitleArray.forEach((ut) => {
                                if (ut === title1) {
                                    bFlag = false;
                                }
                            });
                        });
                    }
                    if (titleContains.length > 0 && includeCostCenter.length > 0) {
                        if (!includeCostCenter.includes(COST_CTR)) {
                            bFlag = false;
                        }
                    }
                    if (titleContains.length > 0 && excludeCostCenter.length > 0) {
                        if (excludeCostCenter.includes(COST_CTR)) {
                            bFlag = false;
                        }
                    }

                    if (bFlag) {
                        tags.push(tagRule.tagName);
                        bFlag = false;
                    }

                    if (titleContains.length === 0 && titleDoesNotContain.length > 0) {
                        bFlag = true;
                        titleDoesNotContain.forEach((title) => {
                            userTitleArray.forEach((ut) => {
                                if (ut === title) {
                                    bFlag = false;
                                }
                            });
                        });
                    }

                    if (bFlag) {
                        tags.push(tagRule.tagName);
                        bFlag = false;
                    }

                    if (titleContains.length === 0 && includeCostCenter.length > 0) {
                        if (includeCostCenter.includes(COST_CTR)) {
                            bFlag = true;
                        }
                    }

                    if (bFlag) {
                        tags.push(tagRule.tagName);
                    }
                });

                if (user.IS_MANAGER === "Y") {
                    tags.push("Fairway Managers");
                }
                if (user.HAS_NMLS === "N") {
                    tags.push("Operations (non-licensed)");
                }
                tags.push("Fairway ALL");
                return tags?.sort();
            }
        } catch (error) {
            this.customLogger.error("Error in getTagsFromRules", error);
            throw error;
        }
        return [];
    };

    private convertToMailchimpFormat = (flowApiUsers) => {
        let _flowApiUsers = [];
        try {
            _flowApiUsers = flowApiUsers.map((flowApiUser) => {
                const workdayData = flowApiUser.workday_data;
                return {
                    COST_CTR: workdayData.cost_center,
                    FNAME: workdayData.first_name,
                    LNAME: workdayData.last_name,
                    WORK_STATE: workdayData.work_state,
                    BUS_TITLE: workdayData.business_title,
                    IS_MANAGER: workdayData.is_manager === "-" ? "N" : "Y",
                    HAS_NMLS: workdayData.nmls === "-" ? "N" : "Y",
                    email_address: workdayData.upn?.toLowerCase().trim() || "",
                    status: workdayData.active_status === "0" ? "unsubscribed" : "subscribed",
                };
            });
        } catch (error) {
            this.customLogger.error("Error in convertToMailchimpFormat", error);
            throw error;
        }
        return _flowApiUsers;
    };

    private convertflowApiUsersToMailchimpFormat = (mailchimpUsers, flowApiUsers) => {
        let _flowApiUsers = [];
        let _mailchimpUsers = [];
        try {
            _flowApiUsers = this.convertToMailchimpFormat(flowApiUsers);
            _mailchimpUsers = mailchimpUsers.map((mailchimpUser) => {
                return {
                    COST_CTR: mailchimpUser.merge_fields.COST_CTR,
                    FNAME: mailchimpUser.merge_fields.FNAME,
                    LNAME: mailchimpUser.merge_fields.LNAME,
                    WORK_STATE: mailchimpUser.merge_fields.WORK_STATE,
                    BUS_TITLE: mailchimpUser.merge_fields.BUS_TITLE,
                    IS_MANAGER: mailchimpUser.merge_fields.IS_MANAGER,
                    HAS_NMLS: mailchimpUser.merge_fields.HAS_NMLS,
                    email_address: mailchimpUser.email_address.toLowerCase().trim(),
                    tags: mailchimpUser.tags?.length > 0 ? mailchimpUser.tags.map((o) => o.name) : [],
                    status: "subscribed",
                };
            });
        } catch (error) {
            this.customLogger.error("Error in convertflowApiUsersToMailchimpFormat", error);
            throw error;
        }

        return { flowApiUsers: _flowApiUsers, mailchimpUsers: _mailchimpUsers };
    };

    private tagRules = [
        {
            tagName: "Fairway ALL (non-wholesale)",
            titleContains: "",
            includeCostCenter: "",
            excludeCostCenter: "",
            titleDoesNotContain: "wholesale,tpo",
        },
        { tagName: "Liaison", titleContains: "liaison", includeCostCenter: "", excludeCostCenter: "", titleDoesNotContain: "" },
        { tagName: "EVPs", titleContains: "EVP", includeCostCenter: "", excludeCostCenter: "", titleDoesNotContain: "SVP,AVP,VP" },
        { tagName: "SVPs", titleContains: "SVP", includeCostCenter: "", excludeCostCenter: "", titleDoesNotContain: "VP,EVP,AVP" },
        { tagName: "VPs", titleContains: "VP", includeCostCenter: "", excludeCostCenter: "", titleDoesNotContain: "SVP,EVP,AVP" },
        {
            tagName: "Area Managers",
            titleContains: "Area Manager,SVP Area Manager",
            includeCostCenter: "",
            excludeCostCenter: "",
            titleDoesNotContain: "",
        },
        { tagName: "Biz Dev - Cost Center (1014)", titleContains: "", includeCostCenter: "1014", excludeCostCenter: "", titleDoesNotContain: "" },
        {
            tagName: "Branch Managers",
            titleContains: "Branch Manager,Branch Sales Manager,President Branch Production",
            includeCostCenter: "",
            excludeCostCenter: "1180,1181,1182,1183,1184,1151",
            titleDoesNotContain: "",
        },
        {
            tagName: "Branch Marketers",
            titleContains: "Marketing,Marketer,Business Development,Social Media,Branch Business Manager,Art Director",
            includeCostCenter: "",
            excludeCostCenter: "1180,1181,1182,1183,1184,1151",
            titleDoesNotContain: "",
        },
        {
            tagName: "Corporate Marketing",
            titleContains: "",
            includeCostCenter: "1180,1181,1182,1183,1184,1151",
            excludeCostCenter: "",
            titleDoesNotContain: "",
        },
        {
            tagName: "Executives & Presidents",
            titleContains: "Chief,President",
            includeCostCenter: "",
            excludeCostCenter: "",
            titleDoesNotContain: "",
        },
        {
            tagName: "Loan Officers",
            titleContains: "Loan Officer,LO Assistant - Licensed,LOA Team Lead - Licensed,Mortgage Planner",
            includeCostCenter: "",
            excludeCostCenter: "",
            titleDoesNotContain: "",
        },
        {
            tagName: "SVP Area Managers",
            titleContains: "Regional SVP,SVP Area Manager",
            includeCostCenter: "",
            excludeCostCenter: "",
            titleDoesNotContain: "",
        },
        { tagName: "Wholesale", titleContains: "Wholesale,TPO", includeCostCenter: "", excludeCostCenter: "", titleDoesNotContain: "" },
        { tagName: "Reverse", titleContains: "Reverse", includeCostCenter: "", excludeCostCenter: "", titleDoesNotContain: "" },
        { tagName: "Fairway Managers" },
        { tagName: "Operations (non-licensed)" },
    ];

    private getBody(mailChimpUser: any, method, stringifyBody?: boolean) {
        if (mailChimpUser) {
            const body = {};
            const rootKeys = ["email_address", "status", "tags"];
            Object.keys(mailChimpUser).forEach((key) => {
                if (rootKeys.includes(key)) {
                    body[key] = mailChimpUser[key];
                } else {
                    if (!body["merge_fields"]) body["merge_fields"] = {};
                    body["merge_fields"][key] = mailChimpUser[key];
                }
            });
            return {
                method,
                path: method === "POST" ? this.mailChimpRelativeUrl : `${this.mailChimpRelativeUrl}/${mailChimpUser.email_address}`,
                operation_id: this.operationId,
                body: stringifyBody ? JSON.stringify(body) : body,
            };
        }
        return null;
    }

    private getArchiveBody(emailAddress: any) {
        if (emailAddress) {
            return {
                method: "DELETE",
                path: `${this.mailChimpRelativeUrl}/${emailAddress}`,
                operation_id: this.operationId,
            };
        }
        return null;
    }

    private getTagsPost(mailChimpUser: any, tags: any) {
        if (mailChimpUser) {
            return {
                method: "POST",
                path: `${this.mailChimpRelativeUrl}/${mailChimpUser.email_address}/tags`,
                body: JSON.stringify({ tags }),
            };
        }
        return null;
    }
}
