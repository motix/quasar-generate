<script setup lang="ts">
import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import useMultiViews from 'composables/useMultiViews.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

import ContractsCards from './cards/ContractsCards.vue';
import InvoicesViewerCards from './cards/InvoicesViewerCards.vue';
import VatInvoicesViewerCards from './cards/VatInvoicesViewerCards.vue';
import ContractsTable from './table/ContractsTable.vue';
import InvoicesViewerTable from './table/InvoicesViewerTable.vue';
import VatInvoicesViewerTable from './table/VatInvoicesViewerTable.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth } = requiredConfigEntries('cardWidth');

const { isTableView, isCardsView } = useMultiViews();

const { hasRole } = useFirebaseAuth();

const {
  // Auto sort
  addVatInvoice,
  f,
  freezed,
  invoices,
  m,
  mc,
  readonlyMode,
  sameGeneralInvoiceSalesContracts,
  sameProjectSalesContracts,
} = useSalesContractViewPage(props.scopeName);
</script>

<template>
  <div class="q-gutter-y-lg">
    <ExpandableCard
      avatar-icon="fal fa-file-signature"
      avatar-top
      body-class="q-col-gutter-sm row"
      class="q-mx-auto"
      header-background-color="primary"
      header-dark
      side-top
      :subtitle="f.date(m.signDate) || undefined"
      subtitle-tooltip="Sign Date"
      :title="m.code"
      title-full-width
      title-top
    >
      <template #main>
        <StatusBadge class="q-mt-md" revert-color :status="m.statusHelper" />
      </template>

      <template #side>
        <q-toggle
          v-model="m.isArchived"
          checked-icon="fal fa-box-taped"
          class="right-toggle"
          color="white"
          :disable="freezed || !hasRole('manager')"
          icon-color="primary"
          label="Archived"
          left-label
          unchecked-icon="fal fa-box-open"
        />

        <q-item-label caption>
          {{ f.currency(m.subTotal) }}
          <TopTooltip>Subtotal</TopTooltip>
        </q-item-label>
        <q-item-label v-if="m.arising !== undefined" caption>
          {{ f.currency(m.arising) }}
          <TopTooltip>Arising</TopTooltip>
        </q-item-label>
        <q-item-label v-if="m.vatPercent !== undefined" caption>
          ({{ f.percent(m.vatPercent)
          }}{{ m.secondVatPercent !== undefined ? `, ${f.percent(m.secondVatPercent)}` : ''
          }}{{
            m.vatAdjustment !== undefined
              ? `, ${m.vatAdjustment > 0 ? '+' : ''}${f.currency(m.vatAdjustment)}`
              : ''
          }})
          {{ f.currency(mc.salesContractVat(m)) }}
          <TopTooltip>VAT</TopTooltip>
        </q-item-label>
        <q-item-label caption>
          <strong>
            {{ f.currency(mc.salesContractTotal(m)) }}
          </strong>
          <TopTooltip>Total</TopTooltip>
        </q-item-label>
      </template>

      <template #body>
        <div class="col-6">
          <ObjectLink
            color="primary"
            icon="fal fa-user-crown"
            :label="m.customer.name"
            :to="`/customers/${m.customer.code}`"
          />
        </div>

        <div class="col-12">
          {{ m.content }}
        </div>
      </template>
    </ExpandableCard>

    <q-card
      v-if="m.notes !== undefined"
      class="q-mx-auto"
      style="width: 100%"
      :style="{ maxWidth: cardWidth + 'px' }"
    >
      <q-card-section
        class="text-caption text-italic"
        :class="{
          'bg-negative text-white': m.notes.startsWith('!'),
        }"
      >
        {{ m.notes }}
      </q-card-section>
    </q-card>

    <q-card
      v-if="m.unavailableProjectIds.length + m.unavailableGeneralInvoiceIds.length > 0"
      class="q-mx-auto"
      style="width: 100%"
      :style="{ maxWidth: cardWidth + 'px' }"
    >
      <q-card-section class="bg-negative text-white text-caption text-italic">
        <div v-if="m.unavailableProjectIds.length > 0">
          Unavailable Project IDs: {{ m.unavailableProjectIds.join(', ') }}
        </div>

        <div v-if="m.unavailableGeneralInvoiceIds.length > 0">
          Unavailable General Invoice IDs:
          {{ m.unavailableGeneralInvoiceIds.join(', ') }}
        </div>
      </q-card-section>
    </q-card>

    <FadeTransition>
      <div v-if="isTableView" key="tableView">
        <q-list class="rounded-list">
          <ListTransition no-tag>
            <!-- Same Project Sales Contracts -->

            <ContractsTable
              v-if="sameProjectSalesContracts.length > 0"
              key="sameProjectSalesContracts"
              :contracts="sameProjectSalesContracts"
              label="Same Project Sales Contracts"
              :scope-name="scopeName"
            />

            <!-- Same General Invoice Sales Contracts -->

            <ContractsTable
              v-if="sameGeneralInvoiceSalesContracts.length > 0"
              key="sameGeneralInvoiceSalesContracts"
              :contracts="sameGeneralInvoiceSalesContracts"
              label="Same General Invoice Sales Contracts"
              :scope-name="scopeName"
            />

            <!-- Invoices -->

            <InvoicesViewerTable
              v-if="invoices.length > 0"
              key="invoices"
              :scope-name="scopeName"
            />
          </ListTransition>

          <!-- VAT Invoices -->

          <FadeTransition>
            <template v-if="m.vatInvoices.length === 0">
              <q-item v-if="!readonlyMode" key="addVatInvoice" class="q-py-md">
                <div class="text-center full-width">
                  <q-btn color="primary" label="Add VAT Invoice" @click="addVatInvoice" />
                </div>
              </q-item>
            </template>

            <VatInvoicesViewerTable v-else key="vatInvoices" :scope-name="scopeName" />
          </FadeTransition>
        </q-list>
      </div>

      <div v-else-if="isCardsView" key="cardsView" class="q-gutter-y-lg q-mt-none">
        <ListTransition :gutter="16" no-tag>
          <!-- Same Project Sales Contracts -->

          <ContractsCards
            v-if="sameProjectSalesContracts.length > 0"
            key="sameProjectSalesContracts"
            :contracts="sameProjectSalesContracts"
            label="Same Project Sales Contracts"
            :scope-name="scopeName"
          />

          <!-- Same General Invoice Sales Contracts -->

          <ContractsCards
            v-if="sameGeneralInvoiceSalesContracts.length > 0"
            key="sameGeneralInvoiceSalesContracts"
            :contracts="sameGeneralInvoiceSalesContracts"
            label="Same General Invoice Sales Contracts"
            :scope-name="scopeName"
          />

          <!-- Invoices -->

          <InvoicesViewerCards v-if="invoices.length > 0" key="invoices" :scope-name="scopeName" />
        </ListTransition>

        <!-- VAT Invoices -->

        <FadeTransition>
          <template v-if="m.vatInvoices.length === 0">
            <div v-if="!readonlyMode" key="addVatInvoice" class="text-center">
              <q-btn color="primary" label="Add VAT Invoice" @click="addVatInvoice" />
            </div>
          </template>

          <VatInvoicesViewerCards v-else key="vatInvoices" :scope-name="scopeName" />
        </FadeTransition>
      </div>
    </FadeTransition>
  </div>
</template>
