import { Response } from "../../shared/model/response";

export interface EmailService {
    sendEmail: (emailMessage: EmailMessage) => Promise<Response>;
}

export interface EmailMessage {
    to?: string;
    from: string;
    subject?: string;
    text?: string;
    html?: string;
    attachments?: EmailAttachment[];
}

export interface EmailAttachment {
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
    contentId?: string;
}
