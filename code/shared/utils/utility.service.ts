export interface UtilityService {
    getTodaysDate: () => string;
    formatDate: (date: Date) => string;
    changeTimezone: (date: string) => string;
    isToday: (date: Date) => boolean;
    getTimeDiff: (startTime: Date | string, endTime: Date | string) => number;
    convertNullToString: (x: any) => string;
    convertNullToBoolean: (x: any) => boolean;
    sortArray: (arr: any, descending?: boolean) => any;
    chunkArray: (array: any, chunk_size: any) => any[];
    deleteProperty: (obj: Object, propertyName: string) => void;
    isEqual: (x: any, y: any) => boolean;
    isArrayEqual: (x: any, y: any) => boolean;
    isDate: (dateStr: string) => boolean;
    convertStringToDate: (dateStr: string) => Date;
    isNumber: (x: any) => boolean;
}
