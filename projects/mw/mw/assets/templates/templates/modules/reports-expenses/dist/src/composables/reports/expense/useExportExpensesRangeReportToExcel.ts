import Excel from 'exceljs';

import imageUrlToBase64 from 'utils/imageUrlToBase64.js';
import saveExcelFile from 'utils/saveExcelFile.js';

import type { ExpensesRangeReport } from 'models/reports/index.js';

import useExpensesReportSummary from 'composables/reports/expense/useExpensesReportSummary.js';
import useFormats from 'composables/useFormats.js';

export default function useExportExpensesRangeReportToExcel() {
  return {
    exportExpensesRangeReportToExcel,
  };
}

async function exportExpensesRangeReportToExcel(report: ExpensesRangeReport) {
  const f = useFormats();

  const allBorders: Partial<Excel.Borders> = {
    top: { style: 'thin' },
    right: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
  };

  const workbook = new Excel.Workbook();

  const worksheet = workbook.addWorksheet(
    `Expenses Report ${f.date(report.startDate)} - ${f.date(report.endDate)}`.replaceAll('/', '-'),
  );

  // Columns

  worksheet.columns = [
    { key: 'space', width: 2.5 },
    { key: 'number', width: 5 },
    { key: 'issueDate', width: 16 },
    { key: 'expense', width: 25 },
    { key: 'project', width: 50 },
    { key: 'content', width: 50 },
    { key: 'group', width: 25 },
    { key: 'supplier', width: 25 },
    { key: 'total', width: 16 },
    { key: 'totalPayment', width: 16 },
    { key: 'balance', width: 16 },
    ...report.content.financeAccounts.map((value) => ({
      key: value.id,
      width: 16,
    })),
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
    `Expenses Report ${f.date(report.startDate)} - ${f.date(report.endDate)}`,
  ]);

  currentRow.font = { size: 48 };

  const imageDataUrl = await imageUrlToBase64('/motix-logo-negative.png');

  const imageId = workbook.addImage({
    base64: imageDataUrl,
    extension: 'png',
  });

  worksheet.addImage(imageId, {
    tl: { col: 1, row: 1 },
    ext: { width: 300, height: 69 },
  });

  // Spacing

  currentRow = worksheet.addRow([]);

  currentRow.height = 30;

  // Headers

  currentRow = worksheet.addRow([
    undefined,
    '#',
    'Issue Date',
    'Expense',
    'Project',
    'Content',
    'Group',
    'Supplier',
    'Total',
    'Total Payment',
    'Balance',
    ...report.content.financeAccounts.map((value) => value.name),
  ]);

  currentRow.eachCell((cell) => {
    cell.style = {
      border: allBorders,
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      font: { bold: true },
    };
  });

  // Details

  report.content.details.forEach((detail, index) => {
    currentRow = worksheet.addRow([
      undefined,
      index + 1,
      f.date(detail.expense.issueDate),
      detail.expense.code,
      detail.project?.name || '',
      detail.project ? '' : detail.expense.content,
      detail.expense.group?.name || '',
      detail.expense.supplier.name,
      detail.total,
      detail.totalPayment,
      detail.balance,
      ...report.content.financeAccounts.map((value) =>
        detail.totalPaymentByFinanceAccount[value.id] === undefined
          ? ''
          : detail.totalPaymentByFinanceAccount[value.id],
      ),
    ]);

    currentRow.eachCell((cell) => {
      cell.style = {
        border: allBorders,
        alignment: {
          vertical: 'middle',
          wrapText: true,
        },
        numFmt: '#,##0;(#,##0)',
      };
    });

    currentRow.getCell('issueDate').style.alignment!.horizontal = 'center';

    currentRow.getCell('balance').style.font = { bold: true };
  });

  // Total

  const { totalExpense, totalPayment, totalBalance, totalPaymentByFinanceAccount } =
    useExpensesReportSummary(report.content.details, report.content.financeAccounts);

  currentRow = worksheet.addRow([
    undefined,
    'Total',
    '',
    '',
    '',
    '',
    '',
    '',
    totalExpense.value,
    totalPayment.value,
    totalBalance.value,
    ...report.content.financeAccounts.map((value) => totalPaymentByFinanceAccount.value[value.id]),
  ]);

  currentRow.eachCell((cell, colNumber) => {
    if (colNumber === 8) {
      cell.merge(currentRow.getCell('number'));
    }

    if (colNumber > 8) {
      cell.value = {
        formula: `SUM(${String.fromCharCode(
          colNumber + 64,
        )}5:${String.fromCharCode(colNumber + 64)}${5 + report.content.details.length - 1})`,
        result: cell.value as number,
        date1904: true,
      };
    }

    cell.style = {
      border: allBorders,
      font: { bold: true },
      numFmt: '#,##0;(#,##0)',
    };

    if (colNumber === 2) {
      cell.style.alignment = { horizontal: 'right' };
    }
  });

  await saveExcelFile(
    `Motix Expenses Report ${f.date(report.startDate)} - ${f.date(report.endDate)}.xlsx`.replaceAll(
      '/',
      '-',
    ),
    workbook,
  );
}
