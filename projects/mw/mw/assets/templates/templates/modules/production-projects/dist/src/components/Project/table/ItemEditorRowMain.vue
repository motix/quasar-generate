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
  f,
  filterProductTypeOptions,
  insertItem,
  item,
  onUpdateProductType,
  productTypeOptions,
  removeItem,
  vmc,
} = $p;

// Expose

defineExpose({
  validate: $p.validateItemEditorMain,
});
</script>

<template>
  <tr>
    <!-- Number -->
    <td
      class="vertical-top bordered-cell"
      :rowspan="
        item.contributions.length === 0 && item.productType ? 2 : item.contributions.length + 1
      "
    >
      <q-input
        v-model="item.number"
        clearable
        dense
        hide-bottom-space
        :hint="
          !!item.number && item.number.length > 2
            ? '(optional)'
            : !!item.number && item.number.length > 0
              ? '(opt.)'
              : ''
        "
        :input-style="{
          width: `${item.number === null ? 0.7 : item.number.length * 0.7}em`,
          maxWidth: '100px',
          minWidth: '10px',
        }"
        placeholder="#"
        @update:model-value="dirty"
      />
    </td>

    <!-- Title / Description -->
    <td
      class="vertical-top bordered-cell"
      :rowspan="
        item.contributions.length === 0 && item.productType ? 2 : item.contributions.length + 1
      "
    >
      <QInputVal
        v-model="item.title"
        autogrow
        dense
        hide-bottom-space
        name="title"
        placeholder="Title"
        @update:model-value="dirty"
      />

      <q-input
        v-model="item.description"
        autogrow
        class="q-mt-sm"
        clearable
        dense
        hide-bottom-space
        hint="(optional)"
        placeholder="Description"
        @update:model-value="dirty"
      />
    </td>

    <!-- Full Name -->
    <td :class="{ 'bordered-cell': !item.productType }" />

    <!-- Product Type / Role -->
    <td class="vertical-top" :class="{ 'bordered-cell': !item.productType }">
      <QSelectVal
        v-model="item.productType"
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
    </td>

    <!-- Involvement -->
    <td :class="{ 'bordered-cell': !item.productType }" />

    <!-- Price Factor -->
    <td class="vertical-top" :class="{ 'bordered-cell': !item.productType }">
      <TextField dense field-class="text-right">
        {{ f.percent(vmc.itemPriceFactor(item)) }}
      </TextField>
    </td>

    <!-- Quantity -->
    <td class="vertical-top" :class="{ 'bordered-cell': !item.productType }">
      <QInputVal
        v-model.number="item.quantity"
        dense
        hide-bottom-space
        input-class="text-right"
        name="quantity"
        placeholder="Quantity"
        @update:model-value="dirty"
      />
    </td>

    <!-- Salary Base -->
    <td :class="{ 'bordered-cell': !item.productType }" />

    <!-- Salary Amount -->
    <td class="vertical-top" :class="{ 'bordered-cell': !item.productType }">
      <TextField dense field-class="text-right">
        {{ f.currency(vmc.itemProductionSalaryAmount(item)) }}
      </TextField>
    </td>

    <!-- Buttons -->
    <td class="vertical-top" :class="{ 'bordered-cell': !item.productType }">
      <q-btn-group flat>
        <q-btn
          color="primary"
          icon="fal fa-plus"
          outline
          padding="sm"
          @click="insertItem(itemIndex)"
        >
          <TopTooltip>Insert Item</TopTooltip>
        </q-btn>
        <q-btn
          color="negative"
          icon="fal fa-trash-alt"
          outline
          padding="sm"
          @click="removeItem(itemIndex)"
        >
          <TopTooltip>Remove Item</TopTooltip>
        </q-btn>
      </q-btn-group>
    </td>
  </tr>
</template>

<style scoped lang="scss">
.bordered-cell {
  border-bottom-width: 1px;
}
</style>
