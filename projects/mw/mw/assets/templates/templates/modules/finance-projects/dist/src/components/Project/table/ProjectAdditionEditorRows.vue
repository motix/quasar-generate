<script setup lang="ts">
import useProjectAdditionEditor from 'composables/finance/project/useProjectAdditionEditor.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useProjectAdditionEditor(props);
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
    <!-- Togglers -->
    <!-- Title / Description -->
    <!-- Product Type -->
    <td class="text-right" colspan="4">
      <strong>Discount</strong>
    </td>

    <!-- Production Salary Amount -->
    <!-- Quantity -->
    <!-- Unit Price -->
    <td colspan="3"></td>

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
    <!-- Togglers -->
    <!-- Title / Description -->
    <!-- Product Type -->
    <td class="text-right" colspan="4">
      <strong>After Discount</strong>
    </td>

    <!-- Production Salary Amount -->
    <!-- Quantity -->
    <!-- Unit Price -->
    <td colspan="3"></td>

    <!-- Amount -->
    <td class="vertical-top">
      <TextField dense field-class="text-right">
        <strong>
          {{ f.currency(vmc.projectVatExcludedTotal(vm)) }}
        </strong>
      </TextField>
    </td>

    <!-- Buttons -->
    <td></td>
  </tr>

  <!-- VAT -->
  <tr>
    <!-- Number -->
    <!-- Togglers -->
    <!-- Title / Description -->
    <!-- Product Type -->
    <td class="text-right" colspan="4">
      <strong>VAT</strong>
    </td>

    <!-- Production Salary Amount -->
    <td></td>

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
    </td>

    <!-- Amount -->
    <td class="vertical-top">
      <TextField v-if="f.isNumber(vm.vatPercent)" dense field-class="text-right">
        {{ f.currency(vmc.projectVat(vm)) }}
      </TextField>
    </td>

    <!-- Buttons -->
    <td></td>
  </tr>
</template>
