<script setup lang="ts">
import { computed } from 'vue';

import type { SalesContract, SalesContractVm } from 'models/finance/index.js';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth } = requiredConfigEntries('cardWidth');

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  editMode,
  f,
  m,
  vm,
} = $p;

// Computed

const mcOrVmc = computed(() => ($p.editMode.value ? $p.vmc : $p.mc));

const mOrVm = computed(
  () =>
    // Safely bypassing type checking
    ($p.editMode.value ? $p.vm.value : $p.m.value) as SalesContract & SalesContractVm,
);
</script>

<template>
  <q-card class="q-mx-auto" style="width: 100%" :style="{ maxWidth: cardWidth + 'px' }">
    <div class="bg-accent text-white">
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-center">VAT Invoices</div>
      </q-card-section>

      <q-card-section>
        <div class="row justify-between">
          <div>Subtotal</div>
          <div class="text-warning">
            {{ f.currency(mcOrVmc.salesContractVatInvoicesSubtotal(mOrVm)) }}
          </div>
        </div>

        <div class="row justify-between">
          <div>VAT</div>
          <div class="text-warning">
            {{ f.currency(mcOrVmc.salesContractVatInvoicesVat(mOrVm)) }}
          </div>
        </div>

        <div class="row justify-between">
          <div>Total</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(mcOrVmc.salesContractVatInvoicesTotal(mOrVm)) }}
            </strong>
          </div>
        </div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section>
        <div class="row justify-between">
          <div>Contract Subtotal</div>
          <div class="text-warning">
            {{ f.currency(mOrVm.subTotal) }}
          </div>
        </div>

        <div
          v-if="editMode ? f.isNumber(vm.arising) : m.arising !== undefined"
          class="row justify-between"
        >
          <div>Contract Arising</div>
          <div class="text-warning">
            {{ f.currency(mOrVm.arising) }}
          </div>
        </div>

        <div
          v-if="editMode ? f.isNumber(vm.vatPercent) : m.vatPercent !== undefined"
          class="row justify-between"
        >
          <div>
            Contract VAT ({{ f.percent(mOrVm.vatPercent)
            }}{{
              (editMode ? f.isNumber(vm.secondVatPercent) : m.secondVatPercent !== undefined)
                ? `, ${f.percent(mOrVm.secondVatPercent)}`
                : ''
            }}{{
              (editMode ? f.isNumber(vm.vatAdjustment) : m.vatAdjustment !== undefined)
                ? `, ${mOrVm.vatAdjustment > 0 ? '+' : ''}${f.currency(mOrVm.vatAdjustment)}`
                : ''
            }})
          </div>
          <div class="text-warning">
            {{ f.currency(mcOrVmc.salesContractVat(mOrVm)) }}
          </div>
        </div>

        <div class="row justify-between">
          <div>Contract Total</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(mcOrVmc.salesContractTotal(mOrVm)) }}
            </strong>
          </div>
        </div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section>
        <div class="row justify-between">
          <div>Subtotal Balance</div>
          <div class="text-warning">
            {{ f.currency(mcOrVmc.salesContractSubtotalBalance(mOrVm)) }}
          </div>
        </div>

        <div class="row justify-between">
          <div>VAT Balance</div>
          <div class="text-warning">
            {{ f.currency(mcOrVmc.salesContractVatBalance(mOrVm)) }}
          </div>
        </div>

        <div class="row justify-between">
          <div>Total Balance</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(mcOrVmc.salesContractBalance(mOrVm)) }}
            </strong>
          </div>
        </div>
      </q-card-section>
    </div>
  </q-card>
</template>
