<script setup lang="ts">
import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  f,
  vm,
  vmc,
} = $p;
</script>

<template>
  <tr>
    <!-- Number -->
    <td class="text-right">1</td>

    <!-- Sign Date -->
    <td>
      {{ f.dateViewModel(vm.signDate, '[Sign Date]') }}
    </td>

    <!-- Code -->
    <td>
      <ObjectLink :label="vm.code || '[Code]'">
        <template #icon>
          <StatusIcon
            class="q-mr-sm"
            icon="fal fa-file-signature fa-fw"
            :status="vm.statusHelper"
          />
        </template>
      </ObjectLink>
    </td>

    <!-- Content -->
    <td>
      {{ vm.content || '[Content]' }}
    </td>

    <!-- Subtotal -->
    <td class="text-right">
      {{ f.isNumber(vm.subTotal) ? f.currency(vm.subTotal) : '[Subtotal]' }}
    </td>

    <!-- Arising -->
    <td class="text-right">
      <template v-if="f.isNumber(vm.arising)">
        {{ f.currency(vm.arising) }}
      </template>
    </td>

    <!-- VAT -->
    <td>
      <div v-if="f.isNumber(vm.vatPercent)" class="row justify-between no-wrap q-gutter-x-xs">
        <span>({{ f.percent(vm.vatPercent) }})</span>
        {{ f.currency(vmc.salesContractVat(vm)) }}
      </div>
    </td>

    <!-- Total -->
    <td class="text-right">
      {{ f.currency(vmc.salesContractTotal(vm)) }}
    </td>
  </tr>
</template>
