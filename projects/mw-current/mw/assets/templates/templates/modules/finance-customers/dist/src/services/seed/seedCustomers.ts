import { useCustomersStore } from 'stores/finance/Customers.js';

export function seedCustomers() {
  const store = useCustomersStore();
  const codes = ['2rs', 'b2e', 'bah', 'bpr', 'cho', 'hna', 'kms', 'lnk', 'sbr', 'vcm'];
  const names = [
    '2res',
    'B2Event',
    'Bảo Huy',
    'Bpro',
    'Choo Communications',
    'Hana Entertainment And Academy',
    'Kingsmen Vietnam',
    'Long Kan',
    'Sun Bright',
    'V - Communications',
  ];

  for (let i = 0; i < codes.length; i++) {
    void store.createDoc({
      doc: {
        isActive: true,
        code: codes[i]!,
        name: names[i]!,
      },
    });
  }
}
