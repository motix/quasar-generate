<script setup lang="ts">
import type { ComponentPublicInstance, ShallowRef, useTemplateRef } from 'vue';

import { useTransactionViewPage } from 'composables/finance/transaction/useTransactionEditPage.js';

import StickyHeaders from 'components/shared/StickyHeaders.vue';

import TransactionDetailEditorRow from './TransactionDetailEditorRow.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useTransactionViewPage(props.scopeName);
const {
  // Auto sort
  addDetail,
  f,
  setDetailEditorRef,
  vm,
  vmc,
} = $p;

// Methods

function elConvert(el: Element | ComponentPublicInstance | null) {
  return el as ReturnType<
    typeof useTemplateRef<InstanceType<typeof TransactionDetailEditorRow>>
  > extends Readonly<ShallowRef<infer Component>>
    ? Component
    : never;
}
</script>

<template>
  <q-list class="rounded-list">
    <q-expansion-item
      default-opened
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      icon="fal fa-list-ol"
      label="Details"
      popup
    >
      <q-card>
        <StickyHeaders markup-table separated target="#detailsEditorTable" />

        <q-markup-table id="detailsEditorTable" bordered separator="cell" wrap-cells>
          <thead>
            <tr>
              <th class="q-table--col-auto-width">#</th>
              <th>Content</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
              <th class="q-table--col-auto-width"></th>
            </tr>
          </thead>
          <tbody>
            <!-- Details -->
            <TransactionDetailEditorRow
              v-for="(detail, index) in vm.details"
              :key="
                detail.key ||
                (() => {
                  throw new Error('[finance-transactions] TransactionDetailVm key not set');
                })()
              "
              :ref="
                (el) => {
                  setDetailEditorRef(elConvert(el), index);
                }
              "
              :detail-index="index"
              :scope-name="scopeName"
            />

            <!-- Total -->
            <tr>
              <!-- Number -->
              <!-- Content -->
              <td class="text-right" colspan="2">
                <strong>Total</strong>
              </td>

              <!-- Quantity -->
              <td>
                <TextField dense field-class="text-right">
                  <strong>{{ vmc.transactionTotalQuantity(vm) }}</strong>
                </TextField>
              </td>

              <!-- Unit Price -->
              <td></td>

              <!-- Amount -->
              <td class="text-right">
                <strong>{{ f.currency(vmc.transactionTotal(vm)) }}</strong>
              </td>

              <!-- Buttons -->
              <td>
                <q-btn color="primary" icon="fal fa-plus" outline padding="sm" @click="addDetail()">
                  <TopTooltip>Add Detail</TopTooltip>
                </q-btn>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>
