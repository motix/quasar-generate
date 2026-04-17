<script setup lang="ts">
import useVatInvoiceEditor from 'composables/finance/sales-contract/useVatInvoiceEditor.js';

// Props

const props = defineProps<{
  scopeName: string;
  vatInvoiceIndex: number;
}>();

// Composables

const $p = useVatInvoiceEditor(props);
const {
  // Auto sort
  dirty,
  f,
  insertVatInvoice,
  removeVatInvoice,
  vatInvoice,
  vmc,
} = $p;

// Expose

defineExpose({
  validate: $p.validateVatInvoiceEditor,
});
</script>

<template>
  <tr>
    <!-- Number -->
    <td class="vertical-top">
      <TextField class="text-right" dense>
        {{ vatInvoiceIndex + 1 }}
      </TextField>
    </td>

    <!-- Code -->
    <td class="vertical-top">
      <QInputVal
        v-model="vatInvoice.code"
        dense
        hide-bottom-space
        name="code"
        placeholder="Code"
        @update:model-value="dirty"
      />
    </td>

    <!-- Issue Date -->
    <td class="vertical-top">
      <QDateInputVal
        v-model="vatInvoice.issueDate"
        dense
        hide-bottom-space
        name="issueDate"
        placeholder="Issue Date"
        @update:model-value="dirty"
      />
    </td>

    <!-- Cancelled -->
    <td class="vertical-top text-center">
      <q-toggle
        v-model="vatInvoice.isCancelled"
        checked-icon="fal fa-check"
        color="primary"
        unchecked-icon="clear"
        @update:model-value="dirty"
      />
    </td>

    <!-- Content -->
    <td class="vertical-top">
      <QInputVal
        v-model="vatInvoice.content"
        autogrow
        dense
        hide-bottom-space
        name="content"
        placeholder="Content"
        @update:model-value="dirty"
      />
    </td>

    <!-- Subtotal -->
    <td class="vertical-top">
      <ThousandInputVal
        v-model="vatInvoice.subTotal"
        dense
        hide-bottom-space
        :hint="f.currency(vatInvoice.subTotal) || undefined"
        input-class="text-right"
        name="subTotal"
        placeholder="Subtotal"
        @update:model-value="dirty"
      />
    </td>

    <!-- VAT -->
    <td class="vertical-top">
      <PercentInputVal
        v-model="vatInvoice.vatPercent"
        clearable
        dense
        hide-bottom-space
        :hint="`${f.currency(vmc.vatInvoiceVat(vatInvoice)) || ''} (optional)`"
        input-class="text-right"
        name="vatPercent"
        placeholder="VAT Rate"
        @update:model-value="dirty"
      />

      <QInputVal
        v-model.number="vatInvoice.vatAdjustment"
        clearable
        dense
        :disable="!f.isNumber(vatInvoice.vatPercent)"
        hide-bottom-space
        :hint="`${
          f.isNumber(vatInvoice.vatAdjustment) && vatInvoice.vatAdjustment > 0 ? '+' : ''
        }${f.currency(vatInvoice.vatAdjustment) || ''} (optional)`"
        :input-class="{
          'text-right': true,
          'text-strike':
            !f.isNumber(vatInvoice.vatPercent) &&
            vatInvoice.vatAdjustment !== '' &&
            vatInvoice.vatAdjustment !== null,
        }"
        name="vatAdjustment"
        placeholder="VAT Adjustment"
        @update:model-value="dirty"
      />
    </td>

    <!-- Total -->
    <td class="text-right" :class="{ 'text-muted': vatInvoice.isCancelled }">
      {{ f.currency(vmc.vatInvoiceTotal(vatInvoice)) }}
    </td>

    <!-- Buttons -->
    <td class="vertical-top">
      <q-btn-group flat>
        <q-btn
          color="primary"
          icon="fal fa-plus"
          outline
          padding="sm"
          @click="insertVatInvoice(vatInvoiceIndex)"
        >
          <TopTooltip>Insert VAT Invoice</TopTooltip>
        </q-btn>
        <q-btn
          color="negative"
          icon="fal fa-trash-alt"
          outline
          padding="sm"
          @click="removeVatInvoice(vatInvoiceIndex)"
        >
          <TopTooltip>Remove VAT Invoice</TopTooltip>
        </q-btn>
      </q-btn-group>
    </td>
  </tr>
</template>
