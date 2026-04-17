<script setup lang="ts">
import { useTemplateRef } from 'vue';

import useTransactionEditPage_ProjectTransactions from 'composables/finance/transaction/useTransactionEditPage_ProjectTransactions.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import TransactionEditorMainFields from 'components/Transaction/TransactionEditorMainFields.vue';

// Private

function validateTransactionEditorMain() {
  !transactionEditorMainFieldsRef.value &&
    (() => {
      throw new Error('transactionEditorMainFieldsRef not specified');
    })();

  return transactionEditorMainFieldsRef.value.validate();
}

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useTransactionEditPage_ProjectTransactions(props.scopeName);
const {
  // Auto sort
  editorReady,
  expense,
  f,
  invoice,
  pvm,
  quotation,
  vm,
  vmc,
} = $p;

// Data

const transactionEditorMainFieldsRef = useTemplateRef('transactionEditorMainFields');

// Expose

defineExpose({
  validate: validateTransactionEditorMain,
});
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-exchange"
    avatar-top
    body-cell-gutter
    :body-loading="!editorReady"
    :caption="f.dateViewModel(vm.createDate) || undefined"
    caption-tooltip="Create Date"
    class="q-mx-auto"
    :expandable="!$p.isNewPage($p)"
    header-background-color="primary"
    header-dark
    side-top
    :subtitle="f.dateViewModel(vm.issueDate, '[Issue Date]') || undefined"
    subtitle-tooltip="Issue Date"
    :title="$p.isNewPage($p) ? '[Auto-generated Code]' : vm.code"
    title-top
  >
    <template #main>
      <StatusBadge class="q-mt-md" revert-color :status="vm.statusHelper" />
    </template>

    <template #side>
      <q-item-label>
        {{ vm.type || '[Type]' }}
        <TopTooltip>Type</TopTooltip>
      </q-item-label>
    </template>

    <template #bezel-less-top>
      <q-card-section class="q-col-gutter-sm row">
        <div class="col-12">
          <ObjectLink color="primary" :label="pvm.name" :to="`/projects/${pvm.urlFriendlyName}`">
            <template #icon>
              <StatusIcon class="q-mr-sm" icon="fal fa-briefcase" :status="pvm.statusHelper" />
            </template>
          </ObjectLink>
        </div>

        <div class="col-12 row justify-between">
          <div>
            <template v-if="vmc.transactionHasCustomer(vm)">
              <ObjectLink
                v-if="!!invoice"
                color="primary"
                icon="fal fa-user-crown"
                :label="invoice.customer!.name"
                :to="`/customers/${invoice.customer!.code}`"
              />
              <template v-else>[Customer]</template>
            </template>

            <template v-if="vmc.transactionHasSourceAccount(vm) && !vmc.transactionNegative(vm)">
              <ObjectLink
                v-if="!!vm.sourceFinanceAccount"
                color="primary"
                icon="fal fa-piggy-bank"
                :label="vm.sourceFinanceAccount.name"
                :to="`/finance-accounts/${vm.sourceFinanceAccount.id}`"
              />
              <template v-else>[Source Account]</template>
            </template>

            <template
              v-if="vmc.transactionHasDestinationAccount(vm) && vmc.transactionNegative(vm)"
            >
              <ObjectLink
                v-if="!!vm.destinationFinanceAccount"
                color="primary"
                icon="fal fa-piggy-bank"
                :label="vm.destinationFinanceAccount.name"
                :to="`/finance-accounts/${vm.destinationFinanceAccount.id}`"
              />
              <template v-else>[Destination Account]</template>
            </template>
          </div>

          <div>
            <q-icon v-if="!vmc.transactionNegative(vm)" name="fal fa-arrow-right-long" />
            <q-icon v-else name="fal fa-arrow-left-long" />
          </div>

          <div>
            <template v-if="vmc.transactionHasSupplier(vm)">
              <ObjectLink
                v-if="!!expense"
                color="primary"
                icon="fal fa-building"
                :label="expense.supplier!.name"
                :to="`/customers/${expense.supplier!.code}`"
              />
              <template v-else>[Supplier]</template>
            </template>

            <template v-if="vmc.transactionHasSourceAccount(vm) && vmc.transactionNegative(vm)">
              <ObjectLink
                v-if="!!vm.sourceFinanceAccount"
                color="primary"
                icon="fal fa-piggy-bank"
                :label="vm.sourceFinanceAccount.name"
                :to="`/finance-accounts/${vm.sourceFinanceAccount.id}`"
              />
              <template v-else>[Source Account]</template>
            </template>

            <template
              v-if="vmc.transactionHasDestinationAccount(vm) && !vmc.transactionNegative(vm)"
            >
              <ObjectLink
                v-if="!!vm.destinationFinanceAccount"
                color="primary"
                icon="fal fa-piggy-bank"
                :label="vm.destinationFinanceAccount.name"
                :to="`/finance-accounts/${vm.destinationFinanceAccount.id}`"
              />
              <template v-else>[Destination Account]</template>
            </template>
          </div>
        </div>

        <div class="col-6">
          <ObjectLink
            v-if="!!invoice"
            color="primary"
            :label="invoice.code"
            :to="`/project-invoices/${pvm.urlFriendlyName}/${invoice.code.replaceAll('.', '_')}`"
          >
            <template #icon>
              <StatusIcon
                class="q-mr-sm"
                icon="fal fa-file-invoice-dollar"
                :status="invoice.statusHelper"
              />
            </template>
          </ObjectLink>

          <ObjectLink
            v-if="!!expense"
            color="primary"
            :label="expense.code"
            :to="`/project-expenses/${pvm.urlFriendlyName}/${expense.code.replaceAll('.', '_')}`"
          >
            <template #icon>
              <StatusIcon class="q-mr-sm" icon="fal fa-receipt" :status="expense.statusHelper" />
            </template>
          </ObjectLink>
        </div>

        <div class="col-6 text-right">
          <ObjectLink
            v-if="!!quotation"
            color="primary"
            :label="quotation.code"
            :to="`/quotations/${pvm.urlFriendlyName}/${quotation.code.replaceAll('.', '_')}`"
          >
            <template #icon>
              <StatusIcon
                class="q-mr-sm"
                icon="fal fa-file-invoice"
                :status="quotation.statusHelper"
              />
            </template>
          </ObjectLink>
        </div>
      </q-card-section>

      <q-separator />
    </template>

    <template #body>
      <TransactionEditorMainFields ref="transactionEditorMainFields" :scope-name="scopeName" />
    </template>
  </ExpandableCard>
</template>
