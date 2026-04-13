import type { ComponentPublicInstance, Ref } from 'vue';
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { uid } from 'quasar';

import { where } from 'firebase/firestore';

import type {
  Invoice,
  Project,
  SalesContract,
  SalesContractVm,
  VatInvoiceVm,
} from 'models/finance/index.js';

import {
  generalInvoicesStoreDefaultSort,
  useInstantGeneralInvoicesStore,
} from 'stores/finance/GeneralInvoices.js';
import { projectsStoreDefaultSort, useInstantProjectsStore } from 'stores/finance/Projects.js';
import {
  salesContractsStoreDefaultSort,
  useInstantSalesContractsStore,
} from 'stores/finance/SalesContracts.js';

import useDetailsEditor from 'composables/crud-pages/useDetailsEditor.js';
import useEditorDependencies from 'composables/crud-pages/useEditorDependencies.js';
import type { EditPage } from 'composables/crud-pages/useEditPage.js';
import { extendEditPage, useCustomizedEditPage } from 'composables/crud-pages/useEditPage.js';
import type { NewPage } from 'composables/crud-pages/useNewPage/index.js';
import useNewPage from 'composables/crud-pages/useNewPage/index.js';
import type { ViewPage } from 'composables/crud-pages/useViewPage/index.js';
import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useSalesContractCalculator from 'composables/finance/sales-contract/useSalesContractCalculator.js';
import useCustomerOptions from 'composables/finance/shared/useCustomerOptions.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useNotifications from 'composables/useNotifications.js';
import useScroll from 'composables/useScroll.js';

function useVatInvoicesEditor($p: ViewPage<SalesContract, SalesContractVm, NonNullable<unknown>>) {
  // Composables

  const detailsEditor = useDetailsEditor<SalesContractVm, VatInvoiceVm, []>(
    $p,
    (vm) => vm.vatInvoices,
    () => ({
      code: '',
      issueDate: '',
      isCancelled: false,
      content: '',
      subTotal: '',
      vatPercent: null,
      vatAdjustment: null,
      key: uid(),
    }),
  );

  return {
    vatInvoiceEditorRefs: detailsEditor.detailEditorRefs,
    showAddVatInvoiceButton: detailsEditor.showAddDetailButton,
    setVatInvoiceEditorRef: detailsEditor.setDetailEditorRef,
    addVatInvoice: detailsEditor.addDetail,
    insertVatInvoice: detailsEditor.insertDetail,
    removeVatInvoice: detailsEditor.removeDetail,
    validateVatInvoicesEditor: detailsEditor.validateDetailsEditor,
  };
}

function useSameCustomerSalesContracts(
  $p: ViewPage<SalesContract, SalesContractVm, NonNullable<unknown>>,
) {
  // Composables

  const router = useRouter();

  // Data

  const sameCustomerSalesContractsLoading = ref(false);
  const sameCustomerSalesContracts: Ref<SalesContract[]> = ref([]);

  // Computed

  const sameProjectSalesContracts = computed(() =>
    $p.activeModelOrViewModel.value?.projects.length !== 1 ||
    $p.activeModelOrViewModel.value?.generalInvoices.length !== 0
      ? []
      : sameCustomerSalesContracts.value.filter(
          (value) =>
            value.projects.length === 1 &&
            value.projects[0]!.id === $p.activeModelOrViewModel.value?.projects[0]!.id,
        ),
  );

  const sameGeneralInvoiceSalesContracts = computed(() =>
    $p.activeModelOrViewModel.value?.generalInvoices.length !== 1 ||
    $p.activeModelOrViewModel.value?.projects.length !== 0
      ? []
      : sameCustomerSalesContracts.value.filter(
          (value) =>
            value.generalInvoices.length === 1 &&
            value.generalInvoices[0]!.id ===
              $p.activeModelOrViewModel.value?.generalInvoices[0]!.id,
        ),
  );

  const addInvoiceAllowed = computed(
    () =>
      sameProjectSalesContracts.value.length === 0 &&
      sameGeneralInvoiceSalesContracts.value.length === 0,
  );

  // Methods

  function onContractClick(contract: SalesContract) {
    // Wait for the ripple
    setTimeout(() => {
      void router.push(`/sales-contracts/${contract.urlFriendlyCode}`);
    }, 300);
  }

  // Watch

  // Archived sales contract will have hasEditor = false.
  // In this case, viewModel will never be loaded.
  watch(
    computed(() =>
      $p.hasEditor.value ? $p.viewModel.value?.customer?.id : $p.model.value?.customer.id,
    ),
    async (value, oldValue) => {
      if (value !== oldValue) {
        sameCustomerSalesContracts.value = [];

        if (value !== undefined) {
          const salesContractsStore = useInstantSalesContractsStore();

          sameCustomerSalesContractsLoading.value = true;

          await salesContractsStore.loadAllDocs({
            queryConstraints: [
              where('customer.id', '==', value),
              ...salesContractsStoreDefaultSort,
            ],
          });

          // Casting is requried as DocumentStatus contains private fields
          // See https://github.com/vuejs/core/issues/2981
          sameCustomerSalesContracts.value = salesContractsStore.docs as SalesContract[];

          salesContractsStore.$dispose();

          sameCustomerSalesContracts.value = sameCustomerSalesContracts.value.filter(
            (value) =>
              value.id !== ($p.hasEditor.value ? $p.viewModel.value?.id : $p.model.value?.id),
          );

          sameCustomerSalesContractsLoading.value = false;
        }
      }
    },
  );

  return {
    sameCustomerSalesContractsLoading,
    sameCustomerSalesContracts,
    sameProjectSalesContracts,
    sameGeneralInvoiceSalesContracts,
    addInvoiceAllowed,
    onContractClick,
  };
}

function useProjects(
  $p: ViewPage<SalesContract, SalesContractVm, ReturnType<typeof useSameCustomerSalesContracts>>,
) {
  // Private

  const mc = useSalesContractCalculator<SalesContract>();

  function scrollToInvoice(index: number) {
    scrollToElement(
      projectInvoiceRefs.value[index] ||
        (() => {
          throw new Error('[finance-sales-contracts] Index out of range');
        })(),
    );
  }

  // Composables

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  const { toElement: scrollToElement } = useScroll();

  const { isCardsView } = useMultiViews();

  // Data

  const projectInvoiceRefs = ref<ComponentPublicInstance[]>([]);
  const sameCustomerProjectsLoading = ref(false);
  const sameCustomerProjects: Ref<Project[]> = ref([]);
  const newProject: Ref<Project | null> = ref(null);

  // Computed

  const projectOptionsLoading = computed(
    () => sameCustomerProjectsLoading.value && $p.sameCustomerSalesContractsLoading.value,
  );

  const projectOptions = computed(() =>
    $p.addInvoiceAllowed.value
      ? sameCustomerProjects.value.filter(
          (value) =>
            !$p.sameCustomerSalesContracts.value.find(
              (contract) =>
                !!contract.projects.find((project) => project.id === value.id) &&
                ($p.vm.value.projects.length + $p.vm.value.generalInvoices.length > 0 ||
                  contract.projects.length > 1 ||
                  contract.generalInvoices.length > 0 ||
                  mc.salesContractDifference(contract, []) === 0),
            ) && !$p.viewModel.value?.projects.find((project) => project.id === value.id),
        )
      : [],
  );

  // Methods

  function setProjectInvoiceRef(
    el: (typeof projectInvoiceRefs.value)[number] | null,
    index: number,
  ) {
    if (el !== null) {
      projectInvoiceRefs.value[index] = el;
    }
  }

  function addProject() {
    if (!newProject.value) {
      return;
    }

    $p.vm.value.projects.push(newProject.value);

    newProject.value = null;

    $p.dirty();

    if (isCardsView.value) {
      const unwatch = watch(
        computed(() => projectInvoiceRefs.value.length),
        (value) => {
          if (value >= $p.vm.value.projects.length + $p.vm.value.generalInvoices.length) {
            unwatch();
            void nextTick(() => {
              scrollToInvoice($p.vm.value.projects.length - 1);
            });
          }
        },
      );
    }
  }

  function removeProject(index: number) {
    $p.vm.value.projects.splice(index, 1);

    $p.dirty();
  }

  // Watch

  watch(
    computed(() => $p.viewModel.value?.customer?.id),
    async (value, oldValue) => {
      if (value !== oldValue) {
        sameCustomerProjects.value = [];
        newProject.value = null;

        if ($p.editMode.value && $p.viewModel.value) {
          $p.viewModel.value.projects = [];
        }

        if (value !== undefined) {
          const projectsStore = useInstantProjectsStore();

          sameCustomerProjectsLoading.value = true;

          try {
            await projectsStore.loadAllDocs({
              queryConstraints: [where('customer.id', '==', value), ...projectsStoreDefaultSort],
            });
          } catch (error) {
            console.error(error);
            notifyLoadDataError();
            notifyErrorDebug(error);
          }

          // Casting is requried as DocumentStatus contains private fields
          // See https://github.com/vuejs/core/issues/2981
          sameCustomerProjects.value = projectsStore.docs as Project[];

          projectsStore.$dispose();

          sameCustomerProjectsLoading.value = false;
        }
      }
    },
  );

  watch(
    computed(() => $p.viewModel.value?.projects.length),
    () => {
      projectInvoiceRefs.value = [];
    },
  );

  return {
    projectInvoiceRefs,
    sameCustomerProjectsLoading,
    sameCustomerProjects,
    newProject,
    projectOptionsLoading,
    projectOptions,
    setProjectInvoiceRef,
    addProject,
    removeProject,
  };
}

function useGeneralInvoices(
  $p: ViewPage<SalesContract, SalesContractVm, ReturnType<typeof useSameCustomerSalesContracts>>,
) {
  // Private

  function scrollToInvoice(index: number) {
    scrollToElement(
      generalInvoiceRefs.value[index] ||
        (() => {
          throw new Error('[finance-sales-contracts] Index out of range');
        })(),
    );
  }

  // Composables

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  const { toElement: scrollToElement } = useScroll();

  const { isCardsView } = useMultiViews();

  // Data

  const generalInvoiceRefs = ref<ComponentPublicInstance[]>([]);
  const sameCustomerGeneralInvoicesLoading = ref(false);
  const sameCustomerGeneralInvoices: Ref<Invoice[]> = ref([]);
  const newGeneralInvoice: Ref<Invoice | null> = ref(null);

  // Computed

  const generalInvoiceOptionsLoading = computed(
    () => sameCustomerGeneralInvoicesLoading.value && $p.sameCustomerSalesContractsLoading.value,
  );

  const generalInvoiceOptions = computed(() =>
    $p.addInvoiceAllowed.value
      ? sameCustomerGeneralInvoices.value.filter(
          (value) =>
            !$p.sameCustomerSalesContracts.value.find(
              (contract) =>
                !!contract.generalInvoices.find((invoice) => invoice.id === value.id) &&
                ($p.vm.value.projects.length + $p.vm.value.generalInvoices.length > 0 ||
                  contract.projects.length > 0 ||
                  contract.generalInvoices.length > 1),
            ) && !$p.viewModel.value?.generalInvoices.find((invoice) => invoice.id === value.id),
        )
      : [],
  );

  // Methods

  function setGeneralInvoiceRef(
    el: (typeof generalInvoiceRefs.value)[number] | null,
    index: number,
  ) {
    if (el !== null) {
      generalInvoiceRefs.value[index] = el;
    }
  }

  function addGeneralInvoice() {
    if (!newGeneralInvoice.value) {
      return;
    }

    $p.vm.value.generalInvoices.push(newGeneralInvoice.value);

    newGeneralInvoice.value = null;

    $p.dirty();

    if (isCardsView.value) {
      const unwatch = watch(
        computed(() => generalInvoiceRefs.value.length),
        (value) => {
          if (value >= $p.vm.value.projects.length + $p.vm.value.generalInvoices.length) {
            unwatch();
            void nextTick(() => {
              scrollToInvoice($p.vm.value.projects.length + $p.vm.value.generalInvoices.length - 1);
            });
          }
        },
      );
    }
  }

  function removeGeneralInvoice(index: number) {
    $p.vm.value.generalInvoices.splice(index, 1);

    $p.dirty();
  }

  // Watch

  watch(
    computed(() => $p.viewModel.value?.customer?.id),
    async (value, oldValue) => {
      if (value !== oldValue) {
        sameCustomerGeneralInvoices.value = [];
        newGeneralInvoice.value = null;

        if ($p.editMode.value && $p.viewModel.value) {
          $p.viewModel.value.generalInvoices = [];
        }

        if (value !== undefined) {
          const generalInvoicesStore = useInstantGeneralInvoicesStore();

          sameCustomerGeneralInvoicesLoading.value = true;

          try {
            await generalInvoicesStore.loadAllDocs({
              queryConstraints: [
                where('customer.id', '==', value),
                ...generalInvoicesStoreDefaultSort,
              ],
            });
          } catch (error) {
            console.error(error);
            notifyLoadDataError();
            notifyErrorDebug(error);
          }

          // Casting is requried as DocumentStatus contains private fields
          // See https://github.com/vuejs/core/issues/2981
          sameCustomerGeneralInvoices.value = generalInvoicesStore.docs as Invoice[];

          generalInvoicesStore.$dispose();

          sameCustomerGeneralInvoicesLoading.value = false;
        }
      }
    },
  );

  watch(
    computed(() => $p.viewModel.value?.projects.length),
    () => {
      generalInvoiceRefs.value = [];
    },
  );

  return {
    generalInvoiceRefs,
    sameCustomerGeneralInvoicesLoading,
    sameCustomerGeneralInvoices,
    newGeneralInvoice,
    generalInvoiceOptionsLoading,
    generalInvoiceOptions,
    setGeneralInvoiceRef,
    addGeneralInvoice,
    removeGeneralInvoice,
  };
}

function useSalesContractEditPageExtra($p: EditPage<never, SalesContractVm, NonNullable<unknown>>) {
  // Composables

  const f = useFormats();

  const vmc = useSalesContractCalculator<SalesContractVm>();

  const $ep = extendEditPage($p);

  const { editorReady, editorDependenciesStores } = useEditorDependencies($ep.editMode);

  const { customerOptions, customersEditorDependenciesStore, filterCustomerOptions } =
    useCustomerOptions();

  // Private Executions

  editorDependenciesStores.value = [customersEditorDependenciesStore];

  return {
    f,
    vmc,
    editorReady,
    editorDependenciesStores,
    customerOptions,
    filterCustomerOptions,
  };
}

function useSalesContractNewPageExtra($p: NewPage<SalesContractVm, NonNullable<unknown>>) {
  return useSalesContractEditPageExtra($p);
}

function useSalesContractViewPageExtra(
  $p: ViewPage<SalesContract, SalesContractVm, ReturnType<typeof useVatInvoicesEditor>>,
) {
  // Private

  const cc = useSalesContractCalculator();

  const addVatInvoice = $p.addVatInvoice;

  // Composables

  const router = useRouter();

  const extra = useSalesContractEditPageExtra($p);

  const mc = useSalesContractCalculator<SalesContract>();

  // Computed

  const invoices = computed(() =>
    $p.activeModelOrViewModel.value ? cc.collectInvoices($p.activeModelOrViewModel.value) : [],
  );

  // Methods

  function switchToEditModeAndAddVatInvoice() {
    if (!$p.editMode.value) {
      $p.openToolbar();
      $p.editMode.value = true;
    }

    if (extra.editorReady.value) {
      addVatInvoice();
    } else {
      const stopWatch = watch(extra.editorReady, () => {
        if (extra.editorReady.value) {
          stopWatch();
          addVatInvoice();
        }
      });
    }
  }

  function onInvoiceClick(record: { project: Project | undefined; invoice: Invoice | undefined }) {
    // Wait for the ripple
    record.invoice &&
      setTimeout(() => {
        record.invoice &&
          void router.push(
            record.project
              ? `/project-invoices/${
                  record.project.urlFriendlyName
                }/${record.invoice.code.replaceAll('.', '_')}`
              : `/general-invoices/${record.invoice.code.replaceAll('.', '_')}`,
          );
      }, 300);
  }

  return {
    ...extra,
    mc,
    invoices,
    addVatInvoice: switchToEditModeAndAddVatInvoice,
    onInvoiceClick,
  };
}

export function useSalesContractNewPage(scopeName: string, hitUseCount?: boolean) {
  type AllExtras = ReturnType<typeof useSalesContractNewPageExtra>;

  // Composables

  const $p = useNewPage<SalesContractVm, AllExtras>(scopeName, hitUseCount);

  // Private Executions

  if (!$p.extraInitialized.value) {
    Object.assign($p, useSalesContractNewPageExtra($p));

    $p.extraInitialized.value = true;
  }

  return $p;
}

export function useSalesContractViewPage(scopeName: string, hitUseCount?: boolean) {
  type AllExtras = ReturnType<typeof useSameCustomerSalesContracts> &
    ReturnType<typeof useProjects> &
    ReturnType<typeof useGeneralInvoices> &
    ReturnType<typeof useVatInvoicesEditor> &
    ReturnType<typeof useSalesContractViewPageExtra>;

  // Composables

  const $p = useViewPage<SalesContract, SalesContractVm, AllExtras>(scopeName, hitUseCount);

  // Private Executions

  if (!$p.extraInitialized.value) {
    Object.assign($p, useSameCustomerSalesContracts($p));
    Object.assign($p, useProjects($p));
    Object.assign($p, useGeneralInvoices($p));
    Object.assign($p, useVatInvoicesEditor($p));
    Object.assign($p, useSalesContractViewPageExtra($p));

    $p.extraInitialized.value = true;
  }

  return $p;
}

export default function useSalesContractEditPage(scopeName: string) {
  return useCustomizedEditPage<
    ReturnType<typeof useSalesContractNewPage>,
    ReturnType<typeof useSalesContractViewPage>
  >(scopeName);
}
