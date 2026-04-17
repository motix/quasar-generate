import { sumBy } from 'lodash-es';

import { checkAndCalculate, oneThousandRound, percentRound } from 'utils/calculation.js';

import type { Project, ProjectAm, ProjectVm } from 'models/production/index.js';

export default function useProjectCalculator<TProject extends Project | ProjectVm | ProjectAm>() {
  type TItem = TProject['items'][number];
  type TQuantity = TItem['quantity'];
  type TItemContribution = TItem['contributions'][number];
  type TMember = Required<TItemContribution>['member'];

  // Project

  function projectTotalQuantity(project: TProject) {
    return sumBy<TItem>(
      project.items,
      (item) => checkAndCalculate(() => item.quantity as number, item.quantity) || 0,
    );
  }

  function projectTotalProductionSalary(project: TProject, member?: TMember) {
    return sumBy<TItem>(project.items, (item) => itemProductionSalaryAmount(item, member));
  }

  function projectTotalProductionSalaryIgnorePriceFactor(project: TProject) {
    return sumBy<TItem>(project.items, (item) => itemProductionSalaryAmountIgnorePriceFactor(item));
  }

  function projectProductionPriceFactor(project: TProject) {
    const standardSalary = projectTotalProductionSalaryIgnorePriceFactor(project);

    if (standardSalary === 0) return undefined;

    const salary = projectTotalProductionSalary(project);

    return checkAndCalculate(() => percentRound(salary / standardSalary), salary, standardSalary);
  }

  // Item

  function itemProductionSalaryUnitPrice(item: TItem) {
    return sumBy<TItemContribution>(
      item.contributions,
      (contribution) => itemContributionProductionSalaryUnitPrice(contribution) || 0,
    );
  }

  function itemProductionSalaryUnitPriceIgnorePriceFactor(item: TItem) {
    return sumBy<TItemContribution>(
      item.contributions,
      (contribution) =>
        itemContributionProductionSalaryUnitPriceIgnorePriceFactor(contribution) || 0,
    );
  }

  function itemProductionSalaryAmount(item: TItem, member?: TMember) {
    return sumBy<TItemContribution>(item.contributions, (contribution) =>
      !!member && contribution.member?.id !== member.id
        ? 0
        : itemContributionProductionSalaryAmount(contribution, item.quantity) || 0,
    );
  }

  function itemProductionSalaryAmountIgnorePriceFactor(item: TItem) {
    return sumBy<TItemContribution>(
      item.contributions,
      (contribution) =>
        itemContributionProductionSalaryAmountIgnorePriceFactor(contribution, item.quantity) || 0,
    );
  }

  function itemPriceFactor(item: TItem) {
    const standardSalary = itemProductionSalaryUnitPriceIgnorePriceFactor(item);

    if (standardSalary === 0) return 1;

    const salary = itemProductionSalaryUnitPrice(item);

    return percentRound(salary / standardSalary);
  }

  // ItemContribution

  function itemContributionProductionSalaryBase(itemContribution: TItemContribution) {
    return checkAndCalculate(
      () => itemContribution.productionSalaryBase as number,
      itemContribution.productionSalaryBase,
    );
  }

  function itemContributionProductionSalaryUnitPrice(itemContribution: TItemContribution) {
    const val = itemContributionProductionSalaryUnitPriceIgnorePriceFactor(itemContribution);

    return checkAndCalculate(
      () =>
        oneThousandRound(Math.round((val as number) * (itemContribution.priceFactor as number))),
      val,
      itemContribution.priceFactor,
    );
  }

  function itemContributionProductionSalaryUnitPriceIgnorePriceFactor(
    itemContribution: TItemContribution,
  ) {
    const val = itemContributionProductionSalaryBase(itemContribution);

    return checkAndCalculate(
      () =>
        oneThousandRound(Math.round((val as number) * (itemContribution.involvement as number))),
      val,
      itemContribution.involvement,
    );
  }

  function itemContributionProductionSalaryAmount(
    itemContribution: TItemContribution,
    quantity: TQuantity,
  ) {
    const val = itemContributionProductionSalaryUnitPrice(itemContribution);

    return checkAndCalculate(() => (val as number) * (quantity as number), val, quantity);
  }

  function itemContributionProductionSalaryAmountIgnorePriceFactor(
    itemContribution: TItemContribution,
    quantity: TQuantity,
  ) {
    const val = itemContributionProductionSalaryUnitPriceIgnorePriceFactor(itemContribution);

    return checkAndCalculate(() => (val as number) * (quantity as number), val, quantity);
  }

  return {
    projectTotalQuantity,
    projectTotalProductionSalary,
    projectTotalProductionSalaryIgnorePriceFactor,
    projectProductionPriceFactor,
    itemProductionSalaryUnitPrice,
    itemProductionSalaryUnitPriceIgnorePriceFactor,
    itemProductionSalaryAmount,
    itemProductionSalaryAmountIgnorePriceFactor,
    itemPriceFactor,
    itemContributionProductionSalaryBase,
    itemContributionProductionSalaryUnitPrice,
    itemContributionProductionSalaryUnitPriceIgnorePriceFactor,
    itemContributionProductionSalaryAmount,
    itemContributionProductionSalaryAmountIgnorePriceFactor,
  };
}
