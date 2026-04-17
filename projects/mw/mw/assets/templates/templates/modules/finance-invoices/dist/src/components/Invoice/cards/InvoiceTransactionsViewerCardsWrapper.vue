<script setup lang="ts">
import { Dark } from 'quasar';

import { useInvoiceViewPage } from 'composables/finance/invoice/useInvoiceEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth, listItemCardWidth } = requiredConfigEntries('cardWidth', 'listItemCardWidth');

const $p = useInvoiceViewPage(props.scopeName);
const {
  // Auto sort
  f,
  m,
  newTransactionUrl,
  onTransactionClick,
  readonlyMode,
  tmc,
  viewTransactionUrl,
} = $p;
</script>

<template>
  <FadeTransition>
    <template v-if="m.transactions.length === 0">
      <div v-if="!readonlyMode" key="addTransaction" class="text-center">
        <q-btn color="primary" label="Add Transaction" :to="newTransactionUrl" />
      </div>
    </template>

    <div v-else key="transactions" class="q-gutter-y-md">
      <q-card
        class="q-mx-auto bg-accent"
        :class="Dark.isActive ? undefined : 'shadow-2'"
        dark
        style="width: 100%"
        :style="{ maxWidth: cardWidth + 'px' }"
      >
        <q-card-section>
          <div class="text-h6 text-center">Transactions</div>
        </q-card-section>
      </q-card>

      <!-- Bottom padding to be consistent with editor -->
      <div class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs">
        <ExpandableCard
          v-for="transaction in m.transactions"
          :key="transaction.code"
          avatar-icon="fal fa-exchange"
          avatar-size=""
          avatar-top
          body-class="q-col-gutter-sm row"
          :caption="f.date(transaction.createDate) || undefined"
          caption-tooltip="Create Date"
          clickable
          :external-link-url="`${viewTransactionUrl}/${transaction.code.replaceAll('.', '_')}`"
          header-background-color="primary"
          header-dark
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="f.date(transaction.issueDate) || undefined"
          subtitle-tooltip="Issue Date"
          :title="transaction.code"
          title-top
          @click="onTransactionClick(transaction)"
        >
          <template #main>
            <StatusBadge class="q-mt-sm" revert-color :status="transaction.statusHelper" />
          </template>

          <template #side>
            <q-item-label caption>
              {{ transaction.type }}
              <TopTooltip>Type</TopTooltip>
            </q-item-label>

            <q-item-label caption>
              {{
                f.currency(
                  tmc.transactionTotal(transaction) *
                    (tmc.transactionNegative(transaction) ? -1 : 1),
                )
              }}
              <TopTooltip>Total</TopTooltip>
            </q-item-label>
          </template>

          <template #body>
            <div class="col-12 row justify-between">
              <div>
                <ObjectLink
                  color="primary"
                  icon="fal fa-user-crown"
                  :label="m.customer.name"
                  :to="`/customers/${m.customer.code}`"
                />
                <ObjectLink
                  v-if="
                    tmc.transactionHasSourceAccount(transaction) &&
                    !tmc.transactionNegative(transaction) &&
                    !!transaction.sourceFinanceAccount
                  "
                  color="primary"
                  icon="fal fa-piggy-bank"
                  :label="transaction.sourceFinanceAccount.name"
                  :to="`/finance-accounts/${transaction.sourceFinanceAccount.id}`"
                />
                <ObjectLink
                  v-if="
                    tmc.transactionHasDestinationAccount(transaction) &&
                    tmc.transactionNegative(transaction) &&
                    !!transaction.destinationFinanceAccount
                  "
                  color="primary"
                  icon="fal fa-piggy-bank"
                  :label="transaction.destinationFinanceAccount.name"
                  :to="`/finance-accounts/${transaction.destinationFinanceAccount.id}`"
                />
              </div>

              <div>
                <q-icon
                  v-if="!tmc.transactionNegative(transaction)"
                  name="fal fa-arrow-right-long"
                />
                <q-icon v-else name="fal fa-arrow-left-long" />
              </div>

              <div>
                <ObjectLink
                  v-if="
                    tmc.transactionHasSourceAccount(transaction) &&
                    tmc.transactionNegative(transaction) &&
                    !!transaction.sourceFinanceAccount
                  "
                  color="primary"
                  icon="fal fa-piggy-bank"
                  :label="transaction.sourceFinanceAccount.name"
                  :to="`/finance-accounts/${transaction.sourceFinanceAccount.id}`"
                />
                <ObjectLink
                  v-if="
                    tmc.transactionHasDestinationAccount(transaction) &&
                    !tmc.transactionNegative(transaction) &&
                    !!transaction.destinationFinanceAccount
                  "
                  color="primary"
                  icon="fal fa-piggy-bank"
                  :label="transaction.destinationFinanceAccount.name"
                  :to="`/finance-accounts/${transaction.destinationFinanceAccount.id}`"
                />
              </div>
            </div>

            <div class="col-12 text-body2">
              {{ transaction.content }}
            </div>
          </template>
        </ExpandableCard>
      </div>
    </div>
  </FadeTransition>
</template>
