<script setup lang="ts">
import type { Component } from 'vue';
import { computed, useTemplateRef, watch } from 'vue';

import useInvoiceEditPage, {
  invoiceEditPageComponentStore,
} from 'composables/finance/invoice/useInvoiceEditPage.js';

import InvoiceDetailsEditor from 'components/Invoice/InvoiceDetailsEditor.vue';
import InvoiceEditorMain from 'components/Invoice/InvoiceEditorMain.vue';

// Private

async function validateInvoiceEditor() {
  !invoiceEditorMainRef.value &&
    (() => {
      throw new Error('invoiceEditorMainRef not specified');
    })();

  const validations = [invoiceEditorMainRef.value.validate()];

  if (!$p.isNewPage($p) && !$p.isCompleted.value && $p.vm.value.details.length > 0) {
    !$p.validateInvoiceAdditionEditor.value &&
      (() => {
        throw new Error('validateInvoiceAdditionEditor not specified');
      })();

    validations.push($p.validateDetailsEditor(), $p.validateInvoiceAdditionEditor.value());
  }

  const results = await Promise.all(validations);

  return !results.includes(false);
}

// Props

const props = defineProps<{
  scopeName: string;
  invoiceEditorMainComponent?: Component;
}>();

// Composables

const $p = useInvoiceEditPage(props.scopeName);

// Data

const invoiceEditorMainRef =
  useTemplateRef<InstanceType<typeof InvoiceEditorMain>>('invoiceEditorMain');

// Private Executions

$p.useCustomValidation(validateInvoiceEditor);

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
        invoiceEditorMainComponent ||
        invoiceEditPageComponentStore.invoiceEditorMain ||
        InvoiceEditorMain
      "
      ref="invoiceEditorMain"
      :scope-name="scopeName"
    />

    <InvoiceDetailsEditor v-if="!$p.isNewPage($p)" :scope-name="scopeName" />
  </div>
</template>
