<script setup lang="ts">
import useExpenseAdditionEditor from 'composables/finance/expense/useExpenseAdditionEditor.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useExpenseAdditionEditor(props);
const {
  // Auto sort
  dirty,
  f,
  vm,
} = $p;
</script>

<template>
  <q-card-section class="q-col-gutter-md row">
    <ThousandInputVal
      v-model="vm.discount"
      class="col-6"
      clearable
      dense
      hide-bottom-space
      :hint="`${f.currency(vm.discount) || ''} (optional)`"
      input-class="text-right"
      label="Discount"
      name="discount"
      prefix="("
      suffix=")"
      @update:model-value="dirty"
    />

    <div class="flex-break q-pt-none"></div>

    <PercentInputVal
      v-model="vm.vatPercent"
      class="col-6"
      clearable
      dense
      hide-bottom-space
      hint="(optional)"
      input-class="text-right"
      label="VAT Rate"
      name="vatPercent"
      @update:model-value="dirty"
    />

    <ThousandInputVal
      v-model="vm.vatableAmount"
      class="col-6"
      clearable
      dense
      :disable="!f.isNumber(vm.vatPercent)"
      hide-bottom-space
      :hint="`${f.currency(vm.vatableAmount) || ''} (optional)`"
      :input-class="{
        'text-right': true,
        'text-strike': !f.isNumber(vm.vatPercent),
      }"
      label="VAT-able Amount"
      name="vatableAmount"
      @update:model-value="dirty"
    />

    <PercentInputVal
      v-model="vm.secondVatPercent"
      class="col-6"
      clearable
      dense
      :disable="!f.isNumber(vm.vatPercent)"
      hide-bottom-space
      hint="(optional)"
      :input-class="{
        'text-right': true,
        'text-strike': !f.isNumber(vm.vatPercent),
      }"
      label="Second VAT Rate"
      name="secondVatPercent"
      @update:model-value="dirty"
    />

    <ThousandInputVal
      v-model="vm.secondVatableAmount"
      class="col-6"
      clearable
      dense
      :disable="!f.isNumber(vm.vatPercent)"
      hide-bottom-space
      :hint="`${f.currency(vm.secondVatableAmount) || ''} (optional)`"
      :input-class="{
        'text-right': true,
        'text-strike': !f.isNumber(vm.vatPercent),
      }"
      label="Second VAT-able Amount"
      name="secondVatableAmount"
      @update:model-value="dirty"
    />

    <QInputVal
      v-model.number="vm.vatAdjustment"
      class="col-6"
      clearable
      dense
      :disable="!f.isNumber(vm.vatPercent)"
      hide-bottom-space
      :hint="`${
        f.isNumber(vm.vatAdjustment) && vm.vatAdjustment > 0 ? '+' : ''
      }${f.currency(vm.vatAdjustment) || ''} (optional)`"
      :input-class="{
        'text-right': true,
        'text-strike': !f.isNumber(vm.vatPercent),
      }"
      label="VAT Adjustment"
      name="vatAdjustment"
      @update:model-value="dirty"
    />
  </q-card-section>
</template>
