import { ServiceBase } from "../serviceBase";
import axios from "axios";

export class MailChimpApiService extends ServiceBase {
    async getMailChimpApiMembers(): Promise<any> {
        let members = [];
        const asyncCalls = [];
        try {
            this.customLogger.info("Begin getMailChimpApiMembers");
            let count = 10;
            let offset = 0;
            let queryString = `?count=1&offset=${offset}`;
            let baseUrl = "https://us12.api.mailchimp.com/3.0/lists/fa3d2642fe/members";
            const config = {
                method: "get",
                url: `${baseUrl}${queryString}`,
                headers: {
                    Authorization: "Bearer af8c19f3ebbc04a89d1dd9dcaf8db1f6-us12",
                },
            };
            let totalItems = await this.getMailChimpMembersCount();

            const resp = await this.getMailChimpMembersByOffset(config);
            if (resp) {
                if (totalItems > 0) {
                    totalItems = totalItems + 1000;
                    const noOfIterations = Math.round(totalItems / count);
                    queryString = "?fields=members.id,members.email_address,members.status,members.merge_fields,members.tags_count,members.tags";
                    for (let offset = 0; offset < 2; offset++) {
                        queryString = `${queryString}&count=${count}&offset=${offset * count}`;
                        config["url"] = `${baseUrl}${queryString}`;
                        asyncCalls.push(this.getMailChimpMembersByOffset(config));
                    }
                }
            }
            const asyncResp = await Promise.all(asyncCalls);

            asyncResp?.forEach((response) => {
                members = members.concat(response);
            });
            this.customLogger.info("End getMailChimpApiMembers");
        } catch (error) {
            this.customLogger.error("Error while trying to get mailchimp members", error);
            throw error;
        }
        return members;
    }

    async getMailChimpMembersByOffset(config: Object): Promise<any> {
        let resp;
        try {
            this.customLogger.info("Begin getMailChimpMembersByOffset");
            resp = await axios.request(config);
            this.customLogger.info("End getMailChimpMembersByOffset");
        } catch (error) {
            this.customLogger.error("Error while trying to get mailchimp members by offset", error);
            throw error;
        }
        return resp?.data?.members;
    }

    async getMailChimpMembersCount(): Promise<any> {
        let resp;
        let count = 0;
        try {
            this.customLogger.info("Begin getMailChimpMembersCount");
            let url = "https://us12.api.mailchimp.com/3.0/lists/fa3d2642fe/members?count=1&offset=0";
            const config = {
                method: "get",
                url,
                headers: {
                    Authorization: "Bearer af8c19f3ebbc04a89d1dd9dcaf8db1f6-us12",
                },
            };
            resp = await axios.request(config);
            count = resp?.data?.total_items;
            this.customLogger.info("End getMailChimpMembersCount");
        } catch (error) {
            this.customLogger.error("Error while trying to get mailchimp members count", error);
            throw error;
        }
        return count;
    }
}
