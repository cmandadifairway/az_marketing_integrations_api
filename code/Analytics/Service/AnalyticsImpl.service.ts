import { ServiceBase } from "../../shared/services/serviceBase";
import { AnalyticsService } from "./Analytics.service";
import { DateFrequency } from "../Classes/dateFrequency";
import { TYPES } from "../../shared/inversify/types";
import { AnalyticsRequest } from "../Classes/analyticsRequest";
import { LoanOfficerService } from "../../shared/services/loanOfficer/loanOfficerService";
import { AnalyticsResponse } from "../Classes/analyticsResponse";

export class AnalyticsServiceImpl extends ServiceBase implements AnalyticsService {
    private readonly loDataService = this.resolve<LoanOfficerService>(TYPES.LoanOfficerService);

    async getAnalytics(requestData: AnalyticsRequest): Promise<AnalyticsResponse> {
        let analyticsResponse: AnalyticsResponse;
        try {
            const loResponse = await this.loDataService.getLoanOfficer(requestData.loEmail);
            const loanOfficer = loResponse.data;
            const dataFrequency = requestData.frequency;
            let minDate = this.convertStringToDate(requestData.minDate);
            let maxDate = this.convertStringToDate(requestData.maxDate);
            let years = this.getYears(minDate, maxDate);
            let analyticsData = {};
            let dateNumbers: string[];

            for (let index = 0; index < years.length; index++) {
                if (loanOfficer[years[index]]) {
                    if (dataFrequency === DateFrequency.MONTH) {
                        dateNumbers = this.getMonths(minDate, maxDate, years[index]);
                    } else {
                        dateNumbers = this.getDays(minDate, maxDate, years[index]);
                    }

                    let yearData = this.getDataForYear(
                        loanOfficer[years[index]][dataFrequency],
                        dateNumbers,
                        years[index],
                        dataFrequency
                    );

                    analyticsData = this.mapDataForReturn(analyticsData, yearData);
                }
            }

            analyticsResponse = {
                data: analyticsData,
                Error: false,
            };
        } catch (error) {
            this.customLogger.info(`APP INFO:: Error parsing LO data in AnalyticsService,${error}`);
            throw error;
        }
        return analyticsResponse;
    }

    private convertStringToDate(dateStr: string): Date {
        var dateParts = dateStr.split("-");
        return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    }

    private getYears(minDate: Date, maxDate: Date): number[] {
        let years = [];
        const minDateYear = minDate.getFullYear();
        const maxDateYear = maxDate.getFullYear();
        for (let index = minDateYear; index <= maxDateYear; index++) {
            years.push(index);
        }
        return years;
    }

    private getMonths(minDate: Date, maxDate: Date, year: number): string[] {
        let dateNumbers: string[] = [],
            index = 1,
            maxIndex = 12,
            minDateNumber = minDate.getMonth() + 1,
            maxDateNumber = maxDate.getMonth() + 1;

        // in the same year
        if (minDate.getFullYear() === year && maxDate.getFullYear() === year) {
            index = minDateNumber;
            maxIndex = maxDateNumber;
        }
        // same as the min year but not max year
        // (i.e. if range is may 2019 - may 2020 but we're grabbing year 2019)
        else if (minDate.getFullYear() === year && maxDate.getFullYear() != year) {
            index = minDateNumber;
        }
        // same as the max year but not min year
        // (i.e. if range is may 2019 - may 2020 but we're grabbing year 2020)
        else if (minDate.getFullYear() != year && maxDate.getFullYear() === year) {
            maxIndex = maxDateNumber;
        }
        // else it's not min or max year and we go with the defaults set above
        // (i.e. if range is may 2019 - may 2021 but we're grabbing year 2020)

        for (index; index <= maxIndex; index++) {
            dateNumbers.push(index.toString());
        }

        return dateNumbers;
    }

    private getDays(minDate: Date, maxDate: Date, year: number): string[] {
        let dateNumbers: string[] = [],
            index,
            maxIndex;

        // in the same year
        if (minDate.getFullYear() === year && maxDate.getFullYear() === year) {
            index = new Date(minDate);
            maxIndex = new Date(maxDate);
        }
        // same as the min year but not max year
        // (i.e. if range is may 2019 - may 2020 but we're grabbing year 2019)
        else if (minDate.getFullYear() === year && maxDate.getFullYear() != year) {
            index = new Date(minDate);
            maxIndex = new Date(year, 11, 31);
        }
        // same as the max year but not min year
        // (i.e. if range is may 2019 - may 2020 but we're grabbing year 2020)
        else if (minDate.getFullYear() != year && maxDate.getFullYear() === year) {
            index = new Date(year, 0, 1);
            maxIndex = new Date(maxDate);
        }

        for (index; index.getTime() <= maxIndex.getTime(); index.setDate(index.getDate() + 1)) {
            let date = (index.getMonth() + 1).toString() + "-" + index.getDate().toString();
            dateNumbers.push(date);
        }

        return dateNumbers;
    }

    private getDataForYear(loData: any, dateNumbers: string[], year: number, dataFrequency: string) {
        let dataForYear = {};
        let dataKey;
        for (const key in loData) {
            if (dateNumbers.includes(key)) {
                if (dataFrequency === DateFrequency.MONTH) {
                    dataKey = this.formatDate(new Date(year, parseInt(key) - 1, 1));
                } else {
                    const keyDate = key.split("-");
                    dataKey = this.formatDate(new Date(year, parseInt(keyDate[0]) - 1, parseInt(keyDate[1])));
                }
                dataForYear[dataKey] = loData[key];
            }
        }

        dataForYear = this.sortData(dataForYear);

        return dataForYear;
    }

    private formatDate(date): string {
        var d = date,
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        return [year, month, day].join("-");
    }

    private sortData(yearData) {
        let keys = Object.keys(yearData);

        // Sort the keys in descending order
        keys.sort(function (a, b) {
            if (a < b) {
                return -1;
            } else {
                return 1;
            }
        });

        let returnData = {};
        for (let i = 0; i < keys.length; i++) {
            returnData[keys[i]] = yearData[keys[i]];
        }
        return returnData;
    }

    private mapDataForReturn(analyticsData, yearData) {
        for (const key in yearData) {
            analyticsData[key] = yearData[key];
        }
        return analyticsData;
    }
}
