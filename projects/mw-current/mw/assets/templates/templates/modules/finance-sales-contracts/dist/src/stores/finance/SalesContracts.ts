import { uid } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { documentId, orderBy, where } from 'firebase/firestore';

import SalesContractStatus from 'utils/finance/SalesContract/SalesContractStatus.js';

import type {
  Invoice,
  Project,
  SalesContract,
  SalesContractAm,
  SalesContractVm,
} from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import { useInstantGeneralInvoicesStore } from 'stores/finance/GeneralInvoices.js';
import { useInstantProjectsStore } from 'stores/finance/Projects.js';
import type { MapOptions } from 'stores/firebase-firestore/index.js';
import { useStore } from 'stores/firebase-firestore/index.js';

const mapperOptions: MapOptions<SalesContract, SalesContractAm> = {
  apiModelToModelAfterMap: (_, destinations) => {
    destinations.forEach((contract) => {
      contract.statusHelper = new SalesContractStatus(contract, []);
    });
  },
};

const afterLoad = async (docAm: SalesContractAm) => {
  if (docAm.projectIds.length === 0) {
    docAm.loadedProjects = [];
  } else {
    const projectsStore = useInstantProjectsStore();

    await projectsStore.loadAllDocs({
      queryConstraints: [where(documentId(), 'in', docAm.projectIds)],
    });

    if (projectsStore.docs.length !== docAm.projectIds.length) {
      const notFoundIds = docAm.projectIds
        .filter((id) => !projectsStore.docs.map((project) => project.id).includes(id))
        .map((value) => `'${value}'`);

      console.warn(
        `Project IDs ${notFoundIds.join(', ')} not found for SalesContract '${docAm.code}'.`,
      );
    }

    // Casting is requried as DocumentStatus contains private fields
    // See https://github.com/vuejs/core/issues/2981
    docAm.loadedProjects = projectsStore.docs as Project[];

    projectsStore.$dispose();
  }

  if (docAm.generalInvoiceIds.length === 0) {
    docAm.loadedGeneralInvoices = [];
  } else {
    const generalInvoicesStore = useInstantGeneralInvoicesStore();

    await generalInvoicesStore.loadAllDocs({
      queryConstraints: [where(documentId(), 'in', docAm.generalInvoiceIds)],
    });

    if (generalInvoicesStore.docs.length !== docAm.generalInvoiceIds.length) {
      const notFoundIds = docAm.generalInvoiceIds
        .filter((id) => !generalInvoicesStore.docs.map((invoice) => invoice.id).includes(id))
        .map((value) => `'${value}'`);

      console.warn(
        `GeneralInvoice IDs ${notFoundIds.join(', ')} not found for SalesContract '${docAm.code}'.`,
      );
    }

    // Casting is requried as DocumentStatus contains private fields
    // See https://github.com/vuejs/core/issues/2981
    docAm.loadedGeneralInvoices = generalInvoicesStore.docs as Invoice[];

    generalInvoicesStore.$dispose();
  }
};

export const useSalesContractsStore = useStore<SalesContract, SalesContractVm, SalesContractAm>(
  'SalesContracts',
  'finance_salesContracts',
  financeMapper,
  'SalesContract',
  'SalesContractVm',
  'SalesContractAm',
  {
    mapperOptions,
    afterLoad,
  },
);

export function useInstantSalesContractsStore() {
  return useStore<SalesContract, SalesContractVm, SalesContractAm>(
    `InstantSalesContracts_${uid()}`,
    'finance_salesContracts',
    financeMapper,
    'SalesContract',
    'SalesContractVm',
    'SalesContractAm',
    {
      mapperOptions,
      afterLoad,
    },
  )();
}

export const salesContractsStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('signDate', 'desc'),
  orderBy('code'),
];
