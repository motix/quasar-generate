<script setup lang="ts">
import type { ComponentPublicInstance, ShallowRef, useTemplateRef } from 'vue';

import { Dark } from 'quasar';

import { useTransactionViewPage } from 'composables/finance/transaction/useTransactionEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import TransactionDetailEditorCard from './TransactionDetailEditorCard.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth } = requiredConfigEntries('cardWidth');

const $p = useTransactionViewPage(props.scopeName);
const {
  // Auto sort
  f,
  setDetailEditorRef,
  vm,
  vmc,
} = $p;

// Methods

function elConvert(el: Element | ComponentPublicInstance | null) {
  return el as ReturnType<
    typeof useTemplateRef<InstanceType<typeof TransactionDetailEditorCard>>
  > extends Readonly<ShallowRef<infer Component>>
    ? Component
    : never;
}
</script>

<template>
  <div class="q-gutter-y-md">
    <q-card
      class="q-mx-auto bg-accent"
      :class="Dark.isActive ? undefined : 'shadow-2'"
      dark
      style="width: 100%"
      :style="{ maxWidth: cardWidth + 'px' }"
    >
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-center">Details</div>
      </q-card-section>

      <q-card-section>
        <div class="row justify-between">
          <div>Total Quantity</div>
          <div class="text-warning">
            <strong>
              {{ vmc.transactionTotalQuantity(vm) }}
            </strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Total</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(vmc.transactionTotal(vm)) }}
            </strong>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <ListTransition
      class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs"
      color-effect
      :gutter="16"
    >
      <TransactionDetailEditorCard
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
    </ListTransition>
  </div>
</template>
