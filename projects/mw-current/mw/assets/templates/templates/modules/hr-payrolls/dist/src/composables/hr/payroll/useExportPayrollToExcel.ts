import Excel from 'exceljs';

import imageUrlToBase64 from 'utils/imageUrlToBase64.js';
import saveExcelFile from 'utils/saveExcelFile.js';

import type { Payroll } from 'models/hr/index.js';

import usePayrollCalculator from 'composables/hr/payroll/usePayrollCalculator.js';
import useFormats from 'composables/useFormats.js';

export default function useExportPayrollToExcel() {
  return {
    exportPayrollToExcel,
  };
}

async function exportPayrollToExcel(payroll: Payroll) {
  const f = useFormats();

  const mc = usePayrollCalculator<Payroll>();

  const allBorders: Partial<Excel.Borders> = {
    top: { style: 'thin' },
    right: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
  };

  const workbook = new Excel.Workbook();

  const worksheet = workbook.addWorksheet(`Payroll ${f.yearMonth(payroll.year, payroll.month)}`);

  // Columns

  worksheet.columns = [
    { key: 'space', width: 2.5 },
    { key: 'number', width: 5 },
    { key: 'fullName', width: 35 },
    { key: 'baseSalary', width: 16 },
    { key: 'productionSalary', width: 16 },
    { key: 'workingDays', width: 16 },
    { key: 'baseAndProductionSalary', width: 16 },
    { key: 'bonus', width: 16 },
    { key: 'socialInsuranceSalary', width: 16 },
    { key: 'socialInsurance', width: 16 },
    { key: 'personalIncomeTax', width: 16 },
    { key: 'unionDues', width: 16 },
    { key: 'adjustment', width: 16 },
    { key: 'netSalary', width: 16 },
  ];

  // Spacing

  let currentRow = worksheet.addRow([]);

  // Title

  currentRow = worksheet.addRow([
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    'Payroll',
  ]);

  currentRow.font = { size: 48 };
  currentRow.alignment = { horizontal: 'right' };

  const imageDataUrl = await imageUrlToBase64('/motix-logo-negative.png');

  const imageId = workbook.addImage({
    base64: imageDataUrl,
    extension: 'png',
  });

  worksheet.addImage(imageId, {
    tl: { col: 1, row: 1 },
    ext: { width: 300, height: 69 },
  });

  // Payroll Date

  currentRow = worksheet.addRow([
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    f.yearMonth(payroll.year, payroll.month),
  ]);

  currentRow.font = { size: 18 };
  currentRow.alignment = { horizontal: 'right' };

  // Generate Date

  currentRow = worksheet.addRow([
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    `Generated on: ${f.date(new Date())}`,
  ]);

  currentRow.alignment = { horizontal: 'right' };

  // Spacing

  currentRow = worksheet.addRow([]);

  currentRow.height = 30;

  // Headers

  currentRow = worksheet.addRow([
    undefined,
    '#',
    'Full Name',
    'Base Salary',
    'Production Salary',
    'Workding Days',
    'Base And Production Salary',
    'Bonus',
    'Social Insurance Salary',
    'Social Insurance',
    'Personal Income Tax',
    'Union Dues',
    'Adjustment',
    'Net Salary',
  ]);

  currentRow.eachCell((cell) => {
    cell.style = {
      border: allBorders,
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      font: { bold: true },
    };
  });

  // Details

  payroll.details.forEach((detail, index) => {
    currentRow = worksheet.addRow([
      undefined,
      index + 1,
      detail.fullName,
      detail.baseSalary,
      detail.productionSalary,
      detail.workingDays,
      mc.payrollDetailBaseAndProductionSalary(detail, payroll.workingDays),
      detail.bonus,
      detail.socialInsuranceSalary,
      mc.payrollDetailSocialInsurance(detail, payroll.socialInsurancePercent),
      detail.personalIncomeTax,
      mc.payrollDetailUnionDues(detail, payroll.unionDuesPercent),
      detail.adjustment,
      mc.payrollDetailNetSalary(
        detail,
        payroll.socialInsurancePercent,
        payroll.unionDuesPercent,
        payroll.workingDays,
      ),
    ]);

    currentRow.eachCell((cell) => {
      cell.style = {
        border: allBorders,
        alignment: {
          vertical: 'middle',
          wrapText: true,
        },
        numFmt: '#,##0;[Red](#,##0)',
      };
    });
  });

  // Total

  currentRow = worksheet.addRow([
    undefined,
    'Total',
    '',
    mc.payrollTotalBaseSalary(payroll),
    mc.payrollTotalProductionSalary(payroll),
    '',
    mc.payrollTotalBaseAndProductionSalary(payroll),
    mc.payrollTotalBonus(payroll),
    mc.payrollTotalSocialInsuranceSalary(payroll),
    mc.payrollTotalSocialInsurance(payroll),
    mc.payrollTotalPersonalIncomeTax(payroll),
    mc.payrollTotalUnionDues(payroll),
    mc.payrollTotalAdjustment(payroll),
    mc.payrollTotalNetSalary(payroll),
  ]);

  currentRow.eachCell((cell, colNumber) => {
    if (colNumber === 3) {
      cell.merge(currentRow.getCell('number'));
    }

    if (colNumber > 3 && colNumber !== 6 && payroll.details.length > 0) {
      cell.value = {
        formula: `SUM(${String.fromCharCode(
          colNumber + 64,
        )}7:${String.fromCharCode(colNumber + 64)}${7 + payroll.details.length - 1})`,
        result: cell.value as number,
        date1904: true,
      };
    }

    cell.style = {
      border: allBorders,
      font: { bold: true },
      numFmt: '#,##0;[Red](#,##0)',
    };

    if (colNumber === 2) {
      cell.style.alignment = { horizontal: 'right' };
    }
  });

  // Payable

  currentRow = worksheet.addRow([
    undefined,
    'Payable',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    mc.payrollTotalPayable(payroll),
    '',
    '',
    '',
    '',
  ]);

  currentRow.eachCell((cell, colNumber) => {
    if (colNumber === 9) {
      cell.merge(currentRow.getCell('number'));
    }

    if (colNumber === 10) {
      cell.value = {
        formula: `SUM(J${7 + payroll.details.length}:N${7 + payroll.details.length})`,
        result: cell.value as number,
        date1904: true,
      };
    }

    if (colNumber === 14) {
      cell.merge(currentRow.getCell('socialInsurance'));
    }

    cell.style = {
      border: allBorders,
      font: { bold: true },
      numFmt: '#,##0;[Red](#,##0)',
    };

    if (colNumber === 2) {
      cell.style.alignment = { horizontal: 'right' };
    }
  });

  await saveExcelFile(`Motix Payroll ${f.yearMonth(payroll.year, payroll.month)}.xlsx`, workbook);
}
