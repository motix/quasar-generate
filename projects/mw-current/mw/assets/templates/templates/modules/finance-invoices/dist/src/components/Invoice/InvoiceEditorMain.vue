<script setup lang="ts">
import { markRaw } from 'vue';

import { object } from 'yup';

import { asIsRequired, dateRequired, stringRequired } from 'utils/validation.js';

import type { CustomerLite } from 'models/finance/index.js';

import useInvoiceEditPage from 'composables/finance/invoice/useInvoiceEditPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

// Private

const validationSchema = markRaw(
  object({
    issueDate: dateRequired('Issue Date'),
    content: stringRequired('Content'),
    customer: asIsRequired<CustomerLite>('Customer'),
  }),
);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { hasRole } = useFirebaseAuth();

const $p = useInvoiceEditPage(props.scopeName);
const {
  // Auto sort
  customerOptions,
  dirty,
  editorReady,
  f,
  filterCustomerOptions,
  vm,
} = $p;

// Private Executions

const { validate } = $p.useValidationForm(
  validationSchema,
  vm.value,
  'issueDate',
  'content',
  'customer',
);

// Expose

defineExpose({
  validate: async () => (await validate()).valid,
});
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-file-invoice-dollar"
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
        <div class="col-12">
          <ObjectLink
            v-if="vm.customer"
            color="primary"
            icon="fal fa-user-crown"
            :label="vm.customer.name + (vm.customerExtraInfo ? ` (${vm.customerExtraInfo})` : '')"
            :to="`/customers/${vm.customer.code}`"
          />
          <template v-else>[Customer]</template>
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

      <div class="flex-break q-pt-none"></div>

      <QSelectVal
        v-model="vm.customer"
        class="col-6"
        fill-input
        hide-selected
        label="Customer"
        name="customer"
        option-label="name"
        option-value="id"
        :options="customerOptions"
        use-input
        @filter="filterCustomerOptions"
        @update:model-value="dirty"
      />

      <q-input
        v-model="vm.customerExtraInfo"
        class="col-6"
        clearable
        hint="(optional)"
        label="Customer Extra Info"
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
        v-model="vm.isRequired"
        checked-icon="fal fa-check"
        class="col-6"
        color="primary"
        label="Required"
        unchecked-icon="clear"
        @update:model-value="dirty"
      />

      <q-input
        v-model="vm.referenceNumber"
        class="col-6"
        clearable
        hint="(optional)"
        label="Reference Number"
        @update:model-value="dirty"
      />

      <q-toggle
        v-model="vm.isCapitalContribution"
        checked-icon="fal fa-check"
        class="col-6"
        color="primary"
        label="Capital Contribution"
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
