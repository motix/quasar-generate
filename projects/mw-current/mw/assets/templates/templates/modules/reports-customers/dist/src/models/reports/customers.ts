import type { CustomerLite, Invoice, Project, Transaction } from 'models/finance/index.js';
import type { RangeReport, YearlyReport } from 'models/reports/index.js';

export interface CustomerReport {
  beginningBalance: number;
  details: CustomerReportDetail[];
  endingBalance: number;
}

export interface CustomerReportDetail {
  document: Invoice | Transaction;
  project?: Project;
  invoice: Invoice;
  transaction?: Transaction;
  invoiceAmount?: number;
  receiptAmount?: number;
  invoiceBalance: number;
  balance: number;
  balanceIncreased: boolean;
  balanceDecreased: boolean;
}

export type CustomersReport = CustomersReportDetail[];

export interface CustomersReportDetail {
  customer: CustomerLite;
  beginningBalance: number;
  invoiceAmount: number;
  receiptAmount: number;
  endingBalance: number;
}

export type CustomersYearlyReport = YearlyReport<CustomersReport>;

export type CustomersRangeReport = RangeReport<CustomersReport>;

export interface CustomerYearlyReport extends YearlyReport<CustomerReport> {
  customerId: string;
}

export interface CustomerRangeReport extends RangeReport<CustomerReport> {
  customerId: string;
}
