<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';

import { Dark } from 'quasar';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import InvoiceCard from './InvoiceCard.vue';
import InvoicesSummaryCard from './InvoicesSummaryCard.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { listItemCardWidth } = requiredConfigEntries('listItemCardWidth');

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
  setGeneralInvoiceRef,
  setProjectInvoiceRef,
} = $p;

// Methods

function elConvert(el: Element | ComponentPublicInstance | null) {
  return el as ComponentPublicInstance | null;
}
</script>

<template>
  <div class="q-gutter-y-md">
    <InvoicesSummaryCard :scope-name="scopeName" />

    <ListTransition
      class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs"
      color-effect
      :gutter="16"
    >
      <InvoiceCard
        v-for="(record, index) in invoices"
        :key="`${record.project?.id}_${record.invoice?.id}`"
        :ref="
          (el) => {
            setProjectInvoiceRef(elConvert(el), index);
            setGeneralInvoiceRef(elConvert(el), index);
          }
        "
        :invoice-index="index"
        :scope-name="scopeName"
      />

      <template v-if="addInvoiceAllowed">
        <q-card
          key="addProject"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          style="width: 100%"
          :style="{ maxWidth: listItemCardWidth + 'px' }"
        >
          <q-card-section>
            <q-select
              v-model="newProject"
              dense
              hide-bottom-space
              label="New Project"
              option-label="name"
              option-value="id"
              :options="projectOptions"
            />
          </q-card-section>

          <q-separator inset />

          <q-card-actions align="around">
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
          </q-card-actions>
        </q-card>

        <q-card
          key="addGeneralInvoice"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          style="width: 100%"
          :style="{ maxWidth: listItemCardWidth + 'px' }"
        >
          <q-card-section>
            <q-select
              v-model="newGeneralInvoice"
              dense
              hide-bottom-space
              label="New General Invoice"
              option-label="code"
              option-value="id"
              :options="generalInvoiceOptions"
            />
          </q-card-section>

          <q-separator inset />

          <q-card-actions align="around">
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
          </q-card-actions>
        </q-card>
      </template>
    </ListTransition>
  </div>
</template>
