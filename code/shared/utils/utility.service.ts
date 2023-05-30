import { ServiceBase } from "../services/serviceBase";

/**
 * Utility class
 */
export class UtilityService extends ServiceBase {
    /**
     * To save the file locally, for testing purposes
     * @param data - data
     * @param path  - path to save the file
     */
    async saveFileLocally(data: Object, fileName: string, folder?: string): Promise<boolean> {
        const fs = require("fs");
        try {
            if (process.env["environment"] === "local") {
                let path = "C:\\Users\\chandra.mandadi\\Downloads\\ADFIntegrations";
                if (folder && folder.length > 0) {
                    path = path + "\\" + folder;
                }
                const filePath = `${path}\\${fileName}`;
                fs.mkdirSync(path, { recursive: true });
                await fs.writeFileSync(filePath, filePath.endsWith(".json") ? JSON.stringify(data) : data);
                return true;
            }
        } catch (err) {
            console.error(err);
        }
        return false;
    }

    /**
     * Reads the file from given path
     * @param path
     */
    async readFile(path: string): Promise<any> {
        const fs = require("fs");
        try {
            const rawData = await fs.readFileSync(path);
            const data = path.endsWith(".json") ? JSON.parse(rawData) : rawData;
            return data;
        } catch (err) {
            console.error(err);
        }
        return null;
    }

    /**
     * Returns today's date in current timezone
     */
    getTodaysDate(): string {
        return this.formatDate(new Date());
    }

    getDate(daysAgo: number): Date {
        const dtDaysAgo = new Date();
        dtDaysAgo.setDate(dtDaysAgo.getDate() - daysAgo);
        return dtDaysAgo;
    }

    /**
     * Formats date in current timezone
     * @param date
     */
    formatDate(date: Date): string {
        let dd = date.getDate();
        let mm = date.getMonth() + 1; //January is 0!
        let day, month;

        var yyyy = date.getFullYear();
        day = dd < 10 ? "0" + dd : dd;
        month = mm < 10 ? "0" + mm : mm;

        return yyyy + "-" + month + "-" + day;
        // return new Intl.DateTimeFormat("en-US").format(date);
    }

    changeTimezone(date: string): string {
        let intlDateObj = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Chicago",
        });
        let date1 = new Date(date);
        let usaDate = intlDateObj.format(date1);
        return usaDate;
    }

    /**
     * Returns true if the given date is today
     * @param date
     */
    isToday(date: Date): boolean {
        const diff = this.getTimeDiff(this.getTodaysDate(), this.formatDate(date));
        return diff === 0;
    }

    /**
     * Returns true if the given string is a date
     * @param dateStr
     */
    isDate(dateStr: string): boolean {
        try {
            const date = this.convertStringToDate(dateStr);
        } catch (error) {
            return false;
        }
    }

    convertStringToDate(dateStr: string): Date {
        var dateParts = dateStr.split("-");
        return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    }

    /**
     * Returns the difference between two times
     * @param startTime
     * @param endTime
     */
    getTimeDiff(startTime: Date | string, endTime: Date | string): number {
        const firstDate = new Date(startTime),
            secondDate = new Date(endTime),
            timeDifference = Math.abs(secondDate.getTime() - firstDate.getTime());

        if (timeDifference > 0) {
            return Math.round(timeDifference / 500 / 60);
        }

        return timeDifference;
    }

    /**
     * Converts given value to empty if value is null
     * @param x
     */
    convertNullToString(x: any): string {
        return x !== undefined && x !== null ? x.toString() : "";
    }

    /**
     * Converts give value to boolean if value is null
     * @param x
     */
    convertNullToBoolean(x: any): boolean {
        return x !== undefined && x !== null ? x : false;
    }

    isNumber(x: string): boolean {
        return parseInt(x) === NaN;
    }

    convertToLowerCase(val: any): string {
        let retVal = val;
        if (val) {
            try {
                retVal = retVal ? retVal.toString().toLowerCase() : "";
            } catch (error) {
                retVal = "";
            }
            return retVal;
        }
        return "";
    }

    convertToNumber(val: any): number {
        let retVal = val;
        if (val) {
            try {
                retVal = parseInt(val);
            } catch (error) {
                retVal = 0;
            }
            return retVal;
        }
        return 0;
    }

    /**
     * Sorts an array
     * @param arr
     * @param descending
     */
    sortArray(arr, descending?: boolean): any {
        const isDescending = this.convertNullToBoolean(descending);
        try {
            if (arr) {
                if (isDescending) {
                    return arr?.sort().reverse();
                } else {
                    return arr?.sort();
                }
            }
        } catch (error) {
            // do nothing
        }
        return arr;
    }

    /**
     * Returns an array with arrays of the given size.
     * @param array {Array} Array to split
     * @param chunkSize {Integer} Size of every group
     */
    chunkArray(array: any, chunk_size: any): any[] {
        var results = [];
        if (array && array.length > 0) {
            while (array.length) {
                results.push(array.splice(0, chunk_size));
            }
        }
        return results;
    }

    /**
     * Deletes a property from object
     * @param obj
     * @param propertyName
     */
    deleteProperty(obj: Object, propertyName: string): void {
        if (obj && obj.hasOwnProperty(propertyName)) {
            delete obj[propertyName];
        }
    }

    /**
     * Compares two values and returns if they are equal
     * @param x
     * @param y
     */
    isEqual(x: any, y: any): boolean {
        return this.convertNullToString(x).trim().toLowerCase() === this.convertNullToString(y).trim().toLowerCase();
    }

    /**
     * Compares two arrays and returns if they are equal
     * @param x
     * @param y
     */
    isArrayEqual(x: any, y: any): boolean {
        try {
            if (x && y) {
                const xValue = this.sortArray(x);
                const yValue = this.sortArray(y);
                // outputs?.sort().reverse().join(";");
                return xValue.join(",").toLocaleLowerCase() === yValue.join(",").toLocaleLowerCase();
            }
        } catch (error) {
            // do nothing
        }
        return false;
    }

    /**
     * Converts readable stream to string
     * @param readableStream
     */
    async streamToString(readableStream) {
        return new Promise<string>((resolve, reject) => {
            const chunks = [];
            readableStream.on("data", (data) => {
                chunks.push(data.toString());
            });
            readableStream.on("end", () => {
                resolve(chunks.join(""));
            });
            readableStream.on("error", reject);
        });
    }

    public getDistinctValues(array: any[], key: string, sort?: boolean): string[] {
        const arr = this.uniqueByKey(array, key);
        const newArr = arr.filter((o) => {
            return o[key] !== null;
        });
        const arrDistinct = newArr.map((o) => {
            return o[key];
        });
        if (sort) {
            return arrDistinct.sort();
        } else {
            return arrDistinct;
        }
    }

    private uniqueByKey(array: any[], key: string): any[] {
        const result = [];
        const map = new Map();
        for (const item of array) {
            if (Array.isArray(item)) {
                item.forEach((element) => {
                    if (!map.has(element[key])) {
                        map.set(element[key], true); // set any value to Map
                        const obj = {};
                        obj[key] = element[key];
                        result.push(obj);
                    }
                });
            } else {
                if (!map.has(item[key])) {
                    map.set(item[key], true); // set any value to Map
                    const obj = {};
                    obj[key] = item[key];
                    result.push(obj);
                }
            }
        }
        return result;
    }

    public async flattenJSONArray_old(data: any[]) {
        let items = [];
        if (data && data.length > 0) {
            const asyncCalls = [];
            data.forEach((o) => {
                asyncCalls.push(this.flattenJSON(o));
            });
            const results = await Promise.all(asyncCalls);
            results.forEach((result) => {
                items.push(result);
            });
        }
        return items;
    }

    public async flattenJSONArray(data: any[]) {
        let items = [];
        if (data && data.length > 0) {
            items = await Promise.all(
                data.map(async (o) => {
                    return await this.flattenJSON(o);
                })
            );
        }
        return items;
    }

    public async flattenJSON(obj = {}, res = {}, extraKey = "") {
        for (const key in obj) {
            if (typeof obj[key] !== "object") {
                res[extraKey + key] = obj[key];
            } else {
                await this.flattenJSON(obj[key], res, `${extraKey}${key}.`);
            }
        }
        return res;
    }

    private _lodash = require("lodash");

    public async unFlattenJSON(flattedObject) {
        let result;
        for await (const key of this._lodash.keys(flattedObject)) {
            if (!result) result = {};
            this._lodash.set(result, key, flattedObject[key]);
        }
        return result;
    }

    // public async unFlattenJSON(flattedObject) {
    //     var _ = require("lodash");
    //     let result;
    //     _.keys(flattedObject).forEach(function (key, value) {
    //         if (!result) result = {};
    //         _.set(result, key, flattedObject[key]);
    //     });
    //     return result;
    // }

    public flattenJSON_Sync(obj = {}, res = {}, extraKey = "") {
        for (const key in obj) {
            if (typeof obj[key] !== "object") {
                res[extraKey + key] = obj[key];
            } else {
                this.flattenJSON_Sync(obj[key], res, `${extraKey}${key}.`);
            }
        }
        return res;
    }

    public unFlattenJSON_Sync(flattedObject) {
        let result;
        this._lodash.keys(flattedObject).forEach(function (key, value) {
            if (!result) result = {};
            this._lodash.set(result, key, flattedObject[key]);
        });
        return result;
    }

    public stringToEnumByValue = <T>(enumObj: Object, value: string): T | undefined =>
        Object.values(enumObj).find((v) => v.toLowerCase() === value.toLowerCase());
    public stringToEnumByKey = (enumObj: Object, value: string): string => Object.keys(enumObj).find((v) => v.toLowerCase() === value.toLowerCase());
}
