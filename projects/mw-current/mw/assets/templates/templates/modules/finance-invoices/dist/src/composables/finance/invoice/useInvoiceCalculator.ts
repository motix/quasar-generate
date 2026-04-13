import { sumBy } from 'lodash-es';

import { checkAndCalculate } from 'utils/calculation.js';

import type { Invoice, InvoiceVm } from 'models/finance/index.js';

import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';

export default function useInvoiceCalculator<TInvoice extends Invoice | InvoiceVm>() {
  type TInvoiceDetail = TInvoice['details'][number];
  type TTransaction = TInvoice['transactions'][number];

  const tc = useTransactionCalculator<TTransaction>();

  // Invoice

  function invoiceTotalQuantity(invoice: TInvoice) {
    return sumBy<TInvoiceDetail>(
      invoice.details,
      (detail) => checkAndCalculate(() => detail.quantity as number, detail.quantity) || 0,
    );
  }

  function invoiceSubtotal(invoice: TInvoice) {
    return sumBy<TInvoiceDetail>(invoice.details, (detail) => invoiceDetailAmount(detail) || 0);
  }

  function invoiceAfterDiscountSubtotal(invoice: TInvoice) {
    return (
      invoiceSubtotal(invoice) -
      (checkAndCalculate(() => invoice.discount as number, invoice.discount) || 0)
    );
  }

  function invoiceContractAfterDiscountSubtotal(invoice: TInvoice) {
    return invoice.contractSubtotal == null || invoice.contractSubtotal === ''
      ? invoiceAfterDiscountSubtotal(invoice)
      : checkAndCalculate(() => invoice.contractSubtotal as number, invoice.contractSubtotal) || 0;
  }

  function invoiceVatExcludedTotal(invoice: TInvoice) {
    return (
      invoiceAfterDiscountSubtotal(invoice) -
      (checkAndCalculate(() => invoice.relocatedSubtotal as number, invoice.relocatedSubtotal) || 0)
    );
  }

  function invoiceContractVatExcludedTotal(invoice: TInvoice) {
    return (
      invoiceContractAfterDiscountSubtotal(invoice) -
      (checkAndCalculate(() => invoice.relocatedSubtotal as number, invoice.relocatedSubtotal) || 0)
    );
  }

  function invoiceVat(invoice: TInvoice) {
    const vatAdjustment =
      checkAndCalculate(() => invoice.vatAdjustment as number, invoice.vatAdjustment) || 0;

    if (invoice.vatableAmount == null || invoice.vatableAmount === '') {
      if (
        invoice.secondVatPercent == null ||
        invoice.secondVatPercent === '' ||
        invoice.secondVatableAmount == null ||
        invoice.secondVatableAmount === ''
      ) {
        return checkAndCalculate(
          () =>
            Math.round((invoice.vatPercent as number) * invoiceAfterDiscountSubtotal(invoice)) +
            vatAdjustment,
          invoice.vatPercent,
        );
      } else {
        return checkAndCalculate(
          () =>
            Math.round(
              (invoice.vatPercent as number) *
                (invoiceAfterDiscountSubtotal(invoice) - (invoice.secondVatableAmount as number)),
            ) +
            Math.round(
              (invoice.secondVatPercent as number) * (invoice.secondVatableAmount as number),
            ) +
            vatAdjustment,
          invoice.vatPercent,
          invoice.secondVatPercent,
          invoice.secondVatableAmount,
        );
      }
    } else {
      if (
        invoice.secondVatPercent == null ||
        invoice.secondVatPercent === '' ||
        invoice.secondVatableAmount == null ||
        invoice.secondVatableAmount === ''
      ) {
        return checkAndCalculate(
          () =>
            Math.round((invoice.vatPercent as number) * (invoice.vatableAmount as number)) +
            vatAdjustment,
          invoice.vatPercent,
          invoice.vatableAmount,
        );
      } else {
        return checkAndCalculate(
          () =>
            Math.round(
              (invoice.vatPercent as number) *
                ((invoice.vatableAmount as number) - (invoice.secondVatableAmount as number)),
            ) +
            Math.round(
              (invoice.secondVatPercent as number) * (invoice.secondVatableAmount as number),
            ) +
            vatAdjustment,
          invoice.vatPercent,
          invoice.vatableAmount,
          invoice.secondVatPercent,
          invoice.secondVatableAmount,
        );
      }
    }
  }

  function invoiceTotal(invoice: TInvoice) {
    return (
      invoiceVatExcludedTotal(invoice) +
      (invoiceVat(invoice) || 0) -
      (checkAndCalculate(() => invoice.relocatedVat as number, invoice.relocatedVat) || 0)
    );
  }

  function invoiceContractTotal(invoice: TInvoice) {
    return (
      invoiceContractVatExcludedTotal(invoice) +
      (invoiceVat(invoice) || 0) -
      (checkAndCalculate(() => invoice.relocatedVat as number, invoice.relocatedVat) || 0)
    );
  }

  function invoiceTotalReceipt(invoice: TInvoice) {
    return sumBy<TTransaction>(invoice.transactions, (transaction) =>
      !transaction.isCleared || transaction.isCancelled
        ? 0
        : tc.transactionTotal(transaction) * (tc.transactionNegative(transaction) ? -1 : 1),
    );
  }

  function invoiceBalance(invoice: TInvoice) {
    return invoiceTotal(invoice) - invoiceTotalReceipt(invoice);
  }

  // InvoiceDetail

  function invoiceDetailAmount(invoiceDetail: TInvoiceDetail) {
    return checkAndCalculate(
      () => (invoiceDetail.unitPrice as number) * (invoiceDetail.quantity as number),
      invoiceDetail.unitPrice,
      invoiceDetail.quantity,
    );
  }

  return {
    invoiceTotalQuantity,
    invoiceSubtotal,
    invoiceAfterDiscountSubtotal,
    invoiceContractAfterDiscountSubtotal,
    invoiceVatExcludedTotal,
    invoiceContractVatExcludedTotal,
    invoiceVat,
    invoiceTotal,
    invoiceContractTotal,
    invoiceTotalReceipt,
    invoiceBalance,
    invoiceDetailAmount,
  };
}
