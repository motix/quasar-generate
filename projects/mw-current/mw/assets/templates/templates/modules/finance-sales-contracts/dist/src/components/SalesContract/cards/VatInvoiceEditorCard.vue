<script setup lang="ts">
import { Dark } from 'quasar';

import useVatInvoiceEditor from 'composables/finance/sales-contract/useVatInvoiceEditor.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

// Props

const props = defineProps<{
  scopeName: string;
  vatInvoiceIndex: number;
}>();

// Composables

const { listItemCardWidth } = requiredConfigEntries('listItemCardWidth');

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
  <q-card
    :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
    style="width: 100%"
    :style="{ maxWidth: listItemCardWidth + 'px' }"
  >
    <q-card-actions align="around">
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
    </q-card-actions>

    <q-separator inset />

    <q-card-section class="q-col-gutter-md row">
      <!-- Number -->
      <TextField class="col-10" dense label="#" stack-label>
        {{ vatInvoiceIndex + 1 }}
      </TextField>

      <!-- Cancelled -->
      <div class="col-2 text-right">
        <q-toggle
          v-model="vatInvoice.isCancelled"
          checked-icon="fal fa-check"
          class="right-toggle"
          color="accent"
          unchecked-icon="clear"
          @update:model-value="dirty"
        >
          <TopTooltip>Cancelled</TopTooltip>
        </q-toggle>
      </div>

      <!-- Issue Date -->
      <QDateInputVal
        v-model="vatInvoice.issueDate"
        class="col-6"
        dense
        hide-bottom-space
        label="Issue Date"
        name="issueDate"
        @update:model-value="dirty"
      />

      <!-- Code -->
      <QInputVal
        v-model="vatInvoice.code"
        class="col-6"
        dense
        hide-bottom-space
        label="Code"
        name="code"
        @update:model-value="dirty"
      />

      <!-- Content -->
      <QInputVal
        v-model="vatInvoice.content"
        autogrow
        class="col-12"
        dense
        hide-bottom-space
        label="Content"
        name="content"
        @update:model-value="dirty"
      />

      <!-- Subtotal -->
      <ThousandInputVal
        v-model="vatInvoice.subTotal"
        class="col-6"
        dense
        hide-bottom-space
        :hint="f.currency(vatInvoice.subTotal) || undefined"
        input-class="text-right"
        label="Subtotal"
        name="subTotal"
        @update:model-value="dirty"
      />

      <div class="flex-break q-pt-none"></div>

      <!-- VAT -->
      <PercentInputVal
        v-model="vatInvoice.vatPercent"
        class="col-6"
        clearable
        dense
        hide-bottom-space
        :hint="`${f.currency(vmc.vatInvoiceVat(vatInvoice)) || ''} (optional)`"
        input-class="text-right"
        label="VAT Rate"
        name="vatPercent"
        @update:model-value="dirty"
      />

      <!-- VAT Adjustment -->
      <QInputVal
        v-model.number="vatInvoice.vatAdjustment"
        class="col-6"
        clearable
        dense
        :disable="!f.isNumber(vatInvoice.vatPercent)"
        hide-bottom-space
        :hint="`${
          f.isNumber(vatInvoice.vatAdjustment) && vatInvoice.vatAdjustment > 0 ? '+' : ''
        }${f.currency(vatInvoice.vatAdjustment) || ''} (optional)`"
        :input-class="{
          'text-right': true,
          'text-strike': !f.isNumber(vatInvoice.vatPercent),
        }"
        label="VAT Adjustment"
        name="vatAdjustment"
        @update:model-value="dirty"
      />

      <!-- Total -->
      <TextField class="col-12" dense field-class="text-right" label="Total" stack-label>
        {{ f.currency(vmc.vatInvoiceTotal(vatInvoice)) }}
      </TextField>
    </q-card-section>
  </q-card>
</template>
