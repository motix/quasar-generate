<script lang="ts">
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue';

import { Dark, Dialog, QAjaxBar } from 'quasar';

import { where } from 'firebase/firestore';

import type {
  ProductionSalaryDetail,
  ProductionSalaryDetailVm,
  ProductType,
} from 'models/production/index.js';

import type { UpdateDocsActionPayload } from 'stores/firebase-firestore/index.js';
import { productionRolesStoreDefaultSort } from 'stores/production/ProductionRoles.js';
import { useProductionRoleSortableLitesStore } from 'stores/production/ProductionRoleSortableLites.js';
import { useProductionSalaryDetailsStore } from 'stores/production/ProductionSalaryDetails.js';

import useEditorDependencies from 'composables/crud-pages/useEditorDependencies.js';
import type {
  QTableColumn,
  QTablePagination,
} from 'composables/crud-pages/useListPage/useTableView.js';
import useFormats from 'composables/useFormats.js';
import useNotifications from 'composables/useNotifications.js';

import ProductionSalariesInputsTable from 'components/ProductType/ProductionSalariesInputsTable.vue';
import FloatToolbar from 'components/shared/FloatToolbar.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';
import TopTooltip from 'components/shared/TopTooltip.vue';

function usePageStatus() {
  // Data

  const ready = ref(false);
  const freezed = ref(false);
  const editMode = ref(false);
  const isDirty = ref(false);

  // Methods

  function dirty() {
    isDirty.value = true;
  }

  return {
    ready,
    freezed,
    editMode,
    isDirty,
    dirty,
  };
}

function usePageData(ready: ReturnType<typeof usePageStatus>['ready']) {
  // Composables

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  const productionRolesStore = useProductionRoleSortableLitesStore();
  const productionSalaryDetailsStore = useProductionSalaryDetailsStore();

  const { editorReady: dependenciesReady, editorDependenciesStores } =
    useEditorDependencies(undefined);

  // Data

  const models = ref<Required<ProductType<ProductionSalaryDetail>>[] | null>(null);
  const viewModels = ref<Required<ProductType<ProductionSalaryDetailVm>>[] | null>(null);

  // Computed

  const productionRoles = computed(() => productionRolesStore.docs);

  // Private Executions

  editorDependenciesStores.value = [
    {
      store: productionRolesStore,
      payload: {
        queryConstraints: [where('isActive', '==', true), ...productionRolesStoreDefaultSort],
      },
    },
    {
      store: productionSalaryDetailsStore,
      payload: {},
    },
  ];

  // Methods

  function reloadModels() {
    dependenciesReady.value = false;

    productionSalaryDetailsStore
      .loadAllDocs()
      .then(() => {
        dependenciesReady.value = true;
      })
      .catch((error) => {
        console.error(error);
        notifyLoadDataError();
        notifyErrorDebug(error);
        ready.value = true;
      });
  }

  function getModelsAndViewModels() {
    models.value = productionSalaryDetailsStore.productTypes.map((productType) => ({
      ...productType,
      productionSalaryDetails: productType.productionSalaryDetails.map((detail) =>
        Object.assign({}, detail),
      ),
    }));

    for (const productType of models.value) {
      const details: ProductionSalaryDetail[] = [];

      for (const productionRole of productionRolesStore.docs) {
        let detail = productType.productionSalaryDetails.find(
          (value) => value.productionRole.id === productionRole.id,
        );

        if (detail) {
          detail.productionRole = productionRole;
        } else {
          detail = {
            productionSalary: 0,
            productionRole: productionRole,
          };
        }

        details.push(detail);
      }

      productType.productionSalaryDetails = details;
    }

    viewModels.value = models.value.map((model) => ({
      ...model,
      productionSalaryDetails: model.productionSalaryDetails.map((detail) => ({
        productionSalary: detail.productionSalary || '',
        productionRole: detail.productionRole,
      })),
    }));
  }

  async function updateModels(
    payload: UpdateDocsActionPayload<Required<ProductType<ProductionSalaryDetailVm>>>,
  ) {
    return productionSalaryDetailsStore.updateProductTypes(payload);
  }

  // Watch

  watch(dependenciesReady, (value) => {
    if (value) {
      getModelsAndViewModels();
      ready.value = true;
    }
  });

  return {
    models,
    viewModels,
    productionRoles,
    reloadModels,
    getModelsAndViewModels,
    updateModels,
  };
}

function useTableView(productionRoles: ReturnType<typeof usePageData>['productionRoles']) {
  // Composables

  const f = useFormats();

  // Data

  const columns = ref<
    QTableColumn<
      | Required<ProductType<ProductionSalaryDetail>>
      | Required<ProductType<ProductionSalaryDetailVm>>
    >[]
  >([
    {
      name: 'name',
      label: 'Product Type',
      align: 'left',
      field: 'name',
      classes: 'text-no-wrap',
    },
  ]);

  const pagination = ref<QTablePagination>({ rowsPerPage: 0 });

  // Watch

  const stopWatch = watchEffect(
    () => {
      if (productionRoles.value.length > 0) {
        stopWatch();

        productionRoles.value.forEach((productionRole, index) => {
          columns.value.push({
            name: productionRole.id,
            label: productionRole.name,
            field: (row) => row.productionSalaryDetails[index]!.productionSalary,
            format: (val) => (val === 0 ? '_' : f.currency(val as number)),
          });
        });
      }
    },
    { flush: 'post' },
  );

  return {
    columns,
    pagination,
  };
}

function useEditor(
  ready: ReturnType<typeof usePageStatus>['ready'],
  freezed: ReturnType<typeof usePageStatus>['freezed'],
  editMode: ReturnType<typeof usePageStatus>['editMode'],
  isDirty: ReturnType<typeof usePageStatus>['isDirty'],
  viewModels: ReturnType<typeof usePageData>['viewModels'],
  reloadModels: ReturnType<typeof usePageData>['reloadModels'],
  getModelsAndViewModels: ReturnType<typeof usePageData>['getModelsAndViewModels'],
  updateModels: ReturnType<typeof usePageData>['updateModels'],
) {
  // Composables

  const { notifyErrorDebug, notifyValidationError, notifySaveDataSuccess, notifySaveDataError } =
    useNotifications();

  // Data

  const editorSaving = ref(false);

  const inputsTableRef =
    useTemplateRef<InstanceType<typeof ProductionSalariesInputsTable>>('inputsTable');

  // Methods

  function edit() {
    editMode.value = true;
  }

  function exitEditMode() {
    isDirty.value = false;
    editMode.value = false;
  }

  async function save() {
    viewModels.value === null &&
      (() => {
        throw new Error('viewModel not specified');
      })();
    inputsTableRef.value === null &&
      (() => {
        throw new Error('inputsTableRef not specified');
      })();

    freezed.value = true;
    editorSaving.value = true;

    const isValid = await inputsTableRef.value.validate();

    if (!isValid) {
      notifyValidationError();

      editorSaving.value = false;
      freezed.value = false;
      return;
    }

    const docs = viewModels.value.map((productType) => ({
      ...productType,
      productionSalaryDetails: productType.productionSalaryDetails.filter(
        (productionSalaryDetail) =>
          productionSalaryDetail.productionSalary !== '' &&
          productionSalaryDetail.productionSalary !== null,
      ),
    }));

    const payload: UpdateDocsActionPayload<Required<ProductType<ProductionSalaryDetailVm>>> = {
      docs,
      isViewModel: true,
    };

    try {
      await updateModels(payload);
    } catch (error) {
      console.error(error);
      notifySaveDataError();
      notifyErrorDebug(error);

      editorSaving.value = false;
      freezed.value = false;
      return;
    }

    notifySaveDataSuccess();

    editorSaving.value = false;
    freezed.value = false;

    ready.value = false;
    reloadModels();

    exitEditMode();
  }

  function revert() {
    if (isDirty.value) {
      Dialog.create({
        title: 'Revert',
        message: 'Are you sure want to discard all changes?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        exitEditMode();
        getModelsAndViewModels();
      });
    } else {
      exitEditMode();
    }
  }

  return {
    editorSaving,
    edit,
    exitEditMode,
    save,
    revert,
  };
}

function useToolbar(
  ready: ReturnType<typeof usePageStatus>['ready'],
  editMode: ReturnType<typeof usePageStatus>['editMode'],
) {
  // Data

  const saveTooltipRef = useTemplateRef<InstanceType<typeof TopTooltip>>('saveTooltip');

  // Computed

  const toolbarFabButtonsVisibility = computed(() => ({
    edit: ready.value && !editMode.value,
    revert: editMode.value,
    save: editMode.value,
  }));

  // Methods

  function hideSaveTooltip() {
    saveTooltipRef.value?.hide();
  }

  return {
    toolbarFabButtonsVisibility,
    hideSaveTooltip,
  };
}

function useFreezingBar(freezed: ReturnType<typeof usePageStatus>['freezed']) {
  // Data

  const freezingBar = ref<QAjaxBar | null>(null);

  // Watch

  watch(freezed, (value) => {
    if (value) {
      freezingBar.value?.start();
    } else {
      freezingBar.value?.stop();
    }
  });

  return {
    freezingBar,
  };
}
</script>

<script setup lang="ts">
// Composables

const { ready, freezed, editMode, isDirty, dirty } = usePageStatus();

const { models, viewModels, productionRoles, reloadModels, getModelsAndViewModels, updateModels } =
  usePageData(ready);

const { columns, pagination } = useTableView(productionRoles);

const { editorSaving, edit, save, revert } = useEditor(
  ready,
  freezed,
  editMode,
  isDirty,
  viewModels,
  reloadModels,
  getModelsAndViewModels,
  updateModels,
);

const { toolbarFabButtonsVisibility, hideSaveTooltip } = useToolbar(ready, editMode);

const { freezingBar } = useFreezingBar(freezed);
</script>

<template>
  <QPagePadding padding>
    <FadeTransition>
      <div v-if="!ready" key="loading" class="absolute-center">
        <!-- Loading -->
        <q-spinner-pie color="primary" size="6em" />
      </div>

      <div v-else-if="!models || models.length === 0 || !viewModels" key="empty">
        <!-- Empty -->
        <div>
          <slot name="top"></slot>
        </div>
        <div class="q-my-md text-center">There is no data in this list.</div>
      </div>

      <div v-else key="ready">
        <!-- Ready -->
        <StickyHeaders v-if="!editMode" dense target="#viewerTable" />

        <StickyHeaders v-else dense target="#editorTable" />

        <FadeTransition>
          <q-table
            v-if="!editMode"
            id="viewerTable"
            key="viewerTable"
            v-model:pagination="pagination"
            :columns="columns"
            dense
            hide-bottom
            :rows="models"
            wrap-cells
          />

          <ProductionSalariesInputsTable
            v-else
            id="editorTable"
            key="editorTable"
            ref="inputsTable"
            :columns="columns"
            :production-roles="productionRoles"
            :view-models="viewModels"
            @dirty="dirty"
          />
        </FadeTransition>

        <FloatToolbar :fab-buttons-visibility="toolbarFabButtonsVisibility">
          <template #fixed-buttons>
            <q-btn
              v-show="toolbarFabButtonsVisibility.edit"
              key="edit"
              :color="Dark.isActive ? 'grey-9' : 'grey-3'"
              :disable="freezed"
              icon="fal fa-edit"
              round
              text-color="primary"
              @click="edit"
            >
              <TopTooltip>Edit</TopTooltip>
            </q-btn>

            <q-btn
              v-show="toolbarFabButtonsVisibility.revert"
              key="revert"
              :color="isDirty ? 'warning' : Dark.isActive ? 'grey-9' : 'grey-3'"
              :disable="freezed"
              icon="fal fa-undo"
              round
              :text-color="isDirty ? 'white' : 'warning'"
              @click="revert"
            >
              <TopTooltip>Revert</TopTooltip>
            </q-btn>

            <q-btn
              v-show="toolbarFabButtonsVisibility.save"
              key="save"
              :color="Dark.isActive ? 'grey-9' : 'grey-3'"
              :disable="freezed || !isDirty"
              icon="fal fa-save"
              :loading="editorSaving"
              round
              text-color="primary"
              @click="
                hideSaveTooltip();
                save();
              "
            >
              <TopTooltip ref="saveTooltip"> Save</TopTooltip>
            </q-btn>
          </template>
        </FloatToolbar>
      </div>
    </FadeTransition>

    <q-ajax-bar ref="freezingBar" color="warning" position="bottom" size="3px" />
  </QPagePadding>
</template>
