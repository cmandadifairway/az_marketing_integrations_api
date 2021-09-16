import { ServiceBase } from "../serviceBase";
import { CreateFaqDao } from "../../model/createFaqDao";
import { CreateFaqRequest } from "../../../CreateFaq/model/createFaqRequest";
import { FaqDetailsDao } from "../../model/faqDetailsDao";
import { TYPES } from "../../inversify/types";
import { HelpFaqDataService } from "./repository/helpFaqDataAccess";
import { Response } from "../../../shared/model/response";
import { UpdateFaqRequest } from "../../../UpdateFaq/model/updateFaqRequest";

export interface HelpFaqService {
    createFaq(data: CreateFaqRequest): Promise<Response>;
    updateFaq(data: UpdateFaqRequest): Promise<Response>;
}

export class HelpFaq extends ServiceBase implements HelpFaqService {
    private readonly helpFaqDataService = this.resolve<HelpFaqDataService>(TYPES.HelpFaqDataService);

    async createFaq(data: CreateFaqRequest): Promise<Response> {
        const getDate = new Date(Date.now());
        const createFaqObj: CreateFaqDao = {
            question: data.question,
            answer: data.answer,
            answerType: data.answerType,
            active: data.active,
            category: data.category,
            orderBy: data.orderBy || 1,
            history: [
                {
                    historyDT: getDate,
                    username: data.username || "admin",
                },
            ],
        };

        return await this.helpFaqDataService.createFaq(createFaqObj);
    }

    async updateFaq(data: UpdateFaqRequest): Promise<Response> {
        const updateFaqObj: FaqDetailsDao = new FaqDetailsDao();
        const getDate = new Date(Date.now());
        updateFaqObj.id = data.id;
        updateFaqObj.question = data.question;
        updateFaqObj.answer = data.answer;
        updateFaqObj.answerType = data.answerType;
        updateFaqObj.active = data.active;
        updateFaqObj.category = data.category;
        updateFaqObj.history = {
            historyDT: getDate,
            username: data.username || "admin",
        };
        updateFaqObj.orderBy = data.orderBy || 1;

        return await this.helpFaqDataService.updateFaq(updateFaqObj);
    }
}
