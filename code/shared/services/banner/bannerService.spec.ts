import { ObjectId } from "mongodb";
import { UpdateBannerRequest } from "../../../UpdateBanner/Model/updateBannerRequest";
import { Banners } from "./bannerService";
import { BannerDataAccess } from "./repository/bannerDataAccess";

describe("Banner Service", () => {
    const validInputRequest: UpdateBannerRequest = {
        id: new ObjectId().toString(),
        expirationDate: new Date(Date.now()).toUTCString(),
        active: true,
        message: "test",
        viewLimit: 2,
        url: "test.com",
        username: "test",
    };

    test("Update should send a valid result as data exists", async () => {
        const spy = jest
            .spyOn(BannerDataAccess.prototype, "updateBanner")
            .mockImplementation(() => Promise.resolve({ data: "Successfully updated banner.", Error: false }));
        const bannerService = new Banners();
        const result = await bannerService.updateBanner(validInputRequest);
        expect(spy).toHaveBeenCalled();
        expect(result.Error).toBeFalsy();
        expect(result.data).toBe("Successfully updated banner.");
    });
});
