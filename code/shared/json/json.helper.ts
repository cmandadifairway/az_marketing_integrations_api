import { ConfigBase } from "../services/serviceBase";
const jsonConverter = require("json-2-csv");
const util = require("util");

export interface JSONHelperService {
    convertJsonToCSV: (jsonObject: any) => Promise<any>;
}

/**
 * Helper class for converting JSON to CSV
 */
export class JSONHelper extends ConfigBase implements JSONHelperService {
    asyncFunction = util.promisify(this._convertJsonToCSV);

    async convertJsonToCSV(jsonObject: any): Promise<any> {
        return await this.asyncFunction(jsonObject);
    }

    _convertJsonToCSV(jsonObject: any, json2csvCallback: any) {
        const options = {
            delimiter: {
                wrap: '"', // Double Quote (") character
                field: ",", // Comma field delimiter
                eol: "\n", // Newline delimiter
            },
            prependHeader: true,
            sortHeader: false,
            excelBOM: true,
            trimHeaderValues: true,
            trimFieldValues: true,
            emptyFieldValue: "",
            // keys: ['Make', 'Model', 'Year', 'Specifications.Mileage', 'Specifications.Trim']
            expandArrayObjects: true,
        };
        jsonConverter.json2csv(jsonObject, json2csvCallback, options);
    }

    json2csvCallback = function (err: any, csv: any) {
        if (err) {
            throw err;
        }
        return csv;
    };
}
