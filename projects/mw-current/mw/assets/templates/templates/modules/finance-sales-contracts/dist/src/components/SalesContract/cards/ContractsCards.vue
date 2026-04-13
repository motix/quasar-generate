<script setup lang="ts">
import { computed } from 'vue';

import { Dark } from 'quasar';

import type { SalesContract, SalesContractVm } from 'models/finance/index.js';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import ContractEditorCard from './ContractEditorCard.vue';
import ContractViewerCard from './ContractViewerCard.vue';

// Props

const props = defineProps<{
  scopeName: string;
  label: string;
  contracts: SalesContract[];
}>();

// Composables

const { cardWidth } = requiredConfigEntries('cardWidth');

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  editMode,
  f,
  m,
} = $p;

// Computed

const mcOrVmc = computed(() => ($p.editMode.value ? $p.vmc : $p.mc));

const mOrVm = computed(
  () =>
    // Safely bypassing type checking
    $p.activeMOrVm.value as SalesContract & SalesContractVm,
);
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
        <div class="text-h6 text-center">
          {{ label }}
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row justify-between">
          <div>Subtotal</div>
          <div class="text-warning">
            {{ f.currency(mcOrVmc.sameInvoiceSalesContractsSubtotal(mOrVm, contracts)) }}
          </div>
        </div>

        <div class="row justify-between">
          <div>Arising</div>
          <div class="text-warning">
            {{ f.currency(mcOrVmc.sameInvoiceSalesContractsArising(mOrVm, contracts)) }}
          </div>
        </div>

        <div class="row justify-between">
          <div>VAT</div>
          <div class="text-warning">
            {{ f.currency(mcOrVmc.sameInvoiceSalesContractsVat(mOrVm, contracts)) }}
          </div>
        </div>

        <div class="row justify-between">
          <div>Total</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(mcOrVmc.sameInvoiceSalesContractsTotal(mOrVm, contracts)) }}
            </strong>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Bottom padding to be consistent with editor -->
    <div class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs">
      <ContractEditorCard v-if="editMode" :scope-name="scopeName" />

      <ContractViewerCard v-else :contract="m" :contract-index="0" :scope-name="scopeName" />

      <ContractViewerCard
        v-for="(contract, index) in contracts"
        :key="contract.id"
        :contract="contract"
        :contract-index="index + 1"
        :scope-name="scopeName"
      />
    </div>
  </div>
</template>
