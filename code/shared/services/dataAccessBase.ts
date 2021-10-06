import { inject, injectable } from "inversify";
import { TYPES } from "../inversify/types";
import { CustomLogger } from "../Logging/CustomLogger.service";
import { DbConnectionService } from "./databaseConfig/databaseConn.service";
import { ConfigBase } from "./serviceBase";

/**
 * Base class for database services to expose the commonly required services
 */
@injectable()
export class DataAccessBase extends ConfigBase {
    @inject(TYPES.CustomLogger)
    public customLogger: CustomLogger;

    @inject(TYPES.DbConnectionService)
    public dbConnectionService: DbConnectionService;
}
