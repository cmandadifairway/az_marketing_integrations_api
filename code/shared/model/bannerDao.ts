import { ObjectId } from "mongodb";
import { ContentHistory } from "./contentHistory";

export class BannerDao {
    _id: ObjectId;
    partitionKey?: string;
    bannerMessage: string;
    bannerUrl: string;
    active: boolean;
    category: string;
    viewLimit: number;
    expirationDate: Date;
    history: Array<ContentHistory>;
}
