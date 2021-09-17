import { BannerDao } from "../../../model/bannerDao";
import { BannerDataAccess } from "./bannerDataAccess";
import { ObjectId } from "mongodb";

describe("Banner Data Access Service tests", () => {
    const id = new ObjectId();
    const expirationDate = new Date(Date.now());

    const validInputDal: BannerDao = {
        _id: id,
        partitionKey: id.toString(),
        category: "banner",
        expirationDate: expirationDate,
        active: true,
        bannerMessage: "test message",
        viewLimit: 2,
        bannerUrl: "testurl.com",
        history: [
            {
                historyDT: new Date(Date.now()),
                username: "testusername",
            },
        ],
    };

    test("update should send a valid result as data exists", async () => {
        const spy = jest
            .spyOn(BannerDataAccess.prototype, "updateBanner")
            .mockImplementation(() => Promise.resolve({ data: "Successfully updated banner.", Error: false }));
        const updateBannerDal = new BannerDataAccess();
        const result = await updateBannerDal.updateBanner(validInputDal);
        expect(spy).toHaveBeenCalled();
        expect(result.Error).toBeFalsy();
        expect(result.data).toBe("Successfully updated banner.");
    });

    test("update should send a message of nothing modified when sent wrong input", async () => {
        const spy = jest
            .spyOn(BannerDataAccess.prototype, "updateBanner")
            .mockImplementation(() => Promise.resolve({ data: "No banner were modified.", Error: false }));
        const updateBannerDal = new BannerDataAccess();
        const result = await updateBannerDal.updateBanner(new BannerDao());
        expect(spy).toHaveBeenCalled();
        expect(result.Error).toBeFalsy();
        expect(result.data).toBe("No banner were modified.");
    });
});
