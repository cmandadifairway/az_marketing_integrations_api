import { AxiosResponse, AxiosRequestConfig } from "axios";

export class AxiosResponseMock implements AxiosResponse{
    data: any;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
    request?: any;
    
}