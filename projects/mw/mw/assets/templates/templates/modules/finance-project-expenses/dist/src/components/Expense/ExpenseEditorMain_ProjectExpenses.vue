<script setup lang="ts">
import { markRaw } from 'vue';

import { object } from 'yup';

import { asIsRequired, stringRequired } from 'utils/validation.js';

import type { Project, ProjectVm, SupplierLite } from 'models/finance/index.js';

import useExpenseEditPage from 'composables/finance/expense/useExpenseEditPage.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Private

const validationSchema = markRaw(
  object({
    content: stringRequired('Content'),
    supplier: asIsRequired<SupplierLite>('Supplier'),
  }),
);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useExpenseEditPage<true, Project, ProjectVm>(props.scopeName);
const {
  // Auto sort
  dirty,
  editorReady,
  f,
  filterSupplierOptions,
  pvm,
  supplierOptions,
  vm,
} = $p;

// Private Executions

const { validate } = $p.useValidationForm(validationSchema, vm.value, 'content', 'supplier');

// Expose

defineExpose({
  validate: async () => (await validate()).valid,
});
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-receipt"
    avatar-top
    body-cell-gutter
    :body-loading="!editorReady"
    :caption="f.dateViewModel(vm.createDate) || undefined"
    caption-tooltip="Create Date"
    class="q-mx-auto"
    :expandable="!$p.isNewPage($p)"
    header-background-color="primary"
    header-dark
    side-top
    :subtitle="f.dateViewModel(vm.issueDate, '[Issue Date]') || undefined"
    subtitle-tooltip="Issue Date"
    :title="$p.isNewPage($p) ? '[Auto-generated Code]' : vm.code"
    title-top
  >
    <template #main>
      <StatusBadge class="q-mt-md" revert-color :status="vm.statusHelper" />
    </template>

    <template #bezel-less-top>
      <q-card-section class="q-col-gutter-sm row">
        <div class="col-12">
          <ObjectLink color="primary" :label="pvm.name" :to="`/projects/${pvm.urlFriendlyName}`">
            <template #icon>
              <StatusIcon class="q-mr-sm" icon="fal fa-briefcase" :status="pvm.statusHelper" />
            </template>
          </ObjectLink>
        </div>

        <div class="col-12">
          <ObjectLink
            v-if="vm.supplier"
            color="primary"
            icon="fal fa-building"
            :label="vm.supplier.name + (vm.supplierExtraInfo ? ` (${vm.supplierExtraInfo})` : '')"
            :to="`/suppliers/${vm.supplier.code}`"
          />
          <template v-else>[Supplier]</template>
        </div>
      </q-card-section>

      <q-separator />
    </template>

    <template #body>
      <QSelectVal
        v-model="vm.supplier"
        class="col-6"
        fill-input
        hide-selected
        label="Supplier"
        name="supplier"
        option-label="name"
        option-value="id"
        :options="supplierOptions"
        use-input
        @filter="filterSupplierOptions"
        @update:model-value="dirty"
      />

      <q-input
        v-model="vm.supplierExtraInfo"
        class="col-6"
        clearable
        hint="(optional)"
        label="Supplier Extra Info"
        @update:model-value="dirty"
      />

      <QInputVal
        v-model="vm.content"
        autogrow
        class="col-12"
        label="Content"
        name="content"
        @update:model-value="dirty"
      />

      <div class="flex-break">
        <q-separator class="outset" />
      </div>

      <q-input
        v-model="vm.notes"
        autogrow
        class="col-12"
        clearable
        hint="Start with '!' for attention - (optional)"
        label="Notes"
        @update:model-value="dirty"
      />
    </template>
  </ExpandableCard>
</template>
