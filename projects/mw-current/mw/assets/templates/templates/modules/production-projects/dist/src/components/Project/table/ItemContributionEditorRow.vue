<script setup lang="ts">
import { Dark } from 'quasar';

import useItemContributionEditor from 'composables/production/project/useItemContributionEditor.js';

// Props

const props = defineProps<{
  scopeName: string;
  itemIndex: number;
  itemContributionIndex: number;
}>();

// Composables

const $p = useItemContributionEditor(props);
const {
  // Auto sort
  dirty,
  f,
  filterMemberOptions,
  insertItemContribution,
  item,
  itemContribution,
  memberOptions,
  onUpdateMember,
  onUpdateProductionRole,
  productionRoles,
  removeItemContribution,
  vmc,
} = $p;

// Expose

defineExpose({
  validate: $p.validateSubDetailEditor,
});
</script>

<template>
  <tr :class="Dark.isActive ? 'bg-grey-9' : 'bg-grey-3'">
    <!-- Full Name -->
    <td class="vertical-top">
      <QSelectVal
        v-model="itemContribution.member"
        dense
        fill-input
        hide-bottom-space
        hide-selected
        label="Full Name"
        name="member"
        option-label="fullName"
        option-value="id"
        :options="memberOptions"
        use-input
        @filter="filterMemberOptions"
        @update:model-value="
          dirty();
          onUpdateMember($event);
        "
      />
    </td>

    <!-- Product Type / Role -->
    <td class="vertical-top">
      <QSelectVal
        v-model="itemContribution.productionRole"
        dense
        hide-bottom-space
        label="Role"
        name="productionRole"
        option-label="name"
        option-value="id"
        :options="productionRoles"
        @update:model-value="
          dirty();
          onUpdateProductionRole();
        "
      />
    </td>

    <!-- Involvement -->
    <td class="vertical-top">
      <PercentInputVal
        v-model="itemContribution.involvement"
        dense
        hide-bottom-space
        input-class="text-right"
        name="involvement"
        placeholder="Involvement"
        @update:model-value="dirty"
      />
    </td>

    <!-- Price Factor -->
    <td class="vertical-top">
      <PercentInputVal
        v-model="itemContribution.priceFactor"
        dense
        hide-bottom-space
        input-class="text-right"
        name="priceFactor"
        placeholder="Price Factor"
        @update:model-value="dirty"
      />
    </td>

    <!-- Quantity -->
    <td class="vertical-top">
      <TextField dense field-class="text-right">
        {{ item.quantity }}
      </TextField>
    </td>

    <!-- Salary Base -->
    <td class="vertical-top">
      <TextField dense field-class="text-right">
        {{ f.currency(vmc.itemContributionProductionSalaryBase(itemContribution)) }}
      </TextField>
    </td>

    <!-- Salary Amount -->
    <td class="vertical-top">
      <TextField dense field-class="text-right">
        {{
          f.currency(vmc.itemContributionProductionSalaryAmount(itemContribution, item.quantity))
        }}
      </TextField>
    </td>

    <!-- Buttons -->
    <td class="vertical-top">
      <q-btn-group flat>
        <q-btn
          color="primary"
          flat
          icon="fal fa-plus"
          padding="13px"
          size="xs"
          @click="insertItemContribution(itemIndex, itemContributionIndex)"
        >
          <TopTooltip>Insert Contribution</TopTooltip>
        </q-btn>
        <q-btn
          color="negative"
          flat
          icon="fal fa-trash-alt"
          padding="13px"
          size="xs"
          @click="removeItemContribution(itemIndex, itemContributionIndex)"
        >
          <TopTooltip>Remove Contribution</TopTooltip>
        </q-btn>
      </q-btn-group>
    </td>
  </tr>
</template>
