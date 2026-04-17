<script setup lang="ts">
import { markRaw } from 'vue';

import { object } from 'yup';

import { asIsOptional } from 'utils/validation.js';

import type { InvoiceGroupLite } from 'models/finance/index.js';

import { useInvoiceViewPage_ProjectInvoiceGroups } from 'composables/finance/invoice/useInvoiceEditPage_ProjectInvoiceGroups.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Private

const validationSchema = markRaw(
  object({
    group: asIsOptional<InvoiceGroupLite>('Group'),
  }),
);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useInvoiceViewPage_ProjectInvoiceGroups(props.scopeName);
const {
  // Auto sort
  dirty,
  editorReady,
  f,
  filterInvoiceGroupOptions,
  invoiceGroupOptions,
  pvm,
  quotation,
  vm,
} = $p;

// Private Executions

const { validate } = $p.useValidationForm(validationSchema, vm.value, 'group');

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
    expandable
    header-background-color="primary"
    header-dark
    side-top
    :subtitle="f.dateViewModel(vm.issueDate, '[Issue Date]') || undefined"
    subtitle-tooltip="Issue Date"
    :title="vm.code"
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
            :to="`/invoice-groups/${vm.group.id}`"
          />
        </div>
      </q-slide-transition>

      <div class="q-mt-md">
        <StatusBadge revert-color :status="vm.statusHelper" />
      </div>
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

        <div class="col-6">
          <ObjectLink
            color="primary"
            icon="fal fa-user-crown"
            :label="pvm.customer.name"
            :to="`/customers/${pvm.customer.code}`"
          />
        </div>

        <div class="col-6 text-right">
          <ObjectLink
            v-if="!!quotation"
            color="primary"
            :label="quotation.code"
            :to="`/quotations/${pvm.urlFriendlyName}/${quotation.code.replaceAll('.', '_')}`"
          >
            <template #icon>
              <StatusIcon
                class="q-mr-sm"
                icon="fal fa-file-invoice"
                :status="quotation.statusHelper"
              />
            </template>
          </ObjectLink>
        </div>
      </q-card-section>

      <q-separator />
    </template>

    <template #body>
      <QSelectVal
        v-model="vm.group"
        class="col-6 offset-6"
        clearable
        fill-input
        hide-selected
        label="Group"
        name="group"
        option-label="name"
        option-value="id"
        :options="invoiceGroupOptions"
        use-input
        @filter="filterInvoiceGroupOptions"
        @update:model-value="dirty"
      />

      <q-toggle
        v-model="vm.isRequired"
        checked-icon="fal fa-check"
        class="col-6"
        color="primary"
        disable
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
