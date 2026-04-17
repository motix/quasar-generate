import type { CustomerLite, Invoice, Project } from 'models/finance/index.js';

export type ReceivableReport = ReceivableReportDetail[];

export interface ReceivableReportDetail {
  customer: CustomerLite;
  projects: Project[];
  generalInvoices: Invoice[];
  balance: number;
}
