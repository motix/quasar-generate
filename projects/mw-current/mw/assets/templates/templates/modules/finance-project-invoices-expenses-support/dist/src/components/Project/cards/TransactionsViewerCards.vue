<script setup lang="ts">
import type { Transaction } from 'models/finance/index.js';

import useProjectViewPage_ProjectInvoicesExpensesSupport from 'composables/finance/project/useProjectViewPage_ProjectInvoicesExpensesSupport.js';

// Props

const props = defineProps<{
  scopeName: string;
  transactions: Transaction[];
}>();

// Composables

const {
  // Auto sort
  f,
  tmc,
  viewTransactionUrl,
} = useProjectViewPage_ProjectInvoicesExpensesSupport(props.scopeName);
</script>

<template>
  <q-card-section class="q-gutter-y-xs text-caption">
    <div
      v-for="transaction in transactions"
      :key="transaction.code"
      class="row q-col-gutter-x-xs text-caption"
    >
      <div class="col-3">
        <div>
          {{ f.date(transaction.issueDate) }}
          <TopTooltip>Issue Date</TopTooltip>
        </div>
      </div>

      <div class="col-5">
        <ObjectLink
          color="primary"
          :label="transaction.code"
          size="sm"
          :to="`${viewTransactionUrl}/${transaction.code.replaceAll('.', '_')}`"
        >
          <template #icon>
            <StatusIcon class="q-mr-sm" icon="fal fa-exchange" :status="transaction.statusHelper" />
          </template>
        </ObjectLink>
      </div>

      <div class="col-4 text-right">
        <div>
          {{
            f.currency(
              tmc.transactionTotal(transaction) * (tmc.transactionNegative(transaction) ? -1 : 1),
            )
          }}
          <TopTooltip>Total {{ transaction.type }}</TopTooltip>
        </div>
      </div>
    </div>
  </q-card-section>
</template>
