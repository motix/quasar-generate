<script setup lang="ts">
import useItemEditor from 'composables/finance/project/useItemEditor.js';

// Props

const props = defineProps<{
  scopeName: string;
  itemIndex: number;
}>();

// Composables

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
  <tr>
    <!-- Number -->
    <td class="vertical-top">
      <q-input
        v-if="item.isFinanceOnly"
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
      <TextField v-else dense :field-class="{ 'text-muted text-italic': !item.number }">
        {{ item.number || '[#]' }}
      </TextField>
    </td>

    <!-- Togglers -->
    <td class="vertical-top text-center">
      <q-toggle
        v-if="item.isFinanceOnly"
        v-model="item.isQuotationOnly"
        checked-icon="fal fa-file-invoice"
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
        color="accent"
        unchecked-icon="fal fa-thunderstorm"
        @update:model-value="dirty"
      >
        <TopTooltip>Production Only</TopTooltip>
      </q-toggle>
    </td>

    <!-- Title / Description -->
    <td class="vertical-top">
      <template v-if="item.isFinanceOnly">
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
      </template>

      <template v-else>
        <TextField dense>
          {{ item.title }}
        </TextField>

        <TextField dense :field-class="{ 'text-muted text-italic': !item.description }">
          {{ item.description || '[Description]' }}
        </TextField>
      </template>
    </td>

    <!-- Product Type -->
    <!-- Production Salary Amount -->
    <td v-if="item.isFinanceOnly" class="text-center" colspan="2">
      <FadeTransition>
        <q-avatar v-if="item.isQuotationOnly" key="quotationOnly" color="accent" size="sm">
          <q-icon class="q-my-xs" color="white" name="fal fa-file-invoice" />
          <TopTooltip>Quotation Only</TopTooltip>
        </q-avatar>
        <q-avatar v-else key="financeOnly" color="accent" size="sm">
          <q-icon class="q-my-xs" color="white" name="fal fa-usd-circle" />
          <TopTooltip>Finance Only</TopTooltip>
        </q-avatar>
      </FadeTransition>
    </td>
    <template v-else>
      <!-- Product Type -->
      <td class="vertical-top">
        <TextField dense field-class="text-no-wrap">
          {{ item.productType }}
        </TextField>
      </td>

      <!-- Production Salary Amount -->
      <td class="vertical-top">
        <TextField dense field-class="text-right">
          {{ f.currency(vmc.itemProductionSalaryAmount(item)) }}
        </TextField>
      </td>
    </template>

    <!-- Quantity -->
    <td class="vertical-top">
      <QInputVal
        v-if="item.isFinanceOnly"
        v-model.number="item.quantity"
        dense
        hide-bottom-space
        input-class="text-right"
        name="quantity"
        placeholder="Quantity"
        @update:model-value="dirty"
      />
      <TextField v-else dense field-class="text-right">
        {{ item.quantity }}
      </TextField>
    </td>

    <!-- Unit Price -->
    <!-- Amount -->
    <td v-if="item.isProductionOnly" class="text-center" colspan="2">
      <q-avatar color="accent" size="sm">
        <q-icon class="q-my-xs" color="white" name="fal fa-thunderstorm" />
        <TopTooltip>Production Only</TopTooltip>
      </q-avatar>
    </td>
    <template v-else>
      <!-- Unit Price -->
      <td class="vertical-top">
        <ThousandInputVal
          v-model="item.unitPrice"
          dense
          hide-bottom-space
          :hint="f.currency(item.unitPrice) || undefined"
          input-class="text-right"
          name="unitPrice"
          placeholder="Unit Price"
          @update:model-value="dirty"
        />
      </td>

      <!-- Amount -->
      <td class="vertical-top">
        <TextField dense field-class="text-right">
          {{ f.currency(vmc.itemAmount(item)) }}
        </TextField>
      </td>
    </template>

    <!-- Buttons -->
    <td class="vertical-top">
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
          v-if="item.isFinanceOnly"
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
