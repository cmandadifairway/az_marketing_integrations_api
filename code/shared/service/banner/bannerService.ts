import { ServiceBase } from "../serviceBase";
import { ObjectId } from "mongodb";
import { BannerResponse } from "../../model/bannerResponse";
import { CreateBannerRequest } from "../../../CreateBanner/model/createBannerRequest";
import { UpdateBannerRequest } from "../../../UpdateBanner/model/updateBannerRequest";
import { TYPES } from "../../inversify/types";
import { BannerDao } from "../../model/bannerDao";
import { BannerDataService } from "./repository/bannerDataAccess";

export interface BannerService {
    createBanner(data: CreateBannerRequest): Promise<BannerResponse>;
    updateBanner(data: UpdateBannerRequest): Promise<BannerResponse>;
}

export class Banners extends ServiceBase implements BannerService {
    private readonly bannerDataService = this.resolve<BannerDataService>(TYPES.BannerDataService);

    async createBanner(data: CreateBannerRequest): Promise<BannerResponse> {
        const id = new ObjectId();
        // The following will take in the date that's in a local time zone and convert it to a UTC date.
        // Local debugging will show final date in local time zone but cloud will be UTC.
        const expirationDate = new Date(data.expirationDate);
        const bannerObj: BannerDao = {
            _id: id,
            partitionKey: id.toString(),
            category: "banner",
            expirationDate: expirationDate,
            active: data.active,
            bannerMessage: data.message,
            viewLimit: data.viewLimit,
            bannerUrl: data.url,
            history: [
                {
                    historyDT: new Date(Date.now()),
                    username: data.username,
                },
            ],
        };

        return await this.bannerDataService.createBanner(bannerObj);
    }

    async updateBanner(data: UpdateBannerRequest): Promise<BannerResponse> {
        const id = new ObjectId(data.id);
        const expirationDate = new Date(data.expirationDate);

        const bannerObj: BannerDao = {
            _id: id,
            partitionKey: id.toString(),
            category: "banner",
            expirationDate: expirationDate,
            active: data.active,
            bannerMessage: data.message,
            viewLimit: data.viewLimit,
            bannerUrl: data.url,
            history: [
                {
                    historyDT: new Date(Date.now()),
                    username: data.username,
                },
            ],
        };

        return await this.bannerDataService.updateBanner(bannerObj);
    }
}
