export interface IAppSettings {
    Datalake_Account_Name?: string;
    DataLake_AccountKey?: string;
    Datalake_Mktg_Integrations_Folder_Path?: string;
    Datalake_Flowapi_Folder?: string;
    Datalake_MailChimp_Folder?: string;
    Datalake_TotalExpert_Folder?: string;
    Datalake_Workfront_Folder?: string;

    MailChimp_List_Id?: string;
    MailChimp_Operation_Id?: string;
    MailChimp_Api_Base_Url?: string;
    MailChimp_Email_Error_To?: string;
    MailChimp_Email_Error_Subject?: string;
    MailChimp_Email_Report_To?: string;
    MailChimp_Email_Report_From?: string;
    MailChimp_Email_Report_Subject?: string;

    SendGrid_ApiKey?: string;

    Inactive_Users_Days_Ago?: string;
    Workfront_Email_Error_To?: string;
    Workfront_Email_Error_Subject?: string;
    Workfront_Email_Report_To?: string;
    Workfront_Email_Report_From?: string;
    Workfront_Email_Report_Subject?: string;

    TotalExpert_Email_Error_To?: string;
    TotalExpert_Email_Error_Subject?: string;
    TotalExpert_Email_Report_To?: string;
    TotalExpert_Email_Report_From?: string;
    TotalExpert_Email_Report_Subject?: string;

    WebData_Url?: string;
}
