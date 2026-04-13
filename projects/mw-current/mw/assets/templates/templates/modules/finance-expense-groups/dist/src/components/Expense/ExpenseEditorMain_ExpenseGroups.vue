<script setup lang="ts">
import { markRaw } from 'vue';

import { object } from 'yup';

import { asIsOptional, asIsRequired, dateRequired, stringRequired } from 'utils/validation.js';

import type { ExpenseGroupLite, SupplierLite } from 'models/finance/index.js';

import useExpenseEditPage_ExpenseGroups from 'composables/finance/expense/useExpenseEditPage_ExpenseGroups.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

// Private

const validationSchema = markRaw(
  object({
    issueDate: dateRequired('Issue Date'),
    content: stringRequired('Content'),
    supplier: asIsRequired<SupplierLite>('Supplier'),
    group: asIsOptional<ExpenseGroupLite>('Group'),
  }),
);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { hasRole } = useFirebaseAuth();

const $p = useExpenseEditPage_ExpenseGroups(props.scopeName);
const {
  // Auto sort
  dirty,
  editorReady,
  expenseGroupOptions,
  f,
  filterExpenseGroupOptions,
  filterSupplierOptions,
  supplierOptions,
  vm,
} = $p;

// Private Executions

const { validate } = $p.useValidationForm(
  validationSchema,
  vm.value,
  'issueDate',
  'content',
  'supplier',
  'group',
);

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
      <q-slide-transition>
        <div v-if="vm.group">
          <ObjectLink
            color="white"
            icon-right="fal fa-layer-group"
            :label="vm.group.name"
            size="sm"
            :to="`/expense-groups/${vm.group.id}`"
          />
        </div>
      </q-slide-transition>

      <div class="q-mt-md">
        <StatusBadge revert-color :status="vm.statusHelper" />
      </div>
    </template>

    <template #side>
      <q-toggle
        v-model="vm.isArchived"
        checked-icon="fal fa-box-taped"
        class="right-toggle"
        color="white"
        :disable="!hasRole('manager')"
        icon-color="primary"
        label="Archived"
        left-label
        unchecked-icon="fal fa-box-open"
        @update:model-value="dirty"
      >
      </q-toggle>
    </template>

    <template #bezel-less-top>
      <q-card-section class="q-col-gutter-sm row">
        <div class="col-6">
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
      <QDateInputVal
        v-model="vm.issueDate"
        class="col-6"
        label="Issue Date"
        name="issueDate"
        @update:model-value="dirty"
      />

      <QSelectVal
        v-model="vm.group"
        class="col-6"
        clearable
        fill-input
        hide-selected
        label="Group"
        name="group"
        option-label="name"
        option-value="id"
        :options="expenseGroupOptions"
        use-input
        @filter="filterExpenseGroupOptions"
        @update:model-value="dirty"
      />

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

      <q-toggle
        v-model="vm.isCapitalWithdrawal"
        checked-icon="fal fa-check"
        class="col-6"
        color="primary"
        label="Capital Withdrawal"
        unchecked-icon="clear"
        @update:model-value="dirty"
      />

      <q-toggle
        v-model="vm.isExternal"
        checked-icon="fal fa-check"
        class="col-6"
        color="primary"
        label="External"
        unchecked-icon="clear"
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
