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
  vmc,
} = $p;
</script>

<template>
  <!-- Discount -->
  <tr>
    <!-- Number -->
    <!-- Content -->
    <td class="text-right" colspan="2">
      <strong>Discount</strong>
    </td>

    <!-- Quantity -->
    <!-- Unit Price -->
    <td colspan="2"></td>

    <!-- Amount -->
    <td class="vertical-top">
      <ThousandInputVal
        v-model="vm.discount"
        clearable
        dense
        hide-bottom-space
        :hint="`${f.currency(vm.discount) || ''} (optional)`"
        input-class="text-right"
        name="discount"
        placeholder="Discount"
        prefix="("
        suffix=")"
        @update:model-value="dirty"
      />
    </td>

    <!-- Buttons -->
    <td></td>
  </tr>

  <!-- After Discount -->
  <tr>
    <!-- Number -->
    <!-- Content -->
    <td class="text-right" colspan="2">
      <strong>After Discount</strong>
    </td>

    <!-- Quantity -->
    <!-- Unit Price -->
    <td colspan="2"></td>

    <!-- Amount -->
    <td class="vertical-top">
      <TextField dense field-class="text-right">
        <strong>
          {{ f.currency(vmc.expenseVatExcludedTotal(vm)) }}
        </strong>
      </TextField>
    </td>

    <!-- Buttons -->
    <td></td>
  </tr>

  <!-- VAT -->
  <tr>
    <!-- Number -->
    <!-- Content -->
    <td class="text-right" colspan="2">
      <strong>VAT</strong>
    </td>

    <!-- Quantity -->
    <td class="vertical-top">
      <PercentInputVal
        v-model="vm.vatPercent"
        clearable
        dense
        hide-bottom-space
        hint="(optional)"
        input-class="text-right"
        name="vatPercent"
        placeholder="VAT Rate"
        @update:model-value="dirty"
      />

      <PercentInputVal
        v-model="vm.secondVatPercent"
        clearable
        dense
        :disable="!f.isNumber(vm.vatPercent)"
        hide-bottom-space
        hint="(optional)"
        :input-class="{
          'text-right': true,
          'text-strike':
            !f.isNumber(vm.vatPercent) &&
            vm.secondVatPercent !== '' &&
            vm.secondVatPercent !== null,
        }"
        name="secondVatPercent"
        placeholder="Second VAT Rate"
        @update:model-value="dirty"
      />
    </td>

    <!-- Unit Price -->
    <td class="vertical-top">
      <ThousandInputVal
        v-model="vm.vatableAmount"
        clearable
        dense
        :disable="!f.isNumber(vm.vatPercent)"
        hide-bottom-space
        :hint="`${f.currency(vm.vatableAmount) || ''} (optional)`"
        :input-class="{
          'text-right': true,
          'text-strike':
            !f.isNumber(vm.vatPercent) && vm.vatableAmount !== '' && vm.vatableAmount !== null,
        }"
        name="vatableAmount"
        placeholder="VAT-able Amount"
        @update:model-value="dirty"
      />

      <ThousandInputVal
        v-model="vm.secondVatableAmount"
        clearable
        dense
        :disable="!f.isNumber(vm.vatPercent)"
        hide-bottom-space
        :hint="`${f.currency(vm.secondVatableAmount) || ''} (optional)`"
        :input-class="{
          'text-right': true,
          'text-strike':
            !f.isNumber(vm.vatPercent) &&
            vm.secondVatableAmount !== '' &&
            vm.secondVatableAmount !== null,
        }"
        name="secondVatableAmount"
        placeholder="Second VAT-able Amount"
        @update:model-value="dirty"
      />
    </td>

    <!-- Amount -->
    <td class="vertical-top">
      <QInputVal
        v-model.number="vm.vatAdjustment"
        clearable
        dense
        :disable="!f.isNumber(vm.vatPercent)"
        hide-bottom-space
        :hint="`${
          f.isNumber(vm.vatAdjustment) && vm.vatAdjustment > 0 ? '+' : ''
        }${f.currency(vm.vatAdjustment) || ''} (optional)`"
        :input-class="{
          'text-right': true,
          'text-strike':
            !f.isNumber(vm.vatPercent) && vm.vatAdjustment !== '' && vm.vatAdjustment !== null,
        }"
        name="vatAdjustment"
        placeholder="VAT Adjustment"
        @update:model-value="dirty"
      />

      <TextField v-if="f.isNumber(vm.vatPercent)" dense field-class="text-right">
        {{ f.currency(vmc.expenseVat(vm)) }}
      </TextField>
    </td>

    <!-- Buttons -->
    <td></td>
  </tr>
</template>
