<script setup lang="ts">
import { Dark } from 'quasar';

import useItemEditor from 'composables/finance/project/useItemEditor.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

// Props

const props = defineProps<{
  scopeName: string;
  itemIndex: number;
}>();

// Composables

const { listItemCardWidth } = requiredConfigEntries('listItemCardWidth');

const $p = useItemEditor(props);
const {
  // Auto sort
  dirty,
  f,
  insertItem,
  item,
  removeItem,
  vmc,
} = $p;

// Expose

defineExpose({
  validate: $p.validateDetailEditor,
});
</script>

<template>
  <q-card
    :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
    style="width: 100%"
    :style="{ maxWidth: listItemCardWidth + 'px' }"
  >
    <q-card-actions align="around">
      <q-btn color="primary" icon="fal fa-plus" outline padding="sm" @click="insertItem(itemIndex)">
        <TopTooltip>Insert Item</TopTooltip>
      </q-btn>
      <q-btn
        v-if="item.isFinanceOnly"
        color="negative"
        icon="fal fa-trash-alt"
        outline
        padding="sm"
        @click="removeItem(itemIndex)"
      >
        <TopTooltip>Remove Item</TopTooltip>
      </q-btn>
    </q-card-actions>

    <q-separator inset />

    <q-card-section class="q-col-gutter-md row">
      <!-- Number -->
      <q-input
        v-if="item.isFinanceOnly"
        v-model="item.number"
        class="col-10"
        clearable
        dense
        hide-bottom-space
        hint="(optional)"
        label="#"
        @update:model-value="dirty"
      />
      <TextField v-else class="col-10" dense label="#" stack-label>
        {{ item.number }}
      </TextField>

      <!-- Togglers -->
      <div class="col-2 text-right">
        <q-toggle
          v-if="item.isFinanceOnly"
          v-model="item.isQuotationOnly"
          checked-icon="fal fa-file-invoice"
          class="right-toggle"
          color="accent"
          unchecked-icon="fal fa-file-invoice"
          @update:model-value="dirty"
        >
          <TopTooltip>Quotation Only</TopTooltip>
        </q-toggle>

        <q-toggle
          v-else
          v-model="item.isProductionOnly"
          checked-icon="fal fa-thunderstorm"
          class="right-toggle"
          color="accent"
          unchecked-icon="fal fa-thunderstorm"
          @update:model-value="dirty"
        >
          <TopTooltip>Production Only</TopTooltip>
        </q-toggle>
      </div>

      <!-- Title -->
      <QInputVal
        v-if="item.isFinanceOnly"
        v-model="item.title"
        autogrow
        class="col-12"
        dense
        hide-bottom-space
        label="Title"
        name="title"
        @update:model-value="dirty"
      />
      <TextField v-else class="col-12" dense label="Title" stack-label>
        {{ item.title }}
      </TextField>

      <!-- Description -->
      <q-input
        v-if="item.isFinanceOnly"
        v-model="item.description"
        autogrow
        class="col-12"
        clearable
        dense
        hide-bottom-space
        hint="(optional)"
        label="Description"
        @update:model-value="dirty"
      />
      <TextField v-else class="col-12" dense label="Description" stack-label>
        {{ item.description }}
      </TextField>

      <!-- Product Type -->
      <TextField v-if="!item.isFinanceOnly" class="col-6" dense label="Product Type" stack-label>
        {{ item.productType }}
      </TextField>

      <!-- Production Salary Amount -->
      <TextField
        v-if="!item.isFinanceOnly"
        class="col-6"
        dense
        field-class="text-right"
        label="Production Salary Amount"
        stack-label
      >
        {{ f.currency(vmc.itemProductionSalaryAmount(item)) }}
      </TextField>

      <!-- Quantity -->
      <QInputVal
        v-if="item.isFinanceOnly"
        v-model.number="item.quantity"
        class="col-6"
        dense
        hide-bottom-space
        input-class="text-right"
        label="Quantity"
        name="quantity"
        @update:model-value="dirty"
      />
      <TextField v-else class="col-6" dense field-class="text-right" label="Quantity" stack-label>
        {{ item.quantity }}
      </TextField>

      <!-- Unit Price -->
      <q-slide-transition class="col-6 q-pt-none">
        <div v-if="!item.isProductionOnly">
          <ThousandInputVal
            v-model="item.unitPrice"
            class="q-pt-md"
            dense
            hide-bottom-space
            :hint="f.currency(item.unitPrice) || undefined"
            input-class="text-right"
            label="Unit Price"
            name="unitPrice"
            @update:model-value="dirty"
          />
        </div>
      </q-slide-transition>

      <!-- Amount -->
      <q-slide-transition class="col-12 q-pt-none">
        <div v-if="!item.isProductionOnly">
          <TextField class="q-pt-md" dense field-class="text-right" label="Amount" stack-label>
            {{ f.currency(vmc.itemAmount(item)) }}
          </TextField>
        </div>
      </q-slide-transition>
    </q-card-section>
  </q-card>
</template>
