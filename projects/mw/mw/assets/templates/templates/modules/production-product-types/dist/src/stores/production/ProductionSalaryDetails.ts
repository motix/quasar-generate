import { ref } from 'vue';

import { defineStore } from 'pinia';

import type { CollectionReference } from 'firebase/firestore';
import { addDoc, collection, deleteDoc, getDocs, orderBy, query, where } from 'firebase/firestore';

import type {
  ProductionSalaryDetail,
  ProductionSalaryDetailAm,
  ProductionSalaryDetailVm,
  ProductType,
  ProductTypeAm,
} from 'models/production/index.js';
import productionMapper from 'models/production/mapper/productionMapper.js';

import type {
  ReleaseDocsActionPayload,
  UpdateDocsActionPayload,
} from 'stores/firebase-firestore/index.js';

import { getFirestore } from 'services/firebase.js';

import { requiredConfigEntries } from 'composables/useConfig.js';

import { productTypesStoreDefaultSort } from './ProductTypes.js';

export const useProductionSalaryDetailsStore = defineStore('ProductionSalaryDetails', () => {
  // Private

  const { releaseDocsTimeout } = requiredConfigEntries('releaseDocsTimeout');

  let releaseDocsTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // State

  const productTypes = ref<Required<ProductType<ProductionSalaryDetail>>[]>([]);

  // Actions

  async function loadAllDocs() {
    if (releaseDocsTimeoutId) {
      clearTimeout(releaseDocsTimeoutId);
      releaseDocsTimeoutId = null;
    }

    if (productTypes.value.length > 0) {
      return;
    }

    const db = getFirestore();
    const productTypesRef = collection(
      db,
      'production_productTypes',
    ) as CollectionReference<ProductTypeAm>;
    const productTypesQuery = query(
      productTypesRef,
      where('isActive', '==', true),
      ...productTypesStoreDefaultSort,
    );
    const productTypesSnapshot = await getDocs(productTypesQuery);
    const productTypeAndIds = productTypesSnapshot.docs.map((snapshot) => {
      return [snapshot.data(), snapshot.id];
    });
    const productTypeAms = productTypeAndIds.map(
      (productTypeAndId) => productTypeAndId[0] as ProductTypeAm,
    );
    const productTypeIdMap = new Map(
      productTypeAndIds as Iterable<readonly [ProductTypeAm, string]>,
    );
    const extraArgs = () => ({ idMap: productTypeIdMap });

    // It's safe to map as Required<ProductType<ProductionSalaryDetail>> here
    // because we will set productionSalaryDetails right after.
    productTypes.value = productionMapper.mapArray<
      ProductTypeAm,
      Required<ProductType<ProductionSalaryDetail>>
    >(productTypeAms, 'ProductTypeAm', 'ProductType', { extraArgs });

    await Promise.all(
      productTypes.value.map(async (productType) => {
        const productionSalaryDetailsRef = collection(
          productTypesRef,
          productType.id,
          'productionSalaryDetails',
        ) as CollectionReference<ProductionSalaryDetailAm>;
        const productionSalaryDetailsQuery = query(
          productionSalaryDetailsRef,
          orderBy('productionRole.position'),
          orderBy('productionRole.name'),
        );
        const productionSalaryDetailsSnapshot = await getDocs(productionSalaryDetailsQuery);

        productType.productionSalaryDetails = productionMapper.mapArray<
          ProductionSalaryDetailAm,
          ProductionSalaryDetail
        >(
          productionSalaryDetailsSnapshot.docs.map((snapshot) => snapshot.data()),
          'ProductionSalaryDetailAm',
          'ProductionSalaryDetail',
        );
      }),
    );
  }

  async function updateProductTypes({
    docs,
  }: UpdateDocsActionPayload<Required<ProductType<ProductionSalaryDetailVm>>>) {
    const db = getFirestore();
    const productTypesRef = collection(
      db,
      'production_productTypes',
    ) as CollectionReference<ProductTypeAm>;

    for (const doc of docs) {
      const productionSalaryDetailsRef = collection(
        productTypesRef,
        doc.id,
        'productionSalaryDetails',
      ) as CollectionReference<ProductionSalaryDetailAm>;

      const productionSalaryDetailsSnapshot = await getDocs(productionSalaryDetailsRef);
      await Promise.all(productionSalaryDetailsSnapshot.docs.map((value) => deleteDoc(value.ref)));

      await Promise.all(
        doc.productionSalaryDetails.map((value) => {
          const productionSalaryDetailAm = productionMapper.map<
            ProductionSalaryDetailVm,
            ProductionSalaryDetailAm
          >(value, 'ProductionSalaryDetailVm', 'ProductionSalaryDetailAm');

          return addDoc(productionSalaryDetailsRef, productionSalaryDetailAm);
        }),
      );
    }

    releaseDocs({ immediately: true });
  }

  function releaseDocs({ immediately }: ReleaseDocsActionPayload) {
    if (immediately) {
      productTypes.value = [];
    } else {
      releaseDocsTimeoutId = setTimeout(() => {
        productTypes.value = [];
      }, releaseDocsTimeout);
    }
  }

  return {
    productTypes,
    loadAllDocs,
    releaseDocs,
    updateProductTypes,
  };
});
