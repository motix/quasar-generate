import { sumBy } from 'lodash-es';

import { checkAndCalculate, oneThousandRound } from 'utils/calculation.js';

import type { Payroll, PayrollVm } from 'models/hr/index.js';

export default function usePayrollCalculator<TPayroll extends Payroll | PayrollVm>() {
  type TPayrollDetail = TPayroll['details'][number];

  // Payroll

  function payrollTotalBaseSalary(payroll: TPayroll) {
    return sumBy<TPayrollDetail>(payroll.details, (detail) => detail.baseSalary);
  }

  function payrollTotalProductionSalary(payroll: TPayroll) {
    return sumBy<TPayrollDetail>(payroll.details, (detail) => detail.productionSalary);
  }

  function payrollTotalBaseAndProductionSalary(payroll: TPayroll) {
    return sumBy<TPayrollDetail>(
      payroll.details,
      (detail) => payrollDetailBaseAndProductionSalary(detail, payroll.workingDays) || 0,
    );
  }

  function payrollTotalBonus(payroll: TPayroll) {
    return sumBy<TPayrollDetail>(
      payroll.details,
      (detail) => checkAndCalculate(() => detail.bonus as number, detail.bonus) || 0,
    );
  }

  function payrollTotalSocialInsuranceSalary(payroll: TPayroll) {
    return sumBy<TPayrollDetail>(payroll.details, (detail) => detail.socialInsuranceSalary);
  }

  function payrollTotalSocialInsurance(payroll: TPayroll) {
    return sumBy<TPayrollDetail>(
      payroll.details,
      (detail) => payrollDetailSocialInsurance(detail, payroll.socialInsurancePercent) || 0,
    );
  }

  function payrollTotalPersonalIncomeTax(payroll: TPayroll) {
    return sumBy<TPayrollDetail>(
      payroll.details,
      (detail) =>
        checkAndCalculate(() => detail.personalIncomeTax as number, detail.personalIncomeTax) || 0,
    );
  }

  function payrollTotalUnionDues(payroll: TPayroll) {
    return sumBy<TPayrollDetail>(
      payroll.details,
      (detail) => payrollDetailUnionDues(detail, payroll.unionDuesPercent) || 0,
    );
  }

  function payrollTotalAdjustment(payroll: TPayroll) {
    return sumBy<TPayrollDetail>(
      payroll.details,
      (detail) => checkAndCalculate(() => detail.adjustment as number, detail.adjustment) || 0,
    );
  }

  function payrollTotalPayable(payroll: TPayroll) {
    return sumBy<TPayrollDetail>(
      payroll.details,
      (detail) => payrollDetailPayable(detail, payroll.workingDays) || 0,
    );
  }

  function payrollTotalNetSalary(payroll: TPayroll) {
    return sumBy<TPayrollDetail>(
      payroll.details,
      (detail) =>
        payrollDetailNetSalary(
          detail,
          payroll.socialInsurancePercent,
          payroll.unionDuesPercent,
          payroll.workingDays,
        ) || 0,
    );
  }

  // PayrollDetail

  function payrollDetailBaseAndProductionSalary(
    payrollDetail: TPayrollDetail,
    workingDays: string | number,
  ) {
    // payroll.workingDays must not be 0
    if (!workingDays) return undefined;

    return checkAndCalculate(
      () =>
        oneThousandRound(
          Math.round(
            payrollDetail.baseSalary *
              ((payrollDetail.workingDays as number) / (workingDays as number)) +
              payrollDetail.productionSalary,
          ),
        ),
      payrollDetail.workingDays,
      workingDays,
    );
  }

  function payrollDetailSocialInsurance(
    payrollDetail: TPayrollDetail,
    socialInsurancePercent: number | string,
  ) {
    return checkAndCalculate(
      () => Math.round(payrollDetail.socialInsuranceSalary * (socialInsurancePercent as number)),
      socialInsurancePercent,
    );
  }

  function payrollDetailUnionDues(
    payrollDetail: TPayrollDetail,
    unionDuesPercent: number | string,
  ) {
    return checkAndCalculate(
      () =>
        payrollDetail.payUnionDues
          ? Math.round(payrollDetail.socialInsuranceSalary * (unionDuesPercent as number))
          : 0,
      unionDuesPercent,
    );
  }

  function payrollDetailPayable(payrollDetail: TPayrollDetail, workingDays: string | number) {
    const val = payrollDetailBaseAndProductionSalary(payrollDetail, workingDays);

    return checkAndCalculate(
      () => (val as number) + (payrollDetail.bonus as number),
      val,
      payrollDetail.bonus,
    );
  }

  function payrollDetailNetSalary(
    payrollDetail: TPayrollDetail,
    socialInsurancePercent: number | string,
    unionDuesPercent: number | string,
    workingDays: string | number,
  ) {
    const payable = payrollDetailPayable(payrollDetail, workingDays);
    const insurance = payrollDetailSocialInsurance(payrollDetail, socialInsurancePercent);
    const unionDues = payrollDetailUnionDues(payrollDetail, unionDuesPercent);

    return checkAndCalculate(
      () =>
        (payable as number) -
        (insurance as number) -
        (payrollDetail.personalIncomeTax as number) -
        (unionDues as number) +
        (payrollDetail.adjustment as number),
      payable,
      insurance,
      payrollDetail.personalIncomeTax,
      unionDues,
      payrollDetail.adjustment,
    );
  }

  return {
    payrollTotalBaseSalary,
    payrollTotalProductionSalary,
    payrollTotalBaseAndProductionSalary,
    payrollTotalBonus,
    payrollTotalSocialInsuranceSalary,
    payrollTotalSocialInsurance,
    payrollTotalPersonalIncomeTax,
    payrollTotalUnionDues,
    payrollTotalAdjustment,
    payrollTotalPayable,
    payrollTotalNetSalary,
    payrollDetailBaseAndProductionSalary,
    payrollDetailSocialInsurance,
    payrollDetailUnionDues,
    payrollDetailPayable,
    payrollDetailNetSalary,
  };
}
