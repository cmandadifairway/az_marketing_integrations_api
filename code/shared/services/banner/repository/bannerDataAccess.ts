import { Banner } from "./../../../model/banner";
import { DataAccessBase } from "../../dataAccessBase";
import { ObjectId, ReadPreference } from "mongodb";
import { BannerDao } from "../../../model/bannerDao";
import { BannerResponse } from "../../../../Banners/Model/bannerResponse";

export interface BannerDataService {
    createBanner: (data: BannerDao) => Promise<BannerResponse>;
    updateBanner: (data: BannerDao) => Promise<BannerResponse>;
    getBanners: (forMobile: boolean) => Promise<BannerResponse>;
}

export class BannerDataAccess extends DataAccessBase implements BannerDataService {
    async getBanners(mobile: boolean): Promise<BannerResponse> {
        let bannerResponse: BannerResponse;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const query = this.buildGetBannerQuery(mobile);

            let banner: Banner | Banner[];

            if (mobile) {
                const projection = {
                    bannerMessage: 1,
                    bannerUrl: 1,
                    viewLimit: 1,
                    expirationDate: 1,
                };
                banner = await db
                    .collection("helpFaqs", { readPreference: ReadPreference.SECONDARY_PREFERRED })
                    .findOne<Banner>(query, { projection });
            } else {
                banner = await db
                    .collection("helpFaqs", { readPreference: ReadPreference.SECONDARY_PREFERRED })
                    .find<Banner>(query)
                    .toArray();
            }

            bannerResponse = {
                data: banner,
                Error: false,
            };
        } catch (error) {
            this.customLogger.error("Error while creating banner in BannerDataAccess", error);
            throw error;
        }
        return bannerResponse;
    }

    async createBanner(data: BannerDao): Promise<BannerResponse> {
        let response: BannerResponse;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            data._id = new ObjectId();
            data.partitionKey = data._id.toString();
            const result = await db.collection("helpFaqs").insertOne(data);
            let msg = "Successfully inserted banner.";
            if (!result.acknowledged) {
                msg = "No banner was inserted.";
                this.customLogger.info(msg);
            }
            response = {
                data: msg,
                Error: false,
            };
        } catch (error) {
            this.customLogger.error("Error while creating banner in BannerDataAccess", error);
            throw error;
        }
        return response;
    }

    async updateBanner(data: BannerDao): Promise<BannerResponse> {
        let response: BannerResponse;
        try {
            const db = await this.dbConnectionService.getDbConfiguration();
            const updateQuery = this.buildUpdateBannerQuery(data);
            const result = await db
                .collection("helpFaqs")
                .updateOne({ _id: new ObjectId(data.partitionKey) }, updateQuery);
            let msg = "Successfully updated banner.";
            if (result.modifiedCount < 1) {
                msg = "No banner was modified.";
                this.customLogger.info(msg);
            }
            response = {
                data: msg,
                Error: false,
            };
        } catch (error) {
            this.customLogger.error("Error while updating banner in BannerDataAccess", error);
            throw error;
        }
        return response;
    }

    private buildGetBannerQuery(forMobile: boolean): object {
        let obj = {
            category: "banner",
        };
        if (forMobile) {
            obj["expirationDate"] = {
                $gt: new Date(Date.now()),
            };
            obj["active"] = true;
        }
        return obj;
    }

    private buildUpdateBannerQuery(data: BannerDao): object {
        const history = data.history[0];
        if (data) {
            delete data["_id"];
            delete data["history"];
        }
        return {
            $set: {
                ...data,
            },
            $push: { history },
        };
    }
}
