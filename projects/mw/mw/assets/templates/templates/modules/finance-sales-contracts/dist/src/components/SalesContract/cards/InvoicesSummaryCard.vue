<script setup lang="ts">
import { computed } from 'vue';

import { Dark } from 'quasar';

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
  sameGeneralInvoiceSalesContracts,
  sameProjectSalesContracts,
  vm,
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
  <q-card
    class="q-mx-auto bg-accent"
    :class="Dark.isActive ? undefined : 'shadow-2'"
    dark
    style="width: 100%"
    :style="{ maxWidth: cardWidth + 'px' }"
  >
    <q-card-section class="q-pb-none">
      <div class="text-h6 text-center">Projects / General Invoices</div>
    </q-card-section>

    <q-card-section>
      <div class="row justify-between">
        <div>Subtotal</div>
        <div class="text-warning">
          {{ f.currency(mcOrVmc.salesContractInvoicesSubtotal(mOrVm)) }}
        </div>
      </div>

      <div class="row justify-between">
        <div>VAT</div>
        <div class="text-warning">
          {{ f.currency(mcOrVmc.salesContractInvoicesVat(mOrVm)) }}
        </div>
      </div>

      <div class="row justify-between">
        <div>Total</div>
        <div class="text-warning">
          <strong>
            {{ f.currency(mcOrVmc.salesContractInvoicesTotal(mOrVm)) }}
          </strong>
        </div>
      </div>
    </q-card-section>

    <q-separator dark inset />

    <q-card-section
      v-if="sameProjectSalesContracts.length === 0 && sameGeneralInvoiceSalesContracts.length === 0"
    >
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

    <q-card-section v-else>
      <div class="row justify-between">
        <div>Contracts Subtotal</div>
        <div class="text-warning">
          {{
            f.currency(
              mcOrVmc.sameInvoiceSalesContractsSubtotal(mOrVm, [
                ...sameProjectSalesContracts,
                ...sameGeneralInvoiceSalesContracts,
              ]),
            )
          }}
        </div>
      </div>

      <div class="row justify-between">
        <div>Contracts Arising</div>
        <div class="text-warning">
          {{
            f.currency(
              mcOrVmc.sameInvoiceSalesContractsArising(mOrVm, [
                ...sameProjectSalesContracts,
                ...sameGeneralInvoiceSalesContracts,
              ]),
            )
          }}
        </div>
      </div>

      <div class="row justify-between">
        <div>Contracts VAT</div>
        <div class="text-warning">
          {{
            f.currency(
              mcOrVmc.sameInvoiceSalesContractsVat(mOrVm, [
                ...sameProjectSalesContracts,
                ...sameGeneralInvoiceSalesContracts,
              ]),
            )
          }}
        </div>
      </div>

      <div class="row justify-between">
        <div>Contracts Total</div>
        <div class="text-warning">
          <strong>
            {{
              f.currency(
                mcOrVmc.sameInvoiceSalesContractsTotal(mOrVm, [
                  ...sameProjectSalesContracts,
                  ...sameGeneralInvoiceSalesContracts,
                ]),
              )
            }}
          </strong>
        </div>
      </div>
    </q-card-section>

    <q-separator dark inset />

    <q-card-section>
      <div class="row justify-between">
        <div>Subtotal Difference</div>
        <div class="text-warning">
          {{
            f.currency(
              mcOrVmc.salesContractSubtotalDifference(mOrVm, [
                ...sameProjectSalesContracts,
                ...sameGeneralInvoiceSalesContracts,
              ]),
            )
          }}
        </div>
      </div>

      <div class="row justify-between">
        <div>VAT Difference</div>
        <div class="text-warning">
          {{
            f.currency(
              mcOrVmc.salesContractVatDifference(mOrVm, [
                ...sameProjectSalesContracts,
                ...sameGeneralInvoiceSalesContracts,
              ]),
            )
          }}
        </div>
      </div>

      <div class="row justify-between">
        <div>Total Difference</div>
        <div class="text-warning">
          <strong>
            {{
              f.currency(
                mcOrVmc.salesContractDifference(mOrVm, [
                  ...sameProjectSalesContracts,
                  ...sameGeneralInvoiceSalesContracts,
                ]),
              )
            }}
          </strong>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
