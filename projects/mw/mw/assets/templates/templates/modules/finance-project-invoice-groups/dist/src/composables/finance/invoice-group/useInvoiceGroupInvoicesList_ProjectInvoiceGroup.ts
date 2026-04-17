import { where } from 'firebase/firestore';

import { sortBy } from 'lodash-es';

import type { Invoice, Project } from 'models/finance/index.js';

import { useInstantProjectsStore } from 'stores/finance/Projects';

import useInvoiceGroupInvoicesList from 'composables/finance/invoice-group/useInvoiceGroupInvoicesList.js';

type Props = { invoiceGroupId: string };

export default function useInvoiceGroupInvoicesList_ProjectInvoiceGroup(props: Readonly<Props>) {
  // Composables

  const $p = useInvoiceGroupInvoicesList<Project>(props);
  const {
    // Auto sort
    buidHasParentInvoiceLink,
    invoiceRecords,
    loadInvoicesFromStore,
  } = $p;

  // Private Executions

  const originalLoadInvoicesFromStore = loadInvoicesFromStore.value;
  loadInvoicesFromStore.value = async () => {
    await originalLoadInvoicesFromStore();

    const projectsStore = useInstantProjectsStore();

    await projectsStore.loadAllDocs({
      queryConstraints: [where('invoiceGroupIds', 'array-contains', props.invoiceGroupId)],
    });

    // orderBy('issueDate', 'desc'),
    // orderBy('createDate'),
    invoiceRecords.value = sortBy(
      sortBy(
        [
          ...(invoiceRecords.value || []),

          // Casting is requried as DocumentStatus contains private fields
          // See https://github.com/vuejs/core/issues/2981
          ...(projectsStore.docs as Project[]).flatMap((project) =>
            project.quotations
              .flatMap((quotation) => (quotation.invoice ? [quotation.invoice] : []))
              .filter((invoice) => invoice.group?.id === props.invoiceGroupId)
              .map((invoice) => ({
                invoice,
                parent: project,
              })),
          ),
        ],
        (record) => record.invoice.createDate,
      ).reverse(),
      (record) => record.invoice.issueDate,
    ).reverse();

    projectsStore.$dispose();
  };

  buidHasParentInvoiceLink.value = (invoice: Invoice, parent: Project) =>
    `/project-invoices/${parent.urlFriendlyName}/${invoice.code.replaceAll('.', '_')}`;

  return {
    ...$p,
  };
}
