import type Excel from 'exceljs';
import { saveAs } from 'file-saver';

export default async function saveExcelFile(fileName: string, workbook: Excel.Workbook) {
  const xls64 = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([xls64], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    fileName,
  );
}
