import { Response } from "../../shared/model/response";

export interface SendToHomeBirdService {
    sendToHomeBirdService: (data) => Promise<Response>;
}
