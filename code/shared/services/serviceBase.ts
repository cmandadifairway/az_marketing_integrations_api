import { inject, injectable } from "inversify";
import { container } from "../../inversify.config";
import { TYPES } from "../inversify/types";
import { CustomLogger } from "../Logging/CustomLogger.service";

/**
 * Base class for services to expose some commonly required services such as DI object resolution and config
 */
@injectable()
export class ConfigBase {
    public resolve<T>(symbol: symbol) {
        return container.get<T>(symbol);
    }
}

/**
 * Base class for services to expose some commonly required services such as DI object resolution and config
 */
@injectable()
export class ServiceBase extends ConfigBase {
    @inject(TYPES.CustomLogger)
    public customLogger: CustomLogger;
}
