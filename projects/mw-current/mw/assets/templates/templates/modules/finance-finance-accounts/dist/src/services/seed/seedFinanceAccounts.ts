import assignOptional from 'utils/assignOptional.js';

import type { FinanceAccountVm } from 'models/finance/index.js';

import { useFinanceAccountsStore } from 'stores/finance/FinanceAccounts.js';
import type { CreateDocActionPayload } from 'stores/firebase-firestore/index.js';

export function seedFinanceAccounts(nameAsId: boolean) {
  const store = useFinanceAccountsStore();
  const names = [
    'Cash',
    'Chốt Số Dư',
    'Nguyễn Ngọc Minh',
    'Show Group',
    'TCB 015',
    'TCB 029',
    'TCB Saving',
    'Thu Hộ',
    'TPBank',
    'Trần Tuấn Tú',
  ];
  const descriptions = [
    null,
    null,
    null,
    'Trần Linh, ShowTech, Bảo Huy',
    'Techcombank 19130822129015',
    'Techcombank 19022187530029',
    'Tài khoản tiết kiệm tại Techcombank',
    'Khách hàng gởi tiền, mua hóa đơn, mua hộ khách hàng, nhân viên...',
    null,
    null,
  ];

  for (let i = 0; i < names.length; i++) {
    void store.createDoc(
      assignOptional<CreateDocActionPayload<FinanceAccountVm>>(
        {
          doc: {
            isActive: true,
            name: names[i]!,
            description: descriptions[i]!,
            balanceRecords: [],
          },
        },
        {
          idField: nameAsId ? 'name' : undefined,
        },
      ),
    );
  }
}
