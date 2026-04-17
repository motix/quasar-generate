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
  filterMemberOptions,
  insertItemContribution,
  itemContribution,
  memberOptions,
  onUpdateMember,
  onUpdateProductionRole,
  productionRoles,
  removeItemContribution,
} = $p;

// Expose

defineExpose({
  validate: $p.validateSubDetailEditor,
});
</script>

<template>
  <div>
    <q-separator />

    <q-card-actions
      align="around"
      :class="Dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      :item-contribution-key="itemContribution.key"
    >
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
    </q-card-actions>

    <q-card-section class="q-col-gutter-md row">
      <QSelectVal
        v-model="itemContribution.member"
        class="col-6"
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

      <QSelectVal
        v-model="itemContribution.productionRole"
        class="col-6"
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

      <PercentInputVal
        v-model="itemContribution.involvement"
        class="col-6"
        dense
        hide-bottom-space
        input-class="text-right"
        label="Involvement"
        name="involvement"
        @update:model-value="dirty"
      />

      <PercentInputVal
        v-model="itemContribution.priceFactor"
        class="col-6"
        dense
        hide-bottom-space
        input-class="text-right"
        label="Price Factor"
        name="priceFactor"
        @update:model-value="dirty"
      />
    </q-card-section>
  </div>
</template>

<style lang="scss" scoped>
.list-transition-enter-active .bg-grey-3,
.list-transition-leave-active .bg-grey-3,
.list-transition-enter-active .bg-grey-9,
.list-transition-leave-active .bg-grey-9 {
  transition: all 0.5s;
}

.list-transition-enter-from .bg-grey-3,
.list-transition-enter-from .bg-grey-9 {
  background-color: $primary !important;
}

.list-transition-leave-to .bg-grey-3,
.list-transition-leave-to .bg-grey-9 {
  background-color: $negative !important;
}
</style>
