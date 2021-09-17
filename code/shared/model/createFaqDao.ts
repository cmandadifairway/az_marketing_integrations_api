import { ObjectId } from "mongodb";
import { ContentHistory } from "./ContentHistory";

export interface CreateFaqDao {
    _id?: ObjectId;
    partitionKey?: string;
    question: string;
    answer: string;
    answerType: string;
    active: boolean;
    category: string;
    history: Array<ContentHistory>;
    orderBy: number;
}
