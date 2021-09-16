import { container } from "../../inversify.config";
import { TYPES } from "../inversify/types";
import { injectable } from "inversify";
import { CustomLogger } from "./customLogger.service";

@injectable()
export class UtilityService {
    private readonly logger = container.get<CustomLogger>(TYPES.CustomLogger);

    public getBoolean(value: string): boolean {
        switch (value) {
            case "true":
            case "yes":
            case "y":
            case "Y":
                return true;
            default:
                return false;
        }
    }

}
