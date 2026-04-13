<script setup lang="ts">
import type { SalesContract } from 'models/finance/index.js';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Props

const props = defineProps<{
  scopeName: string;
  contractIndex: number;
  contract: SalesContract;
}>();

// Composables

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  f,
  mc,
} = $p;
</script>

<template>
  <tr>
    <!-- Number -->
    <td class="text-right">
      {{ contractIndex + 1 }}
    </td>

    <!-- Sign Date -->
    <td>
      {{ f.date(contract.signDate) }}
    </td>

    <!-- Code -->
    <td>
      <ObjectLink
        :color="contractIndex === 0 ? undefined : 'primary'"
        :label="contract.code"
        :to="contractIndex === 0 ? undefined : `/sales-contracts/${contract.urlFriendlyCode}`"
      >
        <template #icon>
          <StatusIcon
            class="q-mr-sm"
            icon="fal fa-file-signature fa-fw"
            :status="contract.statusHelper"
          />
        </template>
      </ObjectLink>
    </td>

    <!-- Content -->
    <td>
      {{ contract.content }}
    </td>

    <!-- Subtotal -->
    <td class="text-right">
      {{ f.currency(contract.subTotal) }}
    </td>

    <!-- Arising -->
    <td class="text-right">
      <template v-if="contract.arising !== undefined">
        {{ f.currency(contract.arising) }}
      </template>
    </td>

    <!-- VAT -->
    <td>
      <div
        v-if="contract.vatPercent !== undefined"
        class="row justify-between no-wrap q-gutter-x-xs"
      >
        <span>({{ f.percent(contract.vatPercent) }})</span>
        {{ f.currency(mc.salesContractVat(contract)) }}
      </div>
    </td>

    <!-- Total -->
    <td class="text-right">
      {{ f.currency(mc.salesContractTotal(contract)) }}
    </td>
  </tr>
</template>
