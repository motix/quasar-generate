import Excel from 'exceljs';

import imageUrlToBase64 from 'utils/imageUrlToBase64.js';
import saveExcelFile from 'utils/saveExcelFile.js';

import type { Project, Quotation } from 'models/finance/index.js';

import useQuotationCalculator from 'composables/finance/quotation/useQuotationCalculator.js';
import useFormats from 'composables/useFormats.js';

export default function useExportQuotationToExcel() {
  return {
    exportQuotationToExcel,
  };
}

async function exportQuotationToExcel(quotation: Quotation, project: Project) {
  const f = useFormats();

  const mc = useQuotationCalculator<Quotation>();

  const allBorders: Partial<Excel.Borders> = {
    top: { style: 'thin' },
    right: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
  };

  const workbook = new Excel.Workbook();

  const worksheet = workbook.addWorksheet(`Quotation ${quotation.code}`);

  // Columns

  worksheet.columns = [
    { key: 'space', width: 2.5 },
    { key: 'number', width: 5 },
    { key: 'content', width: 50 },
    { key: 'quantity', width: 16 },
    { key: 'unitPrice', width: 16 },
    { key: 'amount', width: 16 },
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
    'Quotation',
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

  // Spacing

  currentRow = worksheet.addRow([]);

  currentRow.height = 30;

  // Address

  [
    'ADDRESS',
    'MOTIX LTD.,',
    '560 Ba Thang Hai Street',
    'Ward 14, District 10',
    'Ho Chi Minh City',
    'Vietnam',
  ].forEach((value) => {
    currentRow = worksheet.addRow([undefined, value]);
    currentRow.getCell('content').merge(currentRow.getCell('number'));
  });

  // Spacing

  worksheet.addRow([]);

  // To

  ['TO', project.customer.name.toUpperCase()].forEach((value) => {
    currentRow = worksheet.addRow([undefined, value]);
    currentRow.getCell('content').merge(currentRow.getCell('number'));
  });

  // General Info

  [
    ['CODE', quotation.code],
    ['ISSUE DATE', f.date(new Date())],
    ['QUOTATION FOR', project.name],
    ['DATE', f.date(project.finishDate)],
  ].forEach((value, index) => {
    const top = 4 + index * 2;
    const left = 4;

    worksheet.getCell(top, left).value = value[0];
    worksheet.getCell(top, left).style = {
      border: allBorders,
      alignment: { horizontal: 'right', vertical: 'middle' },
    };
    worksheet.getCell(top + 1, left).merge(worksheet.getCell(top, left));

    worksheet.getCell(top, left + 1).value = value[1];
    worksheet.getCell(top, left + 1).style = {
      border: allBorders,
      alignment: { horizontal: 'left', vertical: 'middle' },
    };
    worksheet.getCell(top, left + 2).style = { border: allBorders };
    worksheet.getCell(top + 1, left + 1).style = { border: allBorders };
    worksheet.getCell(top + 1, left + 2).merge(worksheet.getCell(top, left + 1));
  });

  // Spacing

  currentRow = worksheet.addRow([]);

  currentRow.height = 30;

  // Headers

  currentRow = worksheet.addRow([undefined, '#', 'Content', 'Quantity', 'Unit Price', 'Amount']);

  currentRow.eachCell((cell) => {
    cell.style = {
      border: allBorders,
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      font: { bold: true },
    };
  });

  // Details

  quotation.details
    .filter((value) => !value.isProductionOnly)
    .forEach((detail, index) => {
      currentRow = worksheet.addRow([
        undefined,
        index + 1,
        detail.content,
        detail.quantity,
        detail.unitPrice,
        mc.quotationDetailAmount(detail),
      ]);

      currentRow.eachCell((cell, colNumber) => {
        if (colNumber === 6) {
          cell.value = {
            formula: `D${currentRow.number}*E${currentRow.number}`,
            result: cell.value as number,
            date1904: true,
          };
        }

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

  // Subtotal

  currentRow = worksheet.addRow([
    undefined,
    'Subtotal',
    '',
    mc.quotationTotalQuantity(quotation),
    '',
    mc.quotationSubtotal(quotation),
  ]);

  currentRow.eachCell((cell, colNumber) => {
    if (colNumber === 3) {
      cell.merge(currentRow.getCell('number'));
    }

    if (
      colNumber > 3 &&
      colNumber !== 5 &&
      quotation.details.filter((value) => !value.isProductionOnly).length > 0
    ) {
      cell.value = {
        formula: `SUM(${String.fromCharCode(
          colNumber + 64,
        )}15:${String.fromCharCode(colNumber + 64)}${
          15 + quotation.details.filter((value) => !value.isProductionOnly).length - 1
        })`,
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

  // Discount

  if (quotation.discount !== undefined) {
    currentRow = worksheet.addRow([undefined, 'Discount', '', '', '', quotation.discount * -1]);

    currentRow.eachCell((cell, colNumber) => {
      if (colNumber === 3) {
        cell.merge(currentRow.getCell('number'));
      }

      if (colNumber === 5) {
        cell.merge(currentRow.getCell('quantity'));
      }

      cell.style = {
        border: allBorders,
        font: { bold: colNumber === 2 },
        numFmt: '#,##0;(#,##0)',
      };

      if (colNumber === 2) {
        cell.style.alignment = { horizontal: 'right' };
      }
    });
  }

  // After Discount

  if (quotation.discount !== undefined) {
    currentRow = worksheet.addRow([
      undefined,
      'After Discount',
      '',
      '',
      '',
      mc.quotationVatExcludedTotal(quotation),
    ]);

    currentRow.eachCell((cell, colNumber) => {
      if (colNumber === 3) {
        cell.merge(currentRow.getCell('number'));
      }

      if (colNumber === 5) {
        cell.merge(currentRow.getCell('quantity'));
      }

      if (colNumber === 6) {
        cell.value = {
          formula: `F${currentRow.number - 2}+F${currentRow.number - 1}`,
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
  }

  // VAT

  if (quotation.vatPercent !== undefined) {
    currentRow = worksheet.addRow([
      undefined,
      `VAT (${f.percent(quotation.vatPercent)})`,
      '',
      quotation.vatableAmount === undefined ? '' : quotation.vatableAmount,
      '',
      mc.quotationVat(quotation),
    ]);

    currentRow.eachCell((cell, colNumber) => {
      if (colNumber === 3) {
        cell.merge(currentRow.getCell('number'));
      }

      if (colNumber === 5) {
        cell.merge(currentRow.getCell('quantity'));
      }

      if (colNumber === 6) {
        cell.value = {
          formula:
            quotation.vatableAmount === undefined
              ? `F${currentRow.number - 1}*${quotation.vatPercent}`
              : `D${currentRow.number}*${quotation.vatPercent}`,
          result: cell.value as number,
          date1904: true,
        };
      }

      cell.style = {
        border: allBorders,
        font: { bold: colNumber === 2 },
        numFmt: '#,##0;(#,##0)',
      };

      if (colNumber === 2) {
        cell.style.alignment = { horizontal: 'right' };
      }
    });
  }

  // Total

  currentRow = worksheet.addRow([undefined, 'Total', '', '', '', mc.quotationTotal(quotation)]);

  currentRow.eachCell((cell, colNumber) => {
    if (colNumber === 3) {
      cell.merge(currentRow.getCell('number'));
    }

    if (colNumber === 5) {
      cell.merge(currentRow.getCell('quantity'));
    }

    if (colNumber === 6) {
      cell.value = {
        formula:
          quotation.vatPercent === undefined
            ? `F${currentRow.number - 1}`
            : `F${currentRow.number - 2}+F${currentRow.number - 1}`,
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

  // Spacing

  currentRow = worksheet.addRow([]);

  currentRow.height = 30;

  // Terms and Condition

  [
    'TERMS AND CONDITIONS',
    '1. This quotation is valid for 30 days since issue date.',
    '2. Additional stock photos, footages and music cost might be charged if necessary.',
  ].forEach((value) => {
    currentRow = worksheet.addRow([undefined, value]);
    currentRow.getCell('amount').merge(currentRow.getCell('number'));
  });

  // Spacing

  currentRow = worksheet.addRow([]);

  currentRow.height = 30;

  // Thank you

  currentRow = worksheet.addRow([undefined, 'THANK YOU FOR CHOOSING US!']);
  currentRow.getCell('amount').merge(currentRow.getCell('number'));
  currentRow.getCell('amount').alignment = { horizontal: 'center' };

  await saveExcelFile(`Motix Quotation ${quotation.code}.xlsx`, workbook);
}
