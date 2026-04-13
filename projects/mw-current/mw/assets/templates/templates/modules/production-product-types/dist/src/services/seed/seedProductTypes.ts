import assignOptional from 'utils/assignOptional.js';

import type { ProductTypeVm } from 'models/production/index.js';

import type { CreateDocActionPayload } from 'stores/firebase-firestore/index.js';
import { useProductionSalaryDetailsStore } from 'stores/production/ProductionSalaryDetails.js';
import { useProductTypesStore } from 'stores/production/ProductTypes.js';

export function seedProductTypes(nameAsId: boolean) {
  const store = useProductTypesStore();
  const names = [
    'Mapping kiến trúc A',
    'Mapping kiến trúc B',
    'Visual trên mapping',
    'Teaser A',
    'Màn hình chờ',
  ];

  names.forEach(
    (name, index) =>
      void store.createDoc(
        assignOptional<CreateDocActionPayload<ProductTypeVm>>(
          {
            doc: {
              isActive: true,
              name,
              position: index + 1,
            },
          },
          {
            idField: nameAsId ? 'name' : undefined,
          },
        ),
      ),
  );

  store.recentlyAddedDocs = [];

  const productionSalaryDetailsStore = useProductionSalaryDetailsStore();
  void productionSalaryDetailsStore.updateProductTypes({
    docs: [
      {
        id: 'man-hinh-cho',
        isActive: true,
        name: '',
        position: 0,
        productionSalaryDetails: [
          {
            productionSalary: 1000000,
            productionRole: {
              id: 'account',
              name: 'Account',
              position: 1,
            },
          },
          {
            productionSalary: 2000000,
            productionRole: {
              id: 'art',
              name: 'Art',
              position: 2,
            },
          },
          {
            productionSalary: 3000000,
            productionRole: {
              id: '3d-motion',
              name: '3D Motion',
              position: 3,
            },
          },
          {
            productionSalary: 4000000,
            productionRole: {
              id: '3d-main-model',
              name: '3D Main Model',
              position: 4,
            },
          },
          {
            productionSalary: 5000000,
            productionRole: {
              id: '2d-motion',
              name: '2D Motion',
              position: 5,
            },
          },
        ],
      },
      {
        id: 'teaser-a',
        isActive: true,
        name: '',
        position: 0,
        productionSalaryDetails: [
          {
            productionSalary: 500000,
            productionRole: {
              id: 'account',
              name: 'Account',
              position: 1,
            },
          },
          {
            productionSalary: 1000000,
            productionRole: {
              id: 'art',
              name: 'Art',
              position: 2,
            },
          },
          {
            productionSalary: 1500000,
            productionRole: {
              id: '3d-motion',
              name: '3D Motion',
              position: 3,
            },
          },
          {
            productionSalary: 2000000,
            productionRole: {
              id: '3d-main-model',
              name: '3D Main Model',
              position: 4,
            },
          },
          {
            productionSalary: 2500000,
            productionRole: {
              id: '2d-motion',
              name: '2D Motion',
              position: 5,
            },
          },
        ],
      },
    ],
    isViewModel: false,
  });
}
