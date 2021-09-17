import { inject, injectable } from "inversify";
import { TYPES } from "../inversify/types";
import { CustomLogger } from "../utils/customLogger.service";
import { DbConnectionService } from "./databaseConfig/databaseConn.service";
import { ConfigBase } from "./serviceBase";

/**
 * Base class for database services to expose the commonly required services
 */
@injectable()
export class DataAccessBase extends ConfigBase {
    @inject(TYPES.CustomLogger)
    public logger: CustomLogger;

    @inject(TYPES.DbConnectionService)
    public dbConnectionService: DbConnectionService;
}
