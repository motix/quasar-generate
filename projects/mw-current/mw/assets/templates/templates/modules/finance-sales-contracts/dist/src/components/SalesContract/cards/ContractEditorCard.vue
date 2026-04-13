<script setup lang="ts">
import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { listItemCardWidth } = requiredConfigEntries('listItemCardWidth');

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  f,
  vm,
  vmc,
} = $p;
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-file-signature"
    avatar-size=""
    avatar-top
    body-class="text-caption"
    header-background-color="primary"
    header-dark
    side-top
    :style="{ maxWidth: listItemCardWidth + 'px' }"
    :subtitle="f.dateViewModel(vm.signDate, '[Sign Date]') || undefined"
    subtitle-tooltip="Sign Date"
    :title="vm.code || '[Code]'"
    title-full-width
    title-top
  >
    <template #main>
      <StatusBadge class="q-mt-sm" revert-color :status="vm.statusHelper" />
    </template>

    <template #side>
      <q-item-label caption class="text-overline">#1</q-item-label>
    </template>

    <template #bezel-less-top>
      <q-card-section class="text-body2">
        {{ vm.content || '[Content]' }}
      </q-card-section>

      <q-separator />
    </template>

    <template #body>
      <div class="row justify-between">
        <div>Subtotal</div>
        <div>
          {{ f.isNumber(vm.subTotal) ? f.currency(vm.subTotal) : '[Subtotal]' }}
        </div>
      </div>
      <q-slide-transition>
        <div v-if="f.isNumber(vm.arising)" class="row justify-between">
          <div>Arising</div>
          <div>
            {{ f.currency(vm.arising) }}
          </div>
        </div>
      </q-slide-transition>
      <q-slide-transition>
        <div v-if="f.isNumber(vm.vatPercent)" class="row justify-between">
          <div>VAT ({{ f.percent(vm.vatPercent) }})</div>
          <div>
            {{ f.currency(vmc.salesContractVat(vm)) }}
          </div>
        </div>
      </q-slide-transition>
      <div class="row justify-between">
        <div>
          <strong>Total</strong>
        </div>
        <div>
          <strong>{{ f.currency(vmc.salesContractTotal(vm)) }}</strong>
        </div>
      </div>
    </template>
  </ExpandableCard>
</template>
