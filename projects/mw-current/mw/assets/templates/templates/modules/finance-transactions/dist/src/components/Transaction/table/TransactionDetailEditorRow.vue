<script setup lang="ts">
import useTransactionDetailEditor from 'composables/finance/transaction/useTransactionDetailEditor.js';

// Props

const props = defineProps<{
  scopeName: string;
  detailIndex: number;
}>();

// Composables

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
  <tr>
    <!-- Number -->
    <td class="vertical-top">
      <TextField class="text-right" dense>
        {{ detailIndex + 1 }}
      </TextField>
    </td>

    <!-- Content -->
    <td class="vertical-top">
      <QInputVal
        v-model="detail.content"
        autogrow
        dense
        hide-bottom-space
        name="content"
        placeholder="Content"
        @update:model-value="dirty"
      />
    </td>

    <!-- Quantity -->
    <td class="vertical-top">
      <QInputVal
        v-model.number="detail.quantity"
        dense
        hide-bottom-space
        input-class="text-right"
        name="quantity"
        placeholder="Quantity"
        @update:model-value="dirty"
      />
    </td>

    <!-- Unit Price -->
    <td class="vertical-top">
      <ThousandInputVal
        v-model="detail.unitPrice"
        dense
        hide-bottom-space
        :hint="f.currency(detail.unitPrice) || undefined"
        input-class="text-right"
        name="unitPrice"
        placeholder="Unit Price"
        @update:model-value="dirty"
      />
    </td>

    <!-- Amount -->
    <td class="vertical-top">
      <TextField dense field-class="text-right">
        {{ f.currency(vmc.transactionDetailAmount(detail)) }}
      </TextField>
    </td>

    <!-- Buttons -->
    <td class="vertical-top">
      <q-btn-group flat>
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
      </q-btn-group>
    </td>
  </tr>
</template>
