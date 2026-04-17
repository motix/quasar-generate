<script setup lang="ts">
import useInvoiceAdditionEditor from 'composables/finance/invoice/useInvoiceAdditionEditor.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useInvoiceAdditionEditor(props);
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
      <TextField v-if="$p.hasParent($p)" dense field-class="text-right" prefix="(" suffix=")">
        {{ f.currency(vm.discount) }}
      </TextField>

      <ThousandInputVal
        v-else
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
    <td v-if="!$p.hasParent($p)"></td>
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
          {{ f.currency(vmc.invoiceAfterDiscountSubtotal(vm)) }}
        </strong>
      </TextField>
    </td>

    <!-- Buttons -->
    <td v-if="!$p.hasParent($p)"></td>
  </tr>

  <!-- Contract Subtotal -->
  <tr>
    <!-- Number -->
    <!-- Content -->
    <td class="text-right" colspan="2">
      <strong>Contract Subtotal</strong>
    </td>

    <!-- Quantity -->
    <!-- Unit Price -->
    <td colspan="2"></td>

    <!-- Amount -->
    <td class="vertical-top">
      <ThousandInputVal
        v-model="vm.contractSubtotal"
        clearable
        dense
        hide-bottom-space
        :hint="`${f.currency(vm.contractSubtotal) || ''} (optional)`"
        input-class="text-right"
        name="contractSubtotal"
        placeholder="Contract Subtotal"
        @update:model-value="dirty"
      />
    </td>

    <!-- Buttons -->
    <td v-if="!$p.hasParent($p)"></td>
  </tr>

  <!-- VAT -->
  <tr v-if="!$p.hasParent($p) || f.isNumber(vm.vatPercent)">
    <!-- Number -->
    <!-- Content -->
    <td class="text-right" colspan="2">
      <strong>VAT</strong>
    </td>

    <!-- Quantity -->
    <td class="vertical-top">
      <!-- Put an empty hint to preserve the space and match Amount column layout -->
      <TextField v-if="$p.hasParent($p)" dense field-class="text-right" hint=" ">
        {{ f.percent(vm.vatPercent) }}
      </TextField>

      <PercentInputVal
        v-else
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
      <!-- Put an empty hint to preserve the space and match Amount column layout -->
      <TextField v-if="$p.hasParent($p)" dense field-class="text-right" hint=" ">
        {{ f.currency(vm.vatableAmount) }}
      </TextField>

      <ThousandInputVal
        v-else
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
        {{ f.currency(vmc.invoiceVat(vm)) }}
      </TextField>
    </td>

    <!-- Buttons -->
    <td v-if="!$p.hasParent($p)"></td>
  </tr>

  <!-- Relocated Subtotal -->
  <tr>
    <!-- Number -->
    <!-- Content -->
    <td class="text-right" colspan="2">
      <strong>Relocated Subtotal</strong>
    </td>

    <!-- Quantity -->
    <!-- Unit Price -->
    <td colspan="2"></td>

    <!-- Amount -->
    <td class="vertical-top">
      <ThousandInputVal
        v-model="vm.relocatedSubtotal"
        clearable
        dense
        hide-bottom-space
        :hint="`${f.currency(vm.relocatedSubtotal) || ''} (optional)`"
        input-class="text-right"
        name="relocatedSubtotal"
        placeholder="Relocated Subtotal"
        prefix="("
        suffix=")"
        @update:model-value="dirty"
      />
    </td>

    <!-- Buttons -->
    <td v-if="!$p.hasParent($p)"></td>
  </tr>

  <!-- Relocated VAT -->
  <tr v-if="!$p.hasParent($p) || f.isNumber(vm.vatPercent)">
    <!-- Number -->
    <!-- Content -->
    <td class="text-right" colspan="2">
      <strong>Relocated VAT</strong>
    </td>

    <!-- Quantity -->
    <!-- Unit Price -->
    <td colspan="2"></td>

    <!-- Amount -->
    <td class="vertical-top">
      <ThousandInputVal
        v-model="vm.relocatedVat"
        clearable
        dense
        hide-bottom-space
        :hint="`${f.currency(vm.relocatedVat) || ''} (optional)`"
        input-class="text-right"
        name="relocatedVat"
        placeholder="Relocated VAT"
        prefix="("
        suffix=")"
        @update:model-value="dirty"
      />
    </td>

    <!-- Buttons -->
    <td v-if="!$p.hasParent($p)"></td>
  </tr>
</template>
