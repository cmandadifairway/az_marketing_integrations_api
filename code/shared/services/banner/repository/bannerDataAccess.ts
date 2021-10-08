import { DataAccessBase } from "../../dataAccessBase";
import { ObjectId } from "mongodb";
import { BannerDao } from "../../../model/bannerDao";
import { BannerResponse } from "../../../../shared/model/bannerResponse";

export interface BannerDataService {
    createBanner: (data: BannerDao) => Promise<BannerResponse>;
    updateBanner: (data: BannerDao) => Promise<BannerResponse>;
}

export class BannerDataAccess extends DataAccessBase implements BannerDataService {
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
