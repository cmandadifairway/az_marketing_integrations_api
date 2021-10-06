export interface ExportLeadsService {
    exportLeads: (loEmail: string) => Promise<void>;
}
