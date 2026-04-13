<script setup lang="ts">
import { computed, watch } from 'vue';

import useProjectViewPage from 'composables/finance/project/useProjectViewPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import useMultiViews from 'composables/useMultiViews.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

import ItemsEditorCards from './cards/ItemsEditorCards.vue';
import ItemsEditorTable from './table/ItemsEditorTable.vue';

// Private

async function validateProjectEditor() {
  if (vm.value.items.length === 0) {
    return true;
  }

  !$p.validateProjectAdditionEditor.value &&
    (() => {
      throw new Error('validateProjectAdditionEditor not specified');
    })();

  const validations = [$p.validateItemsEditor(), $p.validateProjectAdditionEditor.value()];
  const results = await Promise.all(validations);

  return !results.includes(false);
}

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { isTableView, isCardsView } = useMultiViews();

const { hasRole } = useFirebaseAuth();

const $p = useProjectViewPage(props.scopeName);
const {
  // Auto sort
  addItem,
  dirty,
  f,
  freezed,
  vm,
} = $p;

// Private Executions

$p.useCustomValidation(validateProjectEditor);

// Watch

watch(
  computed(() => vm.value.items.length),
  (value) => {
    if (value === 0) {
      vm.value.discount = '';
      vm.value.vatPercent = '';
      vm.value.vatableAmount = '';
    }
  },
);
</script>

<template>
  <div class="q-gutter-y-lg">
    <ExpandableCard
      avatar-icon="fal fa-briefcase"
      avatar-top
      body-cell-gutter
      class="q-mx-auto"
      expandable
      header-background-color="primary"
      header-dark
      side-top
      :subtitle="f.dateViewModel(vm.finishDate) || undefined"
      subtitle-tooltip="Finish Date"
      :title="vm.name"
      title-full-width
      title-top
    >
      <template #main>
        <StatusBadge class="q-mt-md" revert-color :status="vm.statusHelper" />
      </template>

      <template #side>
        <q-toggle
          v-model="vm.isArchived"
          checked-icon="fal fa-box-taped"
          class="right-toggle"
          color="white"
          :disable="!hasRole('manager')"
          icon-color="primary"
          label="Archived"
          left-label
          unchecked-icon="fal fa-box-open"
          @update:model-value="dirty"
        />
      </template>

      <template #bezel-less-top>
        <q-card-section class="q-col-gutter-sm row">
          <div class="col-6">
            <ObjectLink
              color="primary"
              icon="fal fa-user-crown"
              :label="vm.customer.name"
              :to="`/customers/${vm.customer.code}`"
            />
          </div>

          <div class="col-6 text-right">
            <ObjectLink icon="fal fa-user" :label="vm.owner" :ripple="false" />
          </div>

          <div class="col-12 text-caption">{{ vm.customerContact }}</div>
        </q-card-section>

        <q-separator />
      </template>

      <template #body>
        <q-toggle
          v-model="vm.isInvoiceRequired"
          checked-icon="fal fa-file-invoice-dollar"
          class="col-6"
          color="primary"
          :disable="freezed"
          label="Invoice Required"
          unchecked-icon="clear"
          @update:model-value="dirty"
        />
      </template>
    </ExpandableCard>

    <FadeTransition>
      <div v-if="vm.items.length === 0" key="empty" class="text-center">
        <q-btn color="primary" label="Add Item" @click="addItem" />
      </div>

      <ItemsEditorTable v-else-if="isTableView" key="tableView" :scope-name="scopeName" />

      <ItemsEditorCards v-else-if="isCardsView" key="cardsView" :scope-name="scopeName" />
    </FadeTransition>
  </div>
</template>
