import { ServiceBase } from "../services/serviceBase";
import { UtilityService } from "./utility.service";

/**
 * Utility class
 */
export class Utility extends ServiceBase implements UtilityService {
    /**
     * Returns today's date in current timezone
     */
    getTodaysDate(): string {
        return this.formatDate(new Date());
    }

    /**
     * Formats date in current timezone
     * @param date
     */
    formatDate(date: Date): string {
        return new Intl.DateTimeFormat("en-US").format(date);
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
}
