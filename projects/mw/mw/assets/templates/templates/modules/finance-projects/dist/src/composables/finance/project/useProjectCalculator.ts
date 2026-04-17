import { sumBy } from 'lodash-es';

import { checkAndCalculate, pointTenRound } from 'utils/calculation.js';

import type { Project, ProjectVm } from 'models/finance/index.js';

export default function useProjectCalculator<TProject extends Project | ProjectVm>() {
  type TItem = TProject['items'][number];

  // Project

  function projectTotalQuantity(project: TProject) {
    return sumBy<TItem>(
      project.items,
      (item) => checkAndCalculate(() => item.quantity as number, item.quantity) || 0,
    );
  }

  function projectTotalProductionSalary(project: TProject) {
    return sumBy<TItem>(project.items, (item) => itemProductionSalaryAmount(item) || 0);
  }

  function projectSubtotal(project: TProject) {
    return sumBy<TItem>(project.items, (item) => itemAmount(item) || 0);
  }

  function projectVatExcludedTotal(project: TProject) {
    return (
      projectSubtotal(project) -
      (checkAndCalculate(() => project.discount as number, project.discount) || 0)
    );
  }

  function projectVat(project: TProject) {
    return project.vatableAmount == null || project.vatableAmount === ''
      ? checkAndCalculate(
          () => Math.round((project.vatPercent as number) * projectVatExcludedTotal(project)),
          project.vatPercent,
        )
      : checkAndCalculate(
          () => Math.round((project.vatPercent as number) * (project.vatableAmount as number)),
          project.vatPercent,
          project.vatableAmount,
        );
  }

  function projectTotal(project: TProject) {
    return projectVatExcludedTotal(project) + (projectVat(project) || 0);
  }

  function projectPriceRatio(project: TProject) {
    const productionSalary = projectTotalProductionSalary(project);
    return productionSalary === 0
      ? undefined
      : pointTenRound(projectVatExcludedTotal(project) / productionSalary);
  }

  // Item

  function itemProductionSalaryAmount(item: TItem) {
    return item.isFinanceOnly
      ? undefined
      : checkAndCalculate(
          () => (item.productionSalaryUnitPrice as number) * (item.quantity as number),
          item.productionSalaryUnitPrice,
          item.quantity,
        );
  }

  function itemAmount(item: TItem) {
    return item.isProductionOnly
      ? undefined
      : checkAndCalculate(
          () => (item.unitPrice as number) * (item.quantity as number),
          item.unitPrice,
          item.quantity,
        );
  }

  return {
    projectTotalQuantity,
    projectTotalProductionSalary,
    projectSubtotal,
    projectVatExcludedTotal,
    projectVat,
    projectTotal,
    projectPriceRatio,
    itemProductionSalaryAmount,
    itemAmount,
  };
}
