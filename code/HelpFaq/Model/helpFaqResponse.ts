import { ContentHistory } from "../../shared/model/ContentHistory";
import { Response } from "../../shared/model/response";

export class HelpFaqResponse implements Response {
    data: HelpFaq[];
    Error: boolean;
}

export interface HelpFaq {
    _id: string;
    question: string;
    answer: string;
    answerType: AnswerType;
    active?: boolean;
    partitionKey?: string;
    category: string;
    history?: Array<ContentHistory>;
    orderBy: number;
}

export enum AnswerType {
    HTML = "html",
    Image = "image",
    Text = "text",
    Video = "video",
}
