import { container } from "../../../inversify.config";
import { CustomLoggerImpl } from "../../Logging/CustomLoggerImpl.service";

export class ConfigBase {
    public resolve<T>(symbol: symbol) {
        return container.get<T>(symbol);
    }
}

export class ServiceBase extends ConfigBase {
    public customLogger: CustomLoggerImpl;

    constructor() {
        super();
        this.customLogger = new CustomLoggerImpl();
    }
}
