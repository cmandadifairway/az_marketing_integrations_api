export interface LeadActivity {
    title: string;
    activityDateTime: string;
    message?: string;
    customQuestions?: { [key: string]: string };
}
