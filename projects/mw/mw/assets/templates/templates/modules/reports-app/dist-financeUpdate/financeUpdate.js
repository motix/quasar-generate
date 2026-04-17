import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, rmSync } from 'fs';
import { dirname as _dirname, join, resolve } from 'path';

let srcPath = '../motiwiki-2022-finance';

// Invoking into `dev` folder
if (!existsSync(srcPath)) {
  srcPath = '../../sites/motiwiki-2022-finance';
}

const items = [
  'src/composables/finance/expense/useExpenseCalculator.ts',
  'src/composables/finance/invoice/useInvoiceCalculator.ts',
  'src/composables/finance/project/useProjectCalculator.ts',
  'src/composables/finance/sales-contract/useSalesContractCalculator.ts',
  'src/composables/finance/shared/useCustomerOptions.ts',
  'src/composables/finance/shared/useFinanceAccountOptions.ts',
  'src/composables/finance/shared/useSupplierOptions.ts',
  'src/composables/finance/transaction/useTransactionCalculator.ts',
  'src/models/finance',
  'src/models/tasks',
  'src/stores/finance',
  'src/types/slack-api.d.ts',
  'src/utils/finance',
  'src/utils/tasks',
];

for (const item of items) {
  const src = resolve(import.meta.dirname, `${srcPath}/${item}`);
  const dest = resolve(import.meta.dirname, item);

  if (lstatSync(src).isDirectory()) {
    rmSync(dest, { recursive: true, force: true });

    if (existsSync(src)) {
      copyDir(src, dest);
    }
  } else {
    const dirname = _dirname(dest);

    if (!existsSync(dirname)) {
      mkdirSync(dirname, { recursive: true });
    }

    if (existsSync(src)) {
      copyFileSync(src, dest);
    }
  }
}

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}
