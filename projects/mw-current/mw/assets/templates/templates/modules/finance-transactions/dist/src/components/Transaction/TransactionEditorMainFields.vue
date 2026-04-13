<script setup lang="ts">
import { markRaw } from 'vue';

import { object } from 'yup';

import {
  asIsOptional,
  asIsRequired,
  dateRequired,
  predefinedStringRequired,
  stringRequired,
} from 'utils/validation.js';

import type { FinanceAccountLite, TransactionType } from 'models/finance/index.js';
import { transactionTypes } from 'models/finance/index.js';

import useTransactionEditPage from 'composables/finance/transaction/useTransactionEditPage.js';

// Private

const validationSchema = markRaw(
  object({
    issueDate: dateRequired('Issue Date'),
    type: predefinedStringRequired<TransactionType>('Type', ...transactionTypes),
    content: stringRequired('Content'),
    sourceFinanceAccount: asIsOptional<FinanceAccountLite>('Source Account').when({
      is: () => $p.vmc.transactionHasSourceAccount($p.vm.value),
      then: () => asIsRequired<FinanceAccountLite>('Source Account'),
    }),
    destinationFinanceAccount: asIsOptional<FinanceAccountLite>('Destination Account').when({
      is: () => $p.vmc.transactionHasDestinationAccount($p.vm.value),
      then: () => asIsRequired<FinanceAccountLite>('Destination Account'),
    }),
  }),
);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useTransactionEditPage(props.scopeName);
const {
  // Auto sort
  dirty,
  filterFinanceAccountOptions,
  financeAccountOptions,
  transactionTypeOptions,
  vm,
  vmc,
} = $p;

// Private Executions

const { validate } = $p.useValidationForm(
  validationSchema,
  $p.vm.value,
  'issueDate',
  'type',
  'content',
  'sourceFinanceAccount',
  'destinationFinanceAccount',
);

// Expose

defineExpose({
  validate: async () => (await validate()).valid,
});
</script>

<template>
  <QDateInputVal
    v-model="vm.issueDate"
    class="col-6"
    label="Issue Date"
    name="issueDate"
    @update:model-value="dirty"
  />

  <QSelectVal
    v-model="vm.type"
    class="col-6"
    label="Type"
    name="type"
    :options="transactionTypeOptions"
    @update:model-value="dirty"
  />

  <QSelectVal
    v-model="vm.sourceFinanceAccount"
    class="col-6"
    :disable="!vmc.transactionHasSourceAccount(vm)"
    fill-input
    hide-selected
    label="Source Account"
    name="sourceFinanceAccount"
    option-label="name"
    option-value="id"
    :options="financeAccountOptions"
    use-input
    @filter="filterFinanceAccountOptions"
    @update:model-value="dirty"
  />

  <QSelectVal
    v-model="vm.destinationFinanceAccount"
    class="col-6"
    :disable="!vmc.transactionHasDestinationAccount(vm)"
    fill-input
    hide-selected
    label="Destination Account"
    name="destinationFinanceAccount"
    option-label="name"
    option-value="id"
    :options="financeAccountOptions"
    use-input
    @filter="filterFinanceAccountOptions"
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
