import {GetConfigurationSettingResponse} from "@azure/app-configuration"

export class AppConfigurationSettingResponseMockImpl implements GetConfigurationSettingResponse{
    _response;
    isReadOnly: boolean;
    lastModified?: Date;
    contentType?: string;
    value?: string;
    tags?: { [propertyName: string]: string; };
    key: string;
    label?: string;
    etag?: string;
    syncToken?: string;
    statusCode: number;
  
}