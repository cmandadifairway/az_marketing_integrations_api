import { CustomLoggerImpl } from "../../Logging/CustomLoggerImpl.service";
import { DbConnectionService } from "../databaseConfig/databaseConn.service";
jest.mock("../databaseConfig/databaseConn.service");
jest.mock("../keyVault/keyVaultImpl.service");
import { ConfigBase } from "./serviceBase";

export class DataAccessBase extends ConfigBase {
    public customLogger: CustomLoggerImpl;
    public dbConnectionService: DbConnectionService;

    constructor() {
        super();
        this.customLogger = new CustomLoggerImpl();
        this.dbConnectionService = new DbConnectionService();
    }
}
