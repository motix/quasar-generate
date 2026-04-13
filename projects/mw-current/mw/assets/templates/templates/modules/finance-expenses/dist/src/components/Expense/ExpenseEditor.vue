<script setup lang="ts">
import type { Component } from 'vue';
import { computed, useTemplateRef, watch } from 'vue';

import useExpenseEditPage, {
  expenseEditPageComponentStore,
} from 'composables/finance/expense/useExpenseEditPage.js';

import ExpenseDetailsEditor from 'components/Expense/ExpenseDetailsEditor.vue';
import ExpenseEditorMain from 'components/Expense/ExpenseEditorMain.vue';

// Private

async function validateExpenseEditor() {
  !expenseEditorMainRef.value &&
    (() => {
      throw new Error('expenseEditorMainRef not specified');
    })();

  const validations = [expenseEditorMainRef.value.validate()];

  if (!$p.isNewPage($p) && !$p.isCompleted.value && $p.vm.value.details.length > 0) {
    !$p.validateExpenseAdditionEditor.value &&
      (() => {
        throw new Error('validateExpenseAdditionEditor not specified');
      })();

    validations.push($p.validateDetailsEditor(), $p.validateExpenseAdditionEditor.value());
  }

  const results = await Promise.all(validations);

  return !results.includes(false);
}

// Props

const props = defineProps<{
  scopeName: string;
  expenseEditorMainComponent?: Component;
}>();

// Composables

const $p = useExpenseEditPage(props.scopeName);

// Data

const expenseEditorMainRef =
  useTemplateRef<InstanceType<typeof ExpenseEditorMain>>('expenseEditorMain');

// Private Executions

$p.useCustomValidation(validateExpenseEditor);

// Watch

watch(
  computed(() => $p.vm.value.details.length),
  (value) => {
    if (value === 0) {
      $p.vm.value.discount = '';
      $p.vm.value.vatPercent = '';
      $p.vm.value.vatableAmount = '';
      $p.vm.value.secondVatPercent = '';
      $p.vm.value.secondVatableAmount = '';
    }
  },
);
</script>

<template>
  <div class="q-gutter-y-lg">
    <component
      :is="
        expenseEditorMainComponent ||
        expenseEditPageComponentStore.expenseEditorMain ||
        ExpenseEditorMain
      "
      ref="expenseEditorMain"
      :scope-name="scopeName"
    />

    <ExpenseDetailsEditor v-if="!$p.isNewPage($p)" :scope-name="scopeName" />
  </div>
</template>
