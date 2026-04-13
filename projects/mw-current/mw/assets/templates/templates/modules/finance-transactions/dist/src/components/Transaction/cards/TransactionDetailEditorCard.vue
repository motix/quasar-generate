<script setup lang="ts">
import { Dark } from 'quasar';

import useTransactionDetailEditor from 'composables/finance/transaction/useTransactionDetailEditor.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

// Props

const props = defineProps<{
  scopeName: string;
  detailIndex: number;
}>();

// Composables

const { listItemCardWidth } = requiredConfigEntries('listItemCardWidth');

const $p = useTransactionDetailEditor(props);
const {
  // Auto sort
  detail,
  dirty,
  f,
  insertDetail,
  removeDetail,
  vmc,
} = $p;

// Expose

defineExpose({
  validate: $p.validateTransactionDetailEditor,
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
        @click="insertDetail(detailIndex)"
      >
        <TopTooltip>Insert Detail</TopTooltip>
      </q-btn>
      <q-btn
        color="negative"
        icon="fal fa-trash-alt"
        outline
        padding="sm"
        @click="removeDetail(detailIndex)"
      >
        <TopTooltip>Remove Detail</TopTooltip>
      </q-btn>
    </q-card-actions>

    <q-separator inset />

    <q-card-section class="q-col-gutter-md row">
      <!-- Content -->
      <QInputVal
        v-model="detail.content"
        autogrow
        class="col-12"
        dense
        hide-bottom-space
        label="Content"
        name="content"
        @update:model-value="dirty"
      />

      <!-- Quantity -->
      <QInputVal
        v-model.number="detail.quantity"
        class="col-6"
        dense
        hide-bottom-space
        input-class="text-right"
        label="Quantity"
        name="quantity"
        @update:model-value="dirty"
      />

      <!-- Unit Price -->
      <ThousandInputVal
        v-model="detail.unitPrice"
        class="col-6"
        dense
        hide-bottom-space
        :hint="f.currency(detail.unitPrice) || undefined"
        input-class="text-right"
        label="Unit Price"
        name="unitPrice"
        @update:model-value="dirty"
      />

      <!-- Amount -->
      <TextField class="col-12" dense field-class="text-right" label="Amount" stack-label>
        {{ f.currency(vmc.transactionDetailAmount(detail)) }}
      </TextField>
    </q-card-section>
  </q-card>
</template>
