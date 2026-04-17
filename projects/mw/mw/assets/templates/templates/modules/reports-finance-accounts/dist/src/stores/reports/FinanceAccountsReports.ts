import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { documentId, where } from 'firebase/firestore';

import { range, sortBy } from 'lodash-es';

import assignOptional from 'utils/assignOptional.js';
import { isFinanceAccountReportDetail } from 'utils/reports/finance-accounts.js';

import type { Transaction } from 'models/finance/index.js';
import type {
  FinanceAccountRangeReport,
  FinanceAccountReport,
  FinanceAccountReportDetail,
  FinanceAccountsReportsCacheRecord,
  FinanceAccountYearlyReport,
} from 'models/reports/index.js';

import { useInstantFinanceAccountsStore } from 'stores/finance/FinanceAccounts.js';
import type { ReleaseDocsActionPayload } from 'stores/firebase-firestore/index.js';

import loadFinanceAccountsReportsCache from 'services/reports/loadFinanceAccountsReportsCache.js';
import loadFinanceDetailsByTransaction from 'services/reports/loadFinanceDetailsByTransaction.js';
import updateFinanceAccountsReportsCache from 'services/reports/updateFinanceAccountsReportsCache.js';

import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

export const useFinanceAccountsReportsStore = defineStore('FinanceAccountsReports', () => {
  // Private

  const { releaseDocsTimeout } = requiredConfigEntries('releaseDocsTimeout');

  let releaseFinanceAccountsReportsTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const cache = ref(null) as Ref<Record<string, FinanceAccountsReportsCacheRecord> | null>;

  const tc = useTransactionCalculator<Transaction>();

  const loadedCache = computed(
    () =>
      cache.value ||
      (() => {
        throw new Error('cache not ready');
      })(),
  );

  async function loadCache() {
    if (cache.value !== null) {
      return;
    }

    cache.value = Object.fromEntries(
      (await loadFinanceAccountsReportsCache()).map((value) => [
        `${value.financeAccountId}_${value.year}`,
        value,
      ]),
    );
  }

  async function updateCahce(cacheRecord: FinanceAccountsReportsCacheRecord) {
    await updateFinanceAccountsReportsCache(cacheRecord);

    cache.value = null;
    await loadCache();
  }

  async function loadReportContent(financeAccountId: string, startDate: Date, endDate: Date) {
    await loadCache();

    const yearOfStartDate = startDate.getFullYear();
    const yearOfEndDate = endDate.getFullYear();

    const years = useSelectDateRange().yearOptions.value;

    if (
      yearOfStartDate > years[years.length - 1]! &&
      !loadedCache.value[`${financeAccountId}_${yearOfStartDate - 1}`]
    ) {
      await loadYearlyReport(financeAccountId, yearOfStartDate - 1);
    }

    let details: FinanceAccountReportDetail[];

    let beginningBalance: number;

    if (
      startDate.valueOf() === new Date(yearOfEndDate, 0, 1).valueOf() &&
      endDate.valueOf() === new Date(yearOfEndDate, 11, 31).valueOf()
    ) {
      details = await loadFinanceAccountDetails(financeAccountId, startDate, endDate);

      beginningBalance =
        yearOfStartDate === years[years.length - 1]
          ? 0
          : loadedCache.value[`${financeAccountId}_${yearOfStartDate - 1}`]!.endingBalance;

      for (let i = 0; i < details.length; i++) {
        if (i === 0) {
          processDetail(details[i]!, beginningBalance);
        } else {
          processDetail(details[i]!, details[i - 1]!.balance);
        }
      }
    } else {
      for (let year = yearOfStartDate; year <= yearOfEndDate; year++) {
        await loadYearlyReport(financeAccountId, year);
      }

      details = range(yearOfStartDate, yearOfEndDate + 1).flatMap((year) =>
        yearlyReport(financeAccountId, year).content.details.filter(
          (detail) =>
            detail.transaction.issueDate >= startDate && detail.transaction.issueDate <= endDate,
        ),
      );

      const sameYearOfStartDateEarlierDetails = yearlyReport(
        financeAccountId,
        yearOfStartDate,
      ).content.details.filter((detail) => detail.transaction.issueDate < startDate);

      if (sameYearOfStartDateEarlierDetails.length === 0) {
        beginningBalance = yearlyReport(financeAccountId, yearOfStartDate).content.beginningBalance;
      } else {
        beginningBalance =
          sameYearOfStartDateEarlierDetails[sameYearOfStartDateEarlierDetails.length - 1]!.balance;
      }
    }

    const lastDetail =
      details.length === 0
        ? {
            balance: beginningBalance,
          }
        : details[details.length - 1]!;

    const endingBalance = lastDetail.balance;

    const financeAccountsStore = useInstantFinanceAccountsStore();

    await financeAccountsStore.loadAllDocs({
      queryConstraints: [where(documentId(), '==', financeAccountId)],
    });

    const balanceRecords =
      financeAccountsStore.docs.length === 1
        ? financeAccountsStore.docs[0]!.balanceRecords.filter(
            (value) => value.date >= startDate && value.date <= endDate,
          )
        : [];

    financeAccountsStore.releaseDocs({ immediately: true });

    const detailsWithBalanceRecords = sortBy([...details, ...balanceRecords], (value) =>
      isFinanceAccountReportDetail(value) ? value.transaction.issueDate : value.date,
    );

    const content: FinanceAccountReport = {
      beginningBalance,
      details,
      detailsWithBalanceRecords,
      endingBalance,
    };

    return content;

    function processDetail(detail: FinanceAccountReportDetail, previousBalance: number) {
      assignOptional<FinanceAccountReportDetail>(detail, {
        customer: detail.invoice?.customer,
        supplier: detail.expense?.supplier,
        otherFinanceAccount:
          detail.transaction.sourceFinanceAccount?.id === financeAccountId
            ? detail.transaction.destinationFinanceAccount
            : detail.transaction.sourceFinanceAccount,

        credit:
          detail.transaction.type === 'Receipt' ||
          detail.transaction.type === 'Payment Refund' ||
          (detail.transaction.type === 'Transfer' &&
            detail.transaction.destinationFinanceAccount?.id === financeAccountId)
            ? tc.transactionTotal(detail.transaction)
            : undefined,
        debit:
          detail.transaction.type === 'Payment' ||
          detail.transaction.type === 'Receipt Refund' ||
          (detail.transaction.type === 'Transfer' &&
            detail.transaction.sourceFinanceAccount?.id === financeAccountId)
            ? tc.transactionTotal(detail.transaction)
            : undefined,
      });

      detail.balance = previousBalance + (detail.credit || 0) - (detail.debit || 0);

      detail.balanceIncreased = detail.balance > previousBalance;
      detail.balanceDecreased = detail.balance < previousBalance;
    }
  }

  async function loadFinanceAccountDetails(
    financeAccountId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const detailsByTransaction = await loadFinanceDetailsByTransaction(
      startDate,
      endDate,
      where('financeAccountIds', 'array-contains', financeAccountId),
    );

    const defaultValues: Pick<
      FinanceAccountReportDetail,
      'balance' | 'balanceIncreased' | 'balanceDecreased'
    > = {
      balance: 0,
      balanceIncreased: false,
      balanceDecreased: false,
    };

    let details: FinanceAccountReportDetail[] = [
      // Project invoice transactions
      ...detailsByTransaction.projects.flatMap((project) =>
        project.quotations.flatMap((quotation) => {
          const invoice = quotation.invoice;

          return invoice
            ? [
                ...invoice.transactions
                  .filter(
                    (transaction) =>
                      (transaction.sourceFinanceAccount?.id === financeAccountId ||
                        transaction.destinationFinanceAccount?.id === financeAccountId) &&
                      transaction.issueDate >= startDate &&
                      transaction.issueDate <= endDate &&
                      transaction.isCleared &&
                      !transaction.isCancelled,
                  )
                  .map((transaction) => ({
                    transaction,
                    project,
                    invoice,
                    ...defaultValues,
                  })),
              ]
            : [];
        }),
      ),

      // Project expense transactions
      ...detailsByTransaction.projects.flatMap((project) =>
        project.expenses.flatMap((expense) =>
          expense.transactions
            .filter(
              (transaction) =>
                (transaction.sourceFinanceAccount?.id === financeAccountId ||
                  transaction.destinationFinanceAccount?.id === financeAccountId) &&
                transaction.issueDate >= startDate &&
                transaction.issueDate <= endDate &&
                transaction.isCleared &&
                !transaction.isCancelled,
            )
            .map((transaction) => ({
              transaction,
              project,
              expense,
              ...defaultValues,
            })),
        ),
      ),

      // General invoice transactions
      ...detailsByTransaction.generalInvoices.flatMap((invoice) =>
        invoice.transactions
          .filter(
            (transaction) =>
              (transaction.sourceFinanceAccount?.id === financeAccountId ||
                transaction.destinationFinanceAccount?.id === financeAccountId) &&
              transaction.issueDate >= startDate &&
              transaction.issueDate <= endDate &&
              transaction.isCleared &&
              !transaction.isCancelled,
          )
          .map((transaction) => ({
            transaction,
            invoice,
            ...defaultValues,
          })),
      ),

      // General expense transactions
      ...detailsByTransaction.generalExpenses.flatMap((expense) =>
        expense.transactions
          .filter(
            (transaction) =>
              (transaction.sourceFinanceAccount?.id === financeAccountId ||
                transaction.destinationFinanceAccount?.id === financeAccountId) &&
              transaction.issueDate >= startDate &&
              transaction.issueDate <= endDate &&
              transaction.isCleared &&
              !transaction.isCancelled,
          )
          .map((transaction) => ({
            transaction,
            expense,
            ...defaultValues,
          })),
      ),

      // General transactions
      ...detailsByTransaction.generalTransactions
        .filter((transaction) => transaction.isCleared && !transaction.isCancelled)
        .map((transaction) => ({
          transaction,
          ...defaultValues,
        })),
    ];

    details = sortBy(details, (value) => value.transaction.createDate);
    details = sortBy(details, (value) => value.transaction.issueDate);

    return details;
  }

  // State

  const yearlyReports = ref([]) as Ref<FinanceAccountYearlyReport[]>;

  // Getters

  function hasReports() {
    return yearlyReports.value.length > 0;
  }

  function yearlyReport(financeAccountId: string, year: number) {
    return (
      yearlyReports.value.find(
        (value) => value.financeAccountId === financeAccountId && value.year === year,
      ) ||
      (() => {
        throw new Error(
          `Finance Account Yearly Report ${financeAccountId} ${year.toString()} not available`,
        );
      })()
    );
  }

  async function rangeReport(financeAccountId: string, startDate: Date, endDate: Date) {
    let content: FinanceAccountReport;
    const yearOfEndDate = endDate.getFullYear();

    if (
      startDate.valueOf() === new Date(yearOfEndDate, 0, 1).valueOf() &&
      endDate.valueOf() === new Date(yearOfEndDate, 11, 31).valueOf()
    ) {
      await loadYearlyReport(financeAccountId, yearOfEndDate);
      content = yearlyReport(financeAccountId, yearOfEndDate).content;
    } else {
      content = await loadReportContent(financeAccountId, startDate, endDate);
    }

    const report: FinanceAccountRangeReport = {
      financeAccountId,
      startDate,
      endDate,
      content,
    };

    return report;
  }

  // Actions

  async function loadYearlyReport(financeAccountId: string, year: number) {
    if (releaseFinanceAccountsReportsTimeoutId) {
      clearTimeout(releaseFinanceAccountsReportsTimeoutId);
      releaseFinanceAccountsReportsTimeoutId = null;
    }

    if (
      yearlyReports.value.some(
        (value) => value.financeAccountId === financeAccountId && value.year === year,
      )
    ) {
      return;
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const content = await loadReportContent(financeAccountId, startDate, endDate);

    const report: FinanceAccountYearlyReport = {
      financeAccountId,
      year,
      content,
    };

    yearlyReports.value.push(report);

    const cacheRecord: FinanceAccountsReportsCacheRecord = {
      financeAccountId,
      year,
      beginningBalance: content.beginningBalance,
      endingBalance: content.endingBalance,
    };

    await updateCahce(cacheRecord);
  }

  function releaseFinanceAccountsReports({ immediately }: ReleaseDocsActionPayload) {
    if (immediately) {
      yearlyReports.value = [];
    } else {
      releaseFinanceAccountsReportsTimeoutId = setTimeout(() => {
        yearlyReports.value = [];
      }, releaseDocsTimeout);
    }
  }

  return {
    yearlyReports,
    hasReports,
    yearlyReport,
    rangeReport,
    loadYearlyReport,
    releaseFinanceAccountsReports,
  };
});
