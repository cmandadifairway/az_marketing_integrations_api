import { CustomLoggerImpl } from "../../utils/customLoggerImpl.service";
import { DbConnectionService } from "../databaseConfig/databaseConn.service";
jest.mock("../databaseConfig/databaseConn.service");
jest.mock("../keyVault/keyVaultImpl.service");
import { ConfigBase } from "./serviceBase";

export class DataAccessBase extends ConfigBase {
    public logger: CustomLoggerImpl;
    public dbConnectionService: DbConnectionService;

    constructor() {
        super();
        this.logger = new CustomLoggerImpl();
        this.dbConnectionService = new DbConnectionService();
    }
}
