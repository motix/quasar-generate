<script setup lang="ts">
import { Dark } from 'quasar';

import { useExpenseViewPage } from 'composables/finance/expense/useExpenseEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth, listItemCardWidth } = requiredConfigEntries('cardWidth', 'listItemCardWidth');

const {
  // Auto sort
  f,
  m,
  mc,
} = useExpenseViewPage(props.scopeName);
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
              {{ mc.expenseTotalQuantity(m) }}
            </strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Subtotal</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(mc.expenseSubtotal(m)) }}
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
                {{ f.currency(mc.expenseVatExcludedTotal(m)) }}
              </strong>
            </div>
          </div>
        </template>

        <template v-if="m.vatPercent !== undefined">
          <template v-if="m.secondVatPercent === undefined || m.secondVatableAmount === undefined">
            <div class="row">
              <div class="col-4">VAT ({{ f.percent(m.vatPercent) }})</div>
              <div class="col-4 text-warning text-right">
                {{ f.currency(m.vatableAmount) }}
              </div>
              <div class="col-4 text-warning text-right">
                {{ f.currency(mc.expenseVat(m)) }}
              </div>
            </div>
          </template>

          <div v-else class="row">
            <div class="col-4">
              <div>VAT 1 ({{ f.percent(m.vatPercent) }})</div>
              <div>VAT 2 ({{ f.percent(m.secondVatPercent) }})</div>
            </div>
            <div class="col-4 text-warning text-right">
              <div>
                {{
                  f.currency(
                    (m.vatableAmount === undefined
                      ? mc.expenseVatExcludedTotal(m)
                      : m.vatableAmount) - m.secondVatableAmount,
                  )
                }}
              </div>
              <div>
                {{ f.currency(m.secondVatableAmount) }}
              </div>
            </div>
            <div class="col-4 text-warning text-right">
              {{ f.currency(mc.expenseVat(m)) }}
            </div>
          </div>

          <div v-if="m.vatAdjustment !== undefined" class="row">
            <div class="col-4">VAT Adjustment</div>
            <div class="col-4 text-warning text-right">
              {{ m.vatAdjustment > 0 ? '+' : '' }}{{ f.currency(m.vatAdjustment) }}
            </div>
          </div>
        </template>

        <div class="row justify-between">
          <div>Total</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(mc.expenseTotal(m)) }}
            </strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Total Payment</div>
          <div class="text-warning">
            {{ f.currency(mc.expenseTotalPayment(m), true) }}
          </div>
        </div>

        <div class="row justify-between">
          <div>Balance</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(mc.expenseBalance(m)) }}
            </strong>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Bottom padding to be consistent with editor -->
    <div class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs">
      <ExpandableCard
        v-for="(detail, index) in m.details"
        :key="index"
        avatar-icon="fal fa-list-ol"
        avatar-size=""
        avatar-top
        body-class="text-center"
        :header-background-color="Dark.isActive ? 'grey-8' : 'grey-4'"
        side-top
        :style="{ maxWidth: listItemCardWidth + 'px' }"
        :title="detail.content"
      >
        <template #side>
          <q-item-label caption class="text-overline">
            #{{ index + 1 }}
            <TopTooltip>Number</TopTooltip>
          </q-item-label>
        </template>

        <template #body>
          <q-chip class="q-mx-none" color="purple" size="sm" text-color="white">
            {{ f.currency(detail.unitPrice) }}
            <TopTooltip>Unit Price</TopTooltip>
          </q-chip>

          <q-chip color="purple" text-color="white">
            <q-avatar color="warning" text-color="dark">
              x{{ detail.quantity }}
              <TopTooltip>Quantity</TopTooltip>
            </q-avatar>
            <span>
              = {{ f.currency(mc.expenseDetailAmount(detail)) }}
              <TopTooltip>Amount</TopTooltip>
            </span>
          </q-chip>
        </template>
      </ExpandableCard>
    </div>
  </div>
</template>
