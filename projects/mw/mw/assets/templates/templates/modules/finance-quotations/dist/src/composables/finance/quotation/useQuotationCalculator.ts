import { some, sumBy } from 'lodash-es';

import { checkAndCalculate, pointTenRound } from 'utils/calculation.js';

import type { Project, Quotation } from 'models/finance/index.js';

export default function useQuotationCalculator<TQuotation extends Quotation>() {
  type TQuotationDetail = TQuotation['details'][number];
  type TProject = TQuotation extends Quotation ? Project : never;

  // Quotation

  function quotationTotalQuantity(quotation: TQuotation) {
    return sumBy<TQuotationDetail>(
      (quotation.details as TQuotationDetail[]).filter((value) => !value.isProductionOnly),
      (detail) => checkAndCalculate(() => detail.quantity, detail.quantity) || 0,
    );
  }

  function quotationTotalProductionSalary(quotation: TQuotation) {
    return sumBy<TQuotationDetail>(
      quotation.details,
      (detail) => quotationDetailProductionSalaryAmount(detail) || 0,
    );
  }

  function quotationSubtotal(quotation: TQuotation) {
    return sumBy<TQuotationDetail>(
      quotation.details,
      (detail) => quotationDetailAmount(detail) || 0,
    );
  }

  function quotationVatExcludedTotal(quotation: TQuotation) {
    return (
      quotationSubtotal(quotation) -
      (checkAndCalculate(() => quotation.discount as number, quotation.discount) || 0)
    );
  }

  function quotationVat(quotation: TQuotation) {
    return checkAndCalculate(
      () =>
        Math.round(
          (quotation.vatPercent as number) *
            (quotation.vatableAmount || quotationVatExcludedTotal(quotation)),
        ),
      quotation.vatPercent,
    );
  }

  function quotationTotal(quotation: TQuotation) {
    return quotationVatExcludedTotal(quotation) + (quotationVat(quotation) || 0);
  }

  function quotationPriceRatio(quotation: TQuotation) {
    const productionSalary = quotationTotalProductionSalary(quotation);
    return productionSalary === 0
      ? undefined
      : pointTenRound(quotationVatExcludedTotal(quotation) / productionSalary);
  }

  function quotationHasQuotationOnly(quotation: TQuotation) {
    return some<TQuotationDetail>(quotation.details, (quotation) => quotation.isQuotationOnly);
  }

  // QuotationDetail

  function quotationDetailProductionSalaryAmount(quotationDetail: TQuotationDetail) {
    return checkAndCalculate(
      () => (quotationDetail.productionSalaryUnitPrice as number) * quotationDetail.quantity,
      quotationDetail.productionSalaryUnitPrice,
      quotationDetail.quantity,
    );
  }

  function quotationDetailAmount(quotationDetail: TQuotationDetail) {
    return quotationDetail.isProductionOnly
      ? undefined
      : checkAndCalculate(
          () => (quotationDetail.unitPrice as number) * quotationDetail.quantity,
          quotationDetail.unitPrice,
          quotationDetail.quantity,
        );
  }

  function quotationDetailMatchedItem(quotationDetail: TQuotationDetail, project: TProject) {
    return project.items.find((value) => value.title === quotationDetail.content);
  }

  function quotationDetailSafeItem(quotationDetail: TQuotationDetail, project: TProject) {
    return (
      quotationDetailMatchedItem(quotationDetail, project) ||
      (() => {
        throw new Error(`Item '${quotationDetail.content}' not found`);
      })()
    );
  }

  function quotationDetailHasItem(quotationDetail: TQuotationDetail, project: TProject) {
    return !!quotationDetailMatchedItem(quotationDetail, project);
  }

  function quotationDetailIsProductionOnlyChanged(
    quotationDetail: TQuotationDetail,
    project: TProject,
  ) {
    const item = quotationDetailMatchedItem(quotationDetail, project);

    if (!item) {
      return false;
    }

    return item.isProductionOnly !== quotationDetail.isProductionOnly;
  }

  function quotationDetailIsQuotationOnlyChanged(
    quotationDetail: TQuotationDetail,
    project: TProject,
  ) {
    const item = quotationDetailMatchedItem(quotationDetail, project);

    if (!item) {
      return false;
    }

    return item.isQuotationOnly !== quotationDetail.isQuotationOnly;
  }

  function quotationDetailProductionSalaryUnitPriceChanged(
    quotationDetail: TQuotationDetail,
    project: TProject,
  ) {
    const item = quotationDetailMatchedItem(quotationDetail, project);

    if (!item) {
      return false;
    }

    return item.productionSalaryUnitPrice !== quotationDetail.productionSalaryUnitPrice;
  }

  function quotationDetailQuantityChanged(quotationDetail: TQuotationDetail, project: TProject) {
    const item = quotationDetailMatchedItem(quotationDetail, project);

    if (!item) {
      return false;
    }

    return item.quantity !== quotationDetail.quantity;
  }

  function quotationDetailUnitPriceChanged(quotationDetail: TQuotationDetail, project: TProject) {
    const item = quotationDetailMatchedItem(quotationDetail, project);

    if (!item) {
      return false;
    }

    return item.unitPrice !== quotationDetail.unitPrice;
  }

  function quotationDetailAmountChanged(quotationDetail: TQuotationDetail, project: TProject) {
    return (
      quotationDetailQuantityChanged(quotationDetail, project) ||
      quotationDetailUnitPriceChanged(quotationDetail, project)
    );
  }

  function quotationDetailChangeStatus(quotationDetail: TQuotationDetail, project: TProject) {
    const item = quotationDetailMatchedItem(quotationDetail, project);

    if (!item) {
      return {
        color: 'negative',
        text: 'Deleted',
      };
    }

    const modified = {
      color: 'warning',
      text: 'Modified',
    };

    if (
      item.isQuotationOnly !== quotationDetail.isQuotationOnly ||
      item.quantity !== quotationDetail.quantity ||
      item.unitPrice !== quotationDetail.unitPrice
    ) {
      return modified;
    }

    if (item.productionSalaryUnitPrice !== quotationDetail.productionSalaryUnitPrice) {
      return modified;
    }

    return {
      color: 'primary',
      text: 'Identical',
    };
  }

  return {
    quotationTotalProductionSalary,
    quotationTotalQuantity,
    quotationSubtotal,
    quotationVatExcludedTotal,
    quotationVat,
    quotationTotal,
    quotationPriceRatio,
    quotationHasQuotationOnly,
    quotationDetailProductionSalaryAmount,
    quotationDetailAmount,
    quotationDetailMatchedItem,
    quotationDetailSafeItem,
    quotationDetailHasItem,
    quotationDetailIsProductionOnlyChanged,
    quotationDetailIsQuotationOnlyChanged,
    quotationDetailProductionSalaryUnitPriceChanged,
    quotationDetailQuantityChanged,
    quotationDetailUnitPriceChanged,
    quotationDetailAmountChanged,
    quotationDetailChangeStatus,
  };
}
