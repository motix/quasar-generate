import { sumBy } from 'lodash-es';

import { checkAndCalculate } from 'utils/calculation.js';

import type { Invoice, Project, SalesContract, SalesContractVm } from 'models/finance/index.js';

import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';

export default function useSalesContractCalculator<
  TSalesContract extends SalesContract | SalesContractVm,
>() {
  type TVatInvoice = TSalesContract['vatInvoices'][number];

  const ic = useInvoiceCalculator<Invoice>();

  // SalesContract

  function salesContractVat(salesContract: TSalesContract) {
    const vatAdjustment =
      checkAndCalculate(() => salesContract.vatAdjustment as number, salesContract.vatAdjustment) ||
      0;

    if (
      salesContract.secondVatPercent == null ||
      salesContract.secondVatPercent === '' ||
      salesContract.secondVatableAmount == null ||
      salesContract.secondVatableAmount === ''
    ) {
      return checkAndCalculate(
        () =>
          Math.round(
            (salesContract.vatPercent as number) *
              ((salesContract.subTotal as number) +
                (checkAndCalculate(() => salesContract.arising as number, salesContract.arising) ||
                  0)),
          ) + vatAdjustment,
        salesContract.vatPercent,
        salesContract.subTotal,
      );
    } else {
      return checkAndCalculate(
        () =>
          Math.round(
            (salesContract.vatPercent as number) *
              ((salesContract.subTotal as number) +
                (checkAndCalculate(() => salesContract.arising as number, salesContract.arising) ||
                  0) -
                (salesContract.secondVatableAmount as number)),
          ) +
          Math.round(
            (salesContract.secondVatPercent as number) *
              (salesContract.secondVatableAmount as number),
          ) +
          vatAdjustment,
        salesContract.vatPercent,
        salesContract.subTotal,
        salesContract.secondVatPercent,
        salesContract.secondVatableAmount,
      );
    }
  }

  function salesContractTotal(salesContract: TSalesContract) {
    return (
      (checkAndCalculate(() => salesContract.subTotal as number, salesContract.subTotal) || 0) +
      (checkAndCalculate(() => salesContract.arising as number, salesContract.arising) || 0) +
      (salesContractVat(salesContract) || 0)
    );
  }

  function salesContractInvoicesSubtotal(salesContract: TSalesContract) {
    return sumBy(
      collectInvoices(salesContract),
      (record) => (invoiceSubtotal(record.invoice) || 0) - (record.invoice?.relocatedSubtotal || 0),
    );
  }

  function salesContractInvoicesVat(salesContract: TSalesContract) {
    return sumBy(
      collectInvoices(salesContract),
      (record) => (invoiceVat(record.invoice) || 0) - (record.invoice?.relocatedVat || 0),
    );
  }

  function salesContractInvoicesTotal(salesContract: TSalesContract) {
    return sumBy(collectInvoices(salesContract), (record) => invoiceTotal(record.invoice) || 0);
  }

  function salesContractSubtotalDifference(
    salesContract: TSalesContract,
    sameInvoiceSalesContracts: SalesContract[],
  ) {
    return (
      sameInvoiceSalesContractsSubtotal(salesContract, sameInvoiceSalesContracts) +
      sameInvoiceSalesContractsArising(salesContract, sameInvoiceSalesContracts) -
      salesContractInvoicesSubtotal(salesContract)
    );
  }

  function salesContractVatDifference(
    salesContract: TSalesContract,
    sameInvoiceSalesContracts: SalesContract[],
  ) {
    return (
      sameInvoiceSalesContractsVat(salesContract, sameInvoiceSalesContracts) -
      salesContractInvoicesVat(salesContract)
    );
  }

  function salesContractDifference(
    salesContract: TSalesContract,
    sameInvoiceSalesContracts: SalesContract[],
  ) {
    return (
      sameInvoiceSalesContractsTotal(salesContract, sameInvoiceSalesContracts) -
      salesContractInvoicesTotal(salesContract)
    );
  }

  function salesContractVatInvoicesSubtotal(salesContract: TSalesContract) {
    return sumBy<TVatInvoice>(
      salesContract.vatInvoices,
      (vatInvoice) =>
        checkAndCalculate(
          () => (vatInvoice.isCancelled ? 0 : (vatInvoice.subTotal as number)),
          vatInvoice.subTotal,
        ) || 0,
    );
  }

  function salesContractVatInvoicesVat(salesContract: TSalesContract) {
    return sumBy<TVatInvoice>(salesContract.vatInvoices, (vatInvoice) =>
      vatInvoice.isCancelled ? 0 : vatInvoiceVat(vatInvoice) || 0,
    );
  }

  function salesContractVatInvoicesTotal(salesContract: TSalesContract) {
    return sumBy<TVatInvoice>(salesContract.vatInvoices, (vatInvoice) =>
      vatInvoice.isCancelled ? 0 : vatInvoiceTotal(vatInvoice),
    );
  }

  function salesContractSubtotalBalance(salesContract: TSalesContract) {
    return checkAndCalculate(
      () =>
        (salesContract.subTotal as number) +
        (checkAndCalculate(() => salesContract.arising as number, salesContract.arising) || 0) -
        salesContractVatInvoicesSubtotal(salesContract),
      salesContract.subTotal,
    );
  }

  function salesContractVatBalance(salesContract: TSalesContract) {
    return (
      (checkAndCalculate(
        () => salesContractVat(salesContract) as number,
        salesContractVat(salesContract),
      ) || 0) - salesContractVatInvoicesVat(salesContract)
    );
  }

  function salesContractBalance(salesContract: TSalesContract) {
    return salesContractTotal(salesContract) - salesContractVatInvoicesTotal(salesContract);
  }

  function sameInvoiceSalesContractsSubtotal(
    salesContract: TSalesContract,
    sameInvoiceSalesContracts: SalesContract[],
  ) {
    return (
      (checkAndCalculate(() => salesContract.subTotal as number, salesContract.subTotal) || 0) +
      sumBy(sameInvoiceSalesContracts, (contract) => contract.subTotal)
    );
  }

  function sameInvoiceSalesContractsArising(
    salesContract: TSalesContract,
    sameInvoiceSalesContracts: SalesContract[],
  ) {
    return (
      (checkAndCalculate(() => salesContract.arising as number, salesContract.arising) || 0) +
      sumBy(sameInvoiceSalesContracts, (contract) => contract.arising || 0)
    );
  }

  function sameInvoiceSalesContractsVat(
    salesContract: TSalesContract,
    sameInvoiceSalesContracts: SalesContract[],
  ) {
    const mc = useSalesContractCalculator<SalesContract>();

    return (
      (salesContractVat(salesContract) || 0) +
      sumBy(sameInvoiceSalesContracts, (contract) => mc.salesContractVat(contract) || 0)
    );
  }

  function sameInvoiceSalesContractsTotal(
    salesContract: TSalesContract,
    sameInvoiceSalesContracts: SalesContract[],
  ) {
    const mc = useSalesContractCalculator<SalesContract>();

    return (
      salesContractTotal(salesContract) +
      sumBy(sameInvoiceSalesContracts, (contract) => mc.salesContractTotal(contract))
    );
  }

  // Invoice

  function findProjectInvoice(project: Project) {
    return project.quotations.find(
      (quotation) => !!quotation.invoice && !quotation.invoice.isCancelled,
    )?.invoice;
  }

  function collectInvoices(salesContract: TSalesContract) {
    return [
      ...(salesContract.projects.map((project) => ({
        project: project as Project | undefined,
        invoice: findProjectInvoice(project),
      })) || []),
      ...salesContract.generalInvoices.map((invoice) => ({
        project: undefined,
        invoice,
      })),
    ];
  }

  function invoiceSubtotal(invoice: Invoice | undefined) {
    return invoice ? ic.invoiceContractAfterDiscountSubtotal(invoice) : undefined;
  }

  function invoiceVat(invoice: Invoice | undefined) {
    return invoice ? ic.invoiceVat(invoice) : undefined;
  }

  function invoiceTotal(invoice: Invoice | undefined) {
    return invoice ? ic.invoiceContractTotal(invoice) : undefined;
  }

  // VatInvoice

  function vatInvoiceVat(vatInvoice: TVatInvoice) {
    const vatAdjustment =
      checkAndCalculate(() => vatInvoice.vatAdjustment as number, vatInvoice.vatAdjustment) || 0;

    return checkAndCalculate(
      () =>
        Math.round((vatInvoice.vatPercent as number) * (vatInvoice.subTotal as number)) +
        vatAdjustment,
      vatInvoice.vatPercent,
      vatInvoice.subTotal,
    );
  }

  function vatInvoiceTotal(vatInvoice: TVatInvoice) {
    return (
      (checkAndCalculate(() => vatInvoice.subTotal as number, vatInvoice.subTotal) || 0) +
      (vatInvoiceVat(vatInvoice) || 0)
    );
  }

  return {
    salesContractVat,
    salesContractTotal,
    salesContractInvoicesSubtotal,
    salesContractInvoicesVat,
    salesContractInvoicesTotal,
    salesContractSubtotalDifference,
    salesContractVatDifference,
    salesContractDifference,
    salesContractVatInvoicesSubtotal,
    salesContractVatInvoicesVat,
    salesContractVatInvoicesTotal,
    salesContractSubtotalBalance,
    salesContractVatBalance,
    salesContractBalance,
    sameInvoiceSalesContractsSubtotal,
    sameInvoiceSalesContractsArising,
    sameInvoiceSalesContractsVat,
    sameInvoiceSalesContractsTotal,
    findProjectInvoice,
    collectInvoices,
    invoiceSubtotal,
    invoiceVat,
    invoiceTotal,
    vatInvoiceVat,
    vatInvoiceTotal,
  };
}
