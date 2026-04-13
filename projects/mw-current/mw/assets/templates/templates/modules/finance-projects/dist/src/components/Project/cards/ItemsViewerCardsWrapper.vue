<script setup lang="ts">
import { Dark } from 'quasar';

import useProjectViewPage from 'composables/finance/project/useProjectViewPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth, listItemCardWidth } = requiredConfigEntries('cardWidth', 'listItemCardWidth');

const { hasRole } = useFirebaseAuth();

const {
  // Auto sort
  addItem,
  f,
  m,
  mc,
  readonlyMode,
} = useProjectViewPage(props.scopeName);
</script>

<template>
  <ListTransition :gutter="24" no-tag>
    <!-- Smoothing enter animation -->
    <div key="smoothing"></div>

    <template v-if="m.items.length === 0">
      <div v-if="!readonlyMode" key="addItem" class="text-center">
        <q-btn color="primary" label="Add Item" @click="addItem" />
      </div>
    </template>

    <div v-else key="items" class="q-gutter-y-md">
      <q-card
        class="q-mx-auto bg-accent"
        :class="Dark.isActive ? undefined : 'shadow-2'"
        dark
        style="width: 100%"
        :style="{ maxWidth: cardWidth + 'px' }"
      >
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-center">Items</div>
        </q-card-section>

        <q-card-section>
          <div class="row justify-between">
            <div>Total Quantity</div>
            <div class="text-warning">
              <strong>
                {{ mc.projectTotalQuantity(m) }}
              </strong>
            </div>
          </div>

          <div class="row justify-between">
            <div>Subtotal</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(mc.projectSubtotal(m)) }}
              </strong>
            </div>
          </div>

          <template v-if="m.discount !== undefined">
            <div class="row justify-between">
              <div>Discount</div>
              <div class="text-warning">
                {{ f.currency(m.discount, true) }}
              </div>
            </div>

            <div class="row justify-between">
              <div>After Discount</div>
              <div class="text-warning">
                <strong>
                  {{ f.currency(mc.projectVatExcludedTotal(m)) }}
                </strong>
              </div>
            </div>
          </template>

          <div v-if="m.vatPercent !== undefined" class="row">
            <div class="col-4">VAT ({{ f.percent(m.vatPercent) }})</div>
            <div class="col-4 text-warning text-right">
              {{ f.currency(m.vatableAmount) }}
            </div>
            <div class="col-4 text-warning text-right">
              {{ f.currency(mc.projectVat(m)) }}
            </div>
          </div>

          <div class="row justify-between">
            <div>Total</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(mc.projectTotal(m)) }}
              </strong>
            </div>
          </div>
        </q-card-section>

        <q-separator dark inset />

        <q-card-section>
          <div class="row justify-between">
            <div>Total Production Salary</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(mc.projectTotalProductionSalary(m)) }}
              </strong>
            </div>
          </div>

          <div
            v-if="hasRole('manager') && mc.projectPriceRatio(m) !== undefined"
            class="row justify-between"
          >
            <div>Price Ratio</div>
            <div class="text-warning">x{{ mc.projectPriceRatio(m) }}</div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Bottom padding to be consistent with editor -->
      <div class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs">
        <ExpandableCard
          v-for="(item, index) in m.items"
          :key="index"
          avatar-icon="fal fa-list-ol"
          avatar-size=""
          avatar-top
          body-class="text-center"
          :caption="item.description"
          :header-background-color="Dark.isActive ? 'grey-8' : 'grey-4'"
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :title="item.title"
        >
          <template #side>
            <q-item-label v-if="item.number" caption class="text-overline">
              #{{ item.number }}
              <TopTooltip>Number</TopTooltip>
            </q-item-label>

            <div class="q-mt-xs">
              <q-avatar v-if="item.isProductionOnly" color="accent" size="sm">
                <q-icon class="q-my-xs" color="white" name="fal fa-thunderstorm" />
                <TopTooltip>Production Only</TopTooltip>
              </q-avatar>
              <q-avatar v-if="item.isFinanceOnly && !item.isQuotationOnly" color="accent" size="sm">
                <q-icon class="q-my-xs" color="white" name="fal fa-usd-circle" />
                <TopTooltip>Finance Only</TopTooltip>
              </q-avatar>
              <q-avatar v-if="item.isQuotationOnly" color="accent" size="sm">
                <q-icon class="q-my-xs" color="white" name="fal fa-file-invoice" />
                <TopTooltip>Quotation Only</TopTooltip>
              </q-avatar>
            </div>
          </template>

          <template #body>
            <div v-if="!item.isFinanceOnly" class="text-subtitle1 text-uppercase">
              <span>
                {{ item.productType }}
                <TopTooltip>Product Type</TopTooltip>
              </span>
              <q-badge align="top" color="green" text-color="white">
                {{ f.currency(mc.itemProductionSalaryAmount(item)) }}
                <TopTooltip>Production Salary Amount</TopTooltip>
              </q-badge>
            </div>

            <template v-if="item.unitPrice != undefined">
              <q-chip class="q-mx-none" color="purple" size="sm" text-color="white">
                {{ f.currency(item.unitPrice) }}
                <TopTooltip>Unit Price</TopTooltip>
              </q-chip>

              <q-chip color="purple" text-color="white">
                <q-avatar color="warning" text-color="dark">
                  x{{ item.quantity }}
                  <TopTooltip>Quantity</TopTooltip>
                </q-avatar>
                <span>
                  = {{ f.currency(mc.itemAmount(item)) }}
                  <TopTooltip>Amount</TopTooltip>
                </span>
              </q-chip>
            </template>
          </template>
        </ExpandableCard>
      </div>
    </div>
  </ListTransition>
</template>
