import { ContentHistory } from "./contentHistory";

export interface Banner {
    _id: string;
    bannerMessage: string;
    bannerUrl: string;
    active?: boolean;
    viewLimit: number;
    expirationDate: string;
    history?: ContentHistory[];
}
