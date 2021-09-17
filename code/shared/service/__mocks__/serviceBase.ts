import { container } from "../../../inversify.config";
import { CustomLoggerImpl } from "../../utils/customLoggerImpl.service";

export class ConfigBase {
    public resolve<T>(symbol: symbol) {
        return container.get<T>(symbol);
    }
}

export class ServiceBase extends ConfigBase {
    public logger: CustomLoggerImpl;

    constructor() {
        super();
        this.logger = new CustomLoggerImpl();
    }
}
