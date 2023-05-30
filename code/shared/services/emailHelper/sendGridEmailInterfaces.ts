export interface IEmailService {
    sendEmail: (emailMessage: IEmailMessage, emailType: number) => Promise<void>;
}

export interface IEmailMessage {
    to: string | Array<string>;
    from?: string;
    subject?: string;
    text?: string;
    html?: string;
    attachments?: IEmailAttachment[];
}

export interface IEmailAttachment {
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
    contentId?: string;
}

export enum EmailType {
    Error = "Error",
    Report = "Report",
}

