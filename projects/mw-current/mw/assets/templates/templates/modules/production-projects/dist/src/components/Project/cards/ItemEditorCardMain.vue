<script setup lang="ts">
import useItemEditorMain from 'composables/production/project/useItemEditorMain';

// Props

const props = defineProps<{
  scopeName: string;
  itemIndex: number;
}>();

// Composables

const $p = useItemEditorMain(props);
const {
  // Auto sort
  dirty,
  filterProductTypeOptions,
  item,
  onUpdateProductType,
  productTypeOptions,
} = $p;

// Expose

defineExpose({
  validate: $p.validateItemEditorMain,
});
</script>

<template>
  <q-card-section class="q-col-gutter-md row">
    <q-input
      v-model="item.number"
      class="col-12"
      clearable
      dense
      hide-bottom-space
      hint="(optional)"
      label="#"
      @update:model-value="dirty"
    />

    <QInputVal
      v-model="item.title"
      autogrow
      class="col-12"
      dense
      hide-bottom-space
      label="Title"
      name="title"
      @update:model-value="dirty"
    />

    <q-input
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

    <QSelectVal
      v-model="item.productType"
      class="col-6"
      dense
      fill-input
      hide-bottom-space
      hide-selected
      label="Product Type"
      name="productType"
      option-label="name"
      option-value="id"
      :options="productTypeOptions"
      use-input
      @filter="filterProductTypeOptions"
      @update:model-value="
        dirty();
        onUpdateProductType();
      "
    />

    <QInputVal
      v-model.number="item.quantity"
      class="col-6"
      dense
      hide-bottom-space
      input-class="text-right"
      label="Quantity"
      name="quantity"
      @update:model-value="dirty"
    />
  </q-card-section>
</template>
