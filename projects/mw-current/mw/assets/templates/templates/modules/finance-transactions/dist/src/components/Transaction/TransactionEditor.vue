<script setup lang="ts">
import type { Component } from 'vue';
import { useTemplateRef } from 'vue';

import useTransactionEditPage from 'composables/finance/transaction/useTransactionEditPage.js';
import useMultiViews from 'composables/useMultiViews.js';

import TransactionDetailsEditorCards from 'components/Transaction/cards/TransactionDetailsEditorCards.vue';
import TransactionDetailsEditorTable from 'components/Transaction/table/TransactionDetailsEditorTable.vue';
import TransactionEditorMain from 'components/Transaction/TransactionEditorMain.vue';

// Private

async function validateTransactionEditor() {
  !transactionEditorMainRef.value &&
    (() => {
      throw new Error('transactionEditorMainRef not specified');
    })();

  const validations = [transactionEditorMainRef.value.validate()];

  if (!$p.isNewPage($p)) {
    validations.push($p.validateDetailsEditor());
  }

  const results = await Promise.all(validations);

  return !results.includes(false);
}

// Props

const props = defineProps<{
  scopeName: string;
  transactionEditorMainComponent?: Component;
}>();

// Composables

const { isTableView, isCardsView } = useMultiViews();

const $p = useTransactionEditPage(props.scopeName);
const {
  // Auto sort
  vm,
} = $p;

// Data

const transactionEditorMainRef =
  useTemplateRef<InstanceType<typeof TransactionEditorMain>>('transactionEditorMain');

// Private Executions

$p.useCustomValidation(validateTransactionEditor);
</script>

<template>
  <div class="q-gutter-y-lg">
    <component
      :is="transactionEditorMainComponent"
      v-if="transactionEditorMainComponent"
      ref="transactionEditorMain"
      :scope-name="scopeName"
    />
    <TransactionEditorMain
      v-else
      ref="transactionEditorMain"
      :new-page="$p.isNewPage($p)"
      :scope-name="scopeName"
    />

    <FadeTransition v-if="!$p.isNewPage($p)">
      <div v-if="vm.details.length === 0" key="empty" class="text-center">
        <q-btn color="primary" label="Add Detail" @click="$p.addDetail" />
      </div>

      <TransactionDetailsEditorTable
        v-else-if="isTableView"
        key="tableView"
        :scope-name="scopeName"
      />

      <TransactionDetailsEditorCards
        v-else-if="isCardsView"
        key="cardsView"
        :scope-name="scopeName"
      />
    </FadeTransition>
  </div>
</template>
