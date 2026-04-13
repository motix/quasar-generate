<script setup lang="ts">
import { computed, onUnmounted, ref, watchEffect } from 'vue';

import { Dark } from 'quasar';

import type { Payroll, PayrollVm } from 'models/hr/index.js';

import { usePayrollsStore } from 'stores/hr/Payrolls.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useExportPayrollToExcel from 'composables/hr/payroll/useExportPayrollToExcel';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import useMultiViews from 'composables/useMultiViews.js';

import PayrollEditor from 'components/Payroll/PayrollEditor.vue';
import PayrollViewer from 'components/Payroll/PayrollViewer.vue';

// Constants

const SCOPE_NAME = 'payrolls-view-page';

// Private

const hasDetails = computed(
  () =>
    (($p.editMode.value ? $p.viewModel.value?.details.length : $p.model.value?.details.length) ||
      0) > 0,
);

// Composables

const store = usePayrollsStore();

const { hasRole, roles } = useFirebaseAuth();

const { isCardsView } = useMultiViews();

const { exportPayrollToExcel } = useExportPayrollToExcel();

const $p = useViewPage<Payroll, PayrollVm>(SCOPE_NAME, true);
const {
  // Auto sort
  m,
} = $p;

// Data

const hideExtraInfo = ref(false);

// Computed

const showToggleExtraInfoButton = computed(
  () =>
    $p.ready.value &&
    !$p.editMode.value &&
    isCardsView.value &&
    ($p.viewModel.value?.details.length || 0) > 0,
);

const showPrintButton = computed(() => $p.ready.value && !$p.editMode.value);

const showExportToExcelButton = computed(() => $p.ready.value && !$p.editMode.value);

// Private Executions

// useReturnUrl
$p.backUrl.value = '../payrolls';

// usePageData
$p.modelFindKeyField.value = 'code';
$p.modelGetter.value = (docKey) => {
  const model = store.doc(docKey);
  model.statusHelper.setUserRoles(roles.value);
  return model;
};
$p.viewModelGetter.value = (docKey) => store.docVm(docKey);
$p.updateModel.value = (payload) => store.updateDoc(payload);
$p.deleteModel.value = (payload) => store.deleteDoc(payload);

// usePageTitle
$p.modelNameField.value = 'code';

// usePageData - loadModel
void $p
  .loadModel((payload) => store.loadRealtimeDoc(payload))
  .then(() => {
    $p.ready.value = true;
  });

// Lifecycle Hooks

onUnmounted(() => {
  $p.releaseModel.value && $p.releaseModel.value();
});

// Watch

watchEffect(() => {
  $p.hasDeleting.value =
    hasRole('manager') && !!$p.model.value && $p.m.value.statusHelper.statusName === 'cancelled';

  $p.hasMultiViews.value = hasDetails.value;
});
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <PayrollViewer :hide-extra-info="hideExtraInfo" :scope-name="SCOPE_NAME" />
      </template>
      <template #editor>
        <PayrollEditor :scope-name="SCOPE_NAME" />
      </template>

      <template #toolbar-extra>
        <q-btn
          v-show="showToggleExtraInfoButton"
          key="toggleExtraInfo"
          :color="Dark.isActive ? 'grey-9' : 'grey-3'"
          round
          text-color="primary"
          @click="hideExtraInfo = !hideExtraInfo"
        >
          <q-icon class="fa-stack" style="font-size: 0.875em">
            <i class="fal fa-list-alt fa-stack-2x" :class="{ 'text-grey': hideExtraInfo }"></i>
            <i v-if="!hideExtraInfo" class="fal fa-slash fa-stack-2x"></i>
          </q-icon>

          <TopTooltip>
            {{ hideExtraInfo ? 'Show Extra Info' : 'Hide Extra Info' }}
          </TopTooltip>
        </q-btn>

        <q-btn
          v-show="showPrintButton"
          key="print"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          icon="fal fa-print"
          outline
          padding="sm"
          target="_blank"
          text-color="primary"
          :to="`/payrolls/${m.code.replaceAll('.', '_')}/print-payroll`"
        >
          <TopTooltip>Print</TopTooltip>
        </q-btn>

        <q-btn
          v-show="showExportToExcelButton"
          key="exportToExcel"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          icon="fal fa-file-excel"
          outline
          padding="sm"
          text-color="primary"
          @click="() => void exportPayrollToExcel(m)"
        >
          <TopTooltip>Export to Excel</TopTooltip>
        </q-btn>
      </template>
    </ViewPage>
  </QPagePadding>
</template>
