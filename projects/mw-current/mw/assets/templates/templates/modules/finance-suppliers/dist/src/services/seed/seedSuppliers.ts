import { useSuppliersStore } from 'stores/finance/Suppliers.js';

export function seedSuppliers() {
  const store = useSuppliersStore();
  const codes = ['nuo', 'cln', 'cqt', 'ctp', 'die', 'dtvt', 'evt', 'fbk', 'gan', 'lnv'];
  const names = [
    'Cấp Nước',
    'Chia Lợi Nhuận',
    'Cơ Quan Thuế',
    'Công Tác Phí',
    'Điện Lực',
    'Điện Thoại Viễn Thông',
    'Envato',
    'Facebook',
    'Gia An',
    'Lương Nhân Viên',
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
