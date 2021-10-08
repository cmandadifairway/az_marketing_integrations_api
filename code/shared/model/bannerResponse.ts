import { Banner } from "../../shared/model/banner";
import { Response } from "../../shared/model/response";

export class BannerResponse implements Response {
    data: string | Banner | Banner[];
    Error: boolean;
}
