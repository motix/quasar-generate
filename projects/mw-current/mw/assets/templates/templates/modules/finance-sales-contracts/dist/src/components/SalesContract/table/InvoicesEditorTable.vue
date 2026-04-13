<script setup lang="ts">
import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

import StickyHeaders from 'components/shared/StickyHeaders.vue';

import InvoiceRow from './InvoiceRow.vue';
import InvoicesSummaryRows from './InvoicesSummaryRows.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  addGeneralInvoice,
  addInvoiceAllowed,
  addProject,
  generalInvoiceOptions,
  invoices,
  newGeneralInvoice,
  newProject,
  projectOptions,
} = $p;
</script>

<template>
  <q-expansion-item
    default-opened
    expand-icon-class="text-white"
    header-class="text-white text-h6 bg-accent"
    icon="fal fa-file-invoice-dollar"
    label="Projects / General Invoices"
    popup
  >
    <q-card>
      <StickyHeaders markup-table separated target="#invoicesViewerTable" />

      <q-markup-table id="invoicesViewerTable" bordered separator="cell" wrap-cells>
        <thead>
          <tr>
            <th class="q-table--col-auto-width">#</th>
            <th>Project</th>
            <th>Invoice</th>
            <th>Ref. Number</th>
            <th>Subtotal</th>
            <th>VAT</th>
            <th>Total</th>
            <th class="q-table--col-auto-width"></th>
          </tr>
        </thead>

        <tbody>
          <InvoiceRow
            v-for="(record, index) in invoices"
            :key="`${record.project?.id}_${record.invoice?.id}`"
            :invoice-index="index"
            :scope-name="scopeName"
          />

          <template v-if="addInvoiceAllowed">
            <tr>
              <!-- Number -->
              <td></td>

              <!-- Project -->
              <!-- Invoice -->
              <td colspan="2">
                <q-select
                  v-model="newProject"
                  label="New Project"
                  option-label="name"
                  option-value="id"
                  :options="projectOptions"
                />
              </td>

              <!-- Ref. Number -->
              <!-- Subtotal -->
              <!-- VAT -->
              <!-- Total -->
              <td colspan="4"></td>

              <!-- Buttons -->
              <td>
                <q-btn
                  color="primary"
                  :disable="!newProject"
                  icon="fal fa-plus"
                  outline
                  padding="sm"
                  @click="addProject"
                >
                  <TopTooltip>Add Project</TopTooltip>
                </q-btn>
              </td>
            </tr>

            <tr>
              <!-- Number -->
              <td></td>

              <!-- Project -->
              <!-- Invoice -->
              <td colspan="2">
                <q-select
                  v-model="newGeneralInvoice"
                  label="New General Invoice"
                  option-label="code"
                  option-value="id"
                  :options="generalInvoiceOptions"
                />
              </td>

              <!-- Ref. Number -->
              <!-- Subtotal -->
              <!-- VAT -->
              <!-- Total -->
              <td colspan="4"></td>

              <!-- Buttons -->
              <td>
                <q-btn
                  color="primary"
                  :disable="!newGeneralInvoice"
                  icon="fal fa-plus"
                  outline
                  padding="sm"
                  @click="addGeneralInvoice"
                >
                  <TopTooltip>Add General Invoice</TopTooltip>
                </q-btn>
              </td>
            </tr>
          </template>

          <InvoicesSummaryRows :scope-name="scopeName" />
        </tbody>
      </q-markup-table>
    </q-card>
  </q-expansion-item>
</template>
