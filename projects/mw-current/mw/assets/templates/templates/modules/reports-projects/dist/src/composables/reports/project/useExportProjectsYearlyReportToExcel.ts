import Excel from 'exceljs';

import imageUrlToBase64 from 'utils/imageUrlToBase64.js';
import saveExcelFile from 'utils/saveExcelFile.js';

import type { ProjectsYearlyReport } from 'models/reports/index.js';

import useProjectCalculator from 'composables/reports/project/useProjectCalculator.js';
import useProjectsReportSummary from 'composables/reports/project/useProjectsReportSummary.js';
import useFormats from 'composables/useFormats.js';

export default function useExportProjectsYearlyReportToExcel() {
  return {
    exportProjectsYearlyReportToExcel,
  };
}

async function exportProjectsYearlyReportToExcel(report: ProjectsYearlyReport) {
  const f = useFormats();

  const mc = useProjectCalculator();

  const allBorders: Partial<Excel.Borders> = {
    top: { style: 'thin' },
    right: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
  };

  const workbook = new Excel.Workbook();

  const worksheet = workbook.addWorksheet(`Projects Yearly Report ${report.year}`);

  // Columns

  worksheet.columns = [
    { key: 'space', width: 2.5 },
    { key: 'number', width: 5 },
    { key: 'finishDate', width: 16 },
    { key: 'customer', width: 25 },
    { key: 'name', width: 50 },
    { key: 'status', width: 16 },
    { key: 'invoiceRequired', width: 16 },
    { key: 'vatExcludedInvoice', width: 16 },
    { key: 'productionSalary', width: 16 },
    { key: 'expense', width: 16 },
    { key: 'profit', width: 16 },
    { key: 'vatIncludedInvoice', width: 16 },
    { key: 'received', width: 16 },
    { key: 'balance', width: 16 },
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
    `Projects Yearly Report ${report.year}`,
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
    'Finish Date',
    'Customer',
    'Name',
    'Status',
    'Invoice Required',
    'VAT Ecl. Invoice',
    'Production Slr.',
    'Expense',
    'Profit',
    'VAT Icl. Invoice',
    'Received',
    'Balance',
  ]);

  currentRow.eachCell((cell) => {
    cell.style = {
      border: allBorders,
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      font: { bold: true },
    };
  });

  // Details

  report.content.forEach((project, index) => {
    currentRow = worksheet.addRow([
      undefined,
      index + 1,
      f.date(project.finishDate),
      project.customer.name,
      project.name,
      project.statusHelper.text,
      project.isInvoiceRequired ? 'x' : '',
      mc.projectTotalVatExcludedInvoice(project),
      mc.projectTotalProductionSalary(project),
      mc.projectTotalExpense(project),
      mc.projectProfit(project),
      mc.projectTotalInvoice(project),
      mc.projectTotalReceipt(project),
      mc.projectBalance(project),
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

    currentRow.getCell('finishDate').style.alignment!.horizontal =
      currentRow.getCell('status').style.alignment!.horizontal =
      currentRow.getCell('invoiceRequired').style.alignment!.horizontal =
        'center';

    currentRow.getCell('profit').style.font = currentRow.getCell('balance').style.font = {
      bold: true,
    };
  });

  // Total

  const {
    totalVatExcludedInvoice,
    totalProductionSalary,
    totalExpense,
    totalProfit,
    totalInvoice,
    totalReceipt,
    totalBalance,
  } = useProjectsReportSummary(report.content);

  currentRow = worksheet.addRow([
    undefined,
    'Total',
    '',
    '',
    `Projects: ${report.content.length}`,
    '',
    '',
    totalVatExcludedInvoice.value,
    totalProductionSalary.value,
    totalExpense.value,
    totalProfit.value,
    totalInvoice.value,
    totalReceipt.value,
    totalBalance.value,
  ]);

  currentRow.eachCell((cell, colNumber) => {
    if (colNumber === 4) {
      cell.merge(currentRow.getCell('number'));
    }

    if (colNumber > 7) {
      cell.value = {
        formula: `SUM(${String.fromCharCode(
          colNumber + 64,
        )}5:${String.fromCharCode(colNumber + 64)}${5 + report.content.length - 1})`,
        result: cell.value as number,
        date1904: true,
      };
    }

    cell.style = {
      border: allBorders,
      font: { bold: true },
      numFmt: '#,##0;(#,##0)',
    };

    if (colNumber === 2 || colNumber === 5) {
      cell.style.alignment = { horizontal: 'right' };
    }
  });

  await saveExcelFile(`Motix Projects Yearly Report ${report.year}.xlsx`, workbook);
}
