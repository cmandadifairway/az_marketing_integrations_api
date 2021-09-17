export interface AnalyticsData {
    created?: Value;
    qualified?: Value;
    engaged?: Value;
    liveTransferAttempt?: Value;
}

export interface Value {
    t: number;
    src?: Src;
}

export interface Src {
    [key: string]: number;
}
