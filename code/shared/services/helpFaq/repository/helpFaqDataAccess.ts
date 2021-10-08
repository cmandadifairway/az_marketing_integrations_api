import { DataAccessBase } from "../../dataAccessBase";
import { ObjectId, ReadPreference, Sort } from "mongodb";
import { CreateFaqDao } from "../../../model/createFaqDao";
import { FaqDetailsDao } from "../../../model/faqDetailsDao";
import { Response } from "../../../model/response";

export interface HelpFaqDataService {
    createFaq(data: CreateFaqDao): Promise<Response>;
    updateFaq(data: FaqDetailsDao): Promise<Response>;
}

export class HelpFaqDataAccess extends DataAccessBase implements HelpFaqDataService {

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
