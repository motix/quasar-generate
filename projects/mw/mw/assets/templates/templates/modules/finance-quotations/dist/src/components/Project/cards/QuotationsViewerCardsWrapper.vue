<script setup lang="ts">
// sort-imports-ignore

import { Dark } from 'quasar';

import useProjectViewPage_Quotations from 'composables/finance/project/useProjectViewPage_Quotations.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

// <% if (config.hasModule('finance-project-invoices')) { %>•+ finance-project-invoices
import InvoiceViewerCardWrapper from 'components/Project/cards/InvoiceViewerCardWrapper.vue';
// •- /finance-project-invoices<% } else { %>•! finance-project-invoices absent<% } %>

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth, listItemCardWidth } = requiredConfigEntries('cardWidth', 'listItemCardWidth');

const {
  // Auto sort
  f,
  firstQuotationGenerating,
  generateQuotation,
  hasGenerateQuotation,
  m,
  onQuotationClick,
  qmc,
  readonlyMode,
} = useProjectViewPage_Quotations(props.scopeName);
</script>

<template>
  <ListTransition :gutter="24" no-tag>
    <!-- Smoothing enter animation -->
    <div key="smoothing"></div>

    <template v-if="m.quotations.length === 0 || firstQuotationGenerating">
      <div v-if="!readonlyMode && hasGenerateQuotation" key="generateQuotation" class="text-center">
        <q-btn color="primary" label="Generate Quotation" @click="generateQuotation" />
      </div>
    </template>

    <div v-else key="quotations" class="q-gutter-y-md">
      <q-card
        class="q-mx-auto bg-accent"
        :class="Dark.isActive ? undefined : 'shadow-2'"
        dark
        style="width: 100%"
        :style="{ maxWidth: cardWidth + 'px' }"
      >
        <q-card-section>
          <div class="text-h6 text-center">Quotations</div>
        </q-card-section>
      </q-card>

      <!-- Bottom padding to be consistent with editor -->
      <div class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs">
        <ExpandableCard
          v-for="quotation in m.quotations"
          :key="quotation.code"
          avatar-icon="fal fa-file-invoice"
          avatar-size=""
          avatar-top
          clickable
          :external-link-url="`/quotations/${
            m.urlFriendlyName
          }/${quotation.code.replaceAll('.', '_')}`"
          header-background-color="primary"
          header-dark
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :title="quotation.code"
          title-top
          @click="onQuotationClick(quotation)"
        >
          <template #main>
            <StatusBadge class="q-mt-sm" revert-color :status="quotation.statusHelper" />
          </template>

          <template #side>
            <q-item-label caption>
              {{ f.currency(qmc.quotationTotal(quotation)) }}
              <TopTooltip>Total</TopTooltip>
            </q-item-label>
          </template>

          <!-- <% if (config.hasModule('finance-project-invoices')) { %>•+ finance-project-invoices -->
          <template #bezel-less>
            <InvoiceViewerCardWrapper :quotation="quotation" :scope-name="scopeName" />
          </template>
          <!-- •- /finance-project-invoices<% } else { %>•! finance-project-invoices absent<% } %> -->
        </ExpandableCard>
      </div>
    </div>
  </ListTransition>
</template>
