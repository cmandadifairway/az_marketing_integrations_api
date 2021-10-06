import { DataAccessBase } from "../../dataAccessBase";
import { ObjectId, ReadPreference, Sort } from "mongodb";
import { CreateFaqDao } from "../../../model/createFaqDao";
import { HelpFaqRequest } from "../../../../HelpFaq/Model/helpFaqRequest";
import { HelpFaq, HelpFaqResponse } from "../../../../HelpFaq/Model/helpFaqResponse";
import { FaqDetailsDao } from "../../../model/faqDetailsDao";
import { Response } from "../../../model/response";

export interface HelpFaqDataService {
    getFaqs(data: HelpFaqRequest, forMobile: boolean): Promise<HelpFaqResponse>;
    createFaq(data: CreateFaqDao): Promise<Response>;
    updateFaq(data: FaqDetailsDao): Promise<Response>;
}

export class HelpFaqDataAccess extends DataAccessBase implements HelpFaqDataService {
    async getFaqs(data: HelpFaqRequest, forMobile: boolean): Promise<HelpFaqResponse> {
        let helpFaqResponse: HelpFaqResponse;
        try {
            const sortBy: Sort = { orderBy: 1 };
            const db = await this.dbConnectionService.getDbConfiguration();
            const query = this.buildGetFaqQuery(data);

            let projection: object;
            if (forMobile) {
                projection = {
                    question: 1,
                    answer: 1,
                    answerType: 1,
                    category: 1,
                    orderBy: 1,
                };
            } else {
                projection = {
                    question: 1,
                    partitionKey: 1,
                    answer: 1,
                    answerType: 1,
                    active: 1,
                    category: 1,
                    history: 1,
                    orderBy: 1,
                };
            }
            const faqs = await db
                .collection("helpFaqs", { readPreference: ReadPreference.SECONDARY_PREFERRED })
                .find(query)
                .sort(sortBy)
                .project<HelpFaq>(projection)
                .toArray();

            helpFaqResponse = {
                data: faqs,
                Error: false,
            };
        } catch (error) {
            this.customLogger.error("Error while getting faqs in helpFaqDataAccess", error);
            throw error;
        }
        return helpFaqResponse;
    }

    async createFaq(data: CreateFaqDao): Promise<Response> {
        let response: Response;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            data._id = new ObjectId();
            data.partitionKey = data._id.toString();
            const result = await db.collection("helpFaqs").insertOne(data);
            let msg = "Successfully inserted faq.";
            if (!result.acknowledged) {
                msg = "No faqs were inserted.";
                this.customLogger.info(msg);
            }
            response = {
                data: msg,
                Error: false,
            };
        } catch (error) {
            this.customLogger.error("Error while creating faq in helpFaqDataAccess", error);
            throw error;
        }
        return response;
    }

    async updateFaq(data: FaqDetailsDao): Promise<Response> {
        let response: Response;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const updateQuery = this.buildUpdateFaqQuery(data);
            const result = await db.collection("helpFaqs").updateOne({ partitionKey: data.id }, updateQuery);
            let msg = "Successfully updated faq.";
            if (result.modifiedCount < 1) {
                msg = "No faqs were modified.";
                this.customLogger.info(msg);
            }
            response = {
                data: msg,
                Error: false,
            };
        } catch (error) {
            this.customLogger.error("Error while updating faq in helpFaqDataAccess", error);
            throw error;
        }
        return response;
    }

    private buildGetFaqQuery(data: HelpFaqRequest): object {
        let obj = {};
        if (data.active) {
            obj["active"] = Boolean(data.active);
        }
        if (data.category) {
            obj["category"] = data.category.toLowerCase();
        } else {
            obj["category"] = { $ne: "banner" };
        }
        return obj;
    }

    private buildUpdateFaqQuery(data: FaqDetailsDao): object {
        return {
            $set: {
                category: data.category,
                question: data.question,
                answer: data.answer,
                answerType: data.answerType,
                active: data.active,
                orderBy: data.orderBy,
            },
            $push: { history: data.history },
        };
    }
}
