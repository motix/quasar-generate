<script setup lang="ts">
import { markRaw, watchEffect } from 'vue';

import { object } from 'yup';

import { urlFriendlyNormalizeString } from 'utils/normalization.js';
import {
  asIsRequired,
  dateRequired,
  integerOptional,
  integerRequired,
  percentOptionalMinZeroMax,
  stringRequired,
} from 'utils/validation.js';

import type { CustomerLite } from 'models/finance/index.js';

import { validateUniqueField } from 'services/firebase-firestore/validation.js';

import useSalesContractEditPage from 'composables/finance/sales-contract/useSalesContractEditPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

// Private

const validationSchema = markRaw(
  object({
    code: stringRequired('Code').test({
      message: 'Code is already taken',
      test: async (value) =>
        !value ||
        ((await validateUniqueField('finance_salesContracts', 'code', value, vm.value.id)) &&
          (await validateUniqueField(
            'finance_salesContracts',
            'urlFriendlyCode',
            vm.value.urlFriendlyCode,
            vm.value.id,
          ))),
    }),
    signDate: dateRequired('Sign Date'),
    content: stringRequired('Content'),
    subTotal: integerRequired('Subtotal').min(0),
    arising: integerOptional('Arising'),
    vatPercent: percentOptionalMinZeroMax('VAT'),
    secondVatPercent: percentOptionalMinZeroMax('Second VAT').transform((value) =>
      !$p.f.isNumber($p.vm.value.vatPercent) ? null : value,
    ),
    secondVatableAmount: integerOptional('Second VAT-able Amount')
      .min(1)
      .transform((value) => (!$p.f.isNumber($p.vm.value.vatPercent) ? null : value)),
    vatAdjustment: integerOptional('VAT Adjustment')
      .test({
        message: 'VAT Adjustment cannot be zero',
        test: (value) => value === null || value !== 0,
      })
      .transform((value) => (!$p.f.isNumber($p.vm.value.vatPercent) ? null : value)),
    customer: asIsRequired<CustomerLite>('Customer'),
  }),
);

// Props

const props = defineProps<{
  scopeName: string;
  newPage: boolean;
}>();

// Composables

const { hasRole } = useFirebaseAuth();

const $p = useSalesContractEditPage(props.scopeName);
const {
  // Auto sort
  customerOptions,
  dirty,
  editorReady,
  f,
  filterCustomerOptions,
  vm,
  vmc,
} = $p;

// Private Executions

const { validate } = $p.useValidationForm(
  validationSchema,
  vm.value,
  'code',
  'signDate',
  'content',
  'subTotal',
  'arising',
  'vatPercent',
  'customer',
);

// Watch

watchEffect(() => {
  vm.value.urlFriendlyCode = urlFriendlyNormalizeString(
    vm.value.code.replaceAll('_', '-'), // '_' will be replaced to '.' when retrieving findKey
  ) as string;
});

// Expose

defineExpose({
  validate: async () => (await validate()).valid,
});
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-file-signature"
    avatar-top
    body-cell-gutter
    :body-loading="!editorReady"
    class="q-mx-auto"
    :expandable="!newPage"
    header-background-color="primary"
    header-dark
    side-top
    :subtitle="f.dateViewModel(vm.signDate, '[Sign Date]') || undefined"
    subtitle-tooltip="Sign Date"
    :title="vm.code || '[Code]'"
    title-full-width
    title-top
  >
    <template #main>
      <StatusBadge class="q-mt-md" revert-color :status="vm.statusHelper" />
    </template>

    <template #side>
      <q-toggle
        v-model="vm.isArchived"
        checked-icon="fal fa-box-taped"
        class="right-toggle"
        color="white"
        :disable="!hasRole('manager')"
        icon-color="primary"
        label="Archived"
        left-label
        unchecked-icon="fal fa-box-open"
        @update:model-value="dirty"
      >
      </q-toggle>

      <ListTransition>
        <q-item-label key="subTotal" caption>
          {{ f.isNumber(vm.subTotal) ? f.currency(vm.subTotal) : '[Subtotal]' }}
          <TopTooltip v-if="f.isNumber(vm.subTotal)">Subtotal</TopTooltip>
        </q-item-label>
        <q-item-label v-if="f.isNumber(vm.arising)" key="arising" caption>
          {{ f.currency(vm.arising) }}
          <TopTooltip>Arising</TopTooltip>
        </q-item-label>
        <q-item-label v-if="f.isNumber(vm.vatPercent)" key="vat" caption>
          ({{ f.percent(vm.vatPercent)
          }}{{ f.isNumber(vm.secondVatPercent) ? `, ${f.percent(vm.secondVatPercent)}` : ''
          }}{{
            f.isNumber(vm.vatAdjustment)
              ? `, ${vm.vatAdjustment > 0 ? '+' : ''}${f.currency(vm.vatAdjustment)}`
              : ''
          }})
          {{ f.currency(vmc.salesContractVat(vm)) }}
          <TopTooltip>VAT</TopTooltip>
        </q-item-label>
        <q-item-label key="total" caption>
          <strong>
            {{ f.currency(vmc.salesContractTotal(vm)) }}
          </strong>
          <TopTooltip>Total</TopTooltip>
        </q-item-label>
      </ListTransition>
    </template>

    <template #bezel-less-top>
      <q-card-section>
        <ObjectLink
          v-if="vm.customer"
          color="primary"
          icon="fal fa-user-crown"
          :label="vm.customer.name"
          :to="`/customers/${vm.customer.code}`"
        />
        <template v-else>[Customer]</template>
      </q-card-section>

      <q-separator />
    </template>

    <template #body>
      <QDateInputVal
        v-model="vm.signDate"
        class="col-6"
        label="Sign Date"
        name="signDate"
        @update:model-value="dirty"
      />

      <QInputVal
        v-model="vm.code"
        class="col-6"
        label="Code"
        name="code"
        @update:model-value="dirty"
      />

      <QSelectVal
        v-model="vm.customer"
        class="col-6"
        fill-input
        hide-selected
        label="Customer"
        name="customer"
        option-label="name"
        option-value="id"
        :options="customerOptions"
        use-input
        @filter="filterCustomerOptions"
        @update:model-value="dirty"
      />

      <QInputVal
        v-model="vm.content"
        autogrow
        class="col-12"
        label="Content"
        name="content"
        @update:model-value="dirty"
      />

      <ThousandInputVal
        v-model="vm.subTotal"
        class="col-6"
        :hint="f.currency(vm.subTotal) || undefined"
        input-class="text-right"
        label="Subtotal"
        name="subTotal"
        @update:model-value="dirty"
      />

      <ThousandInputVal
        v-model="vm.arising"
        class="col-6"
        clearable
        :hint="`${f.currency(vm.arising) || ''} (optional)`"
        input-class="text-right"
        label="Arising"
        name="arising"
        @update:model-value="dirty"
      />

      <PercentInputVal
        v-model="vm.vatPercent"
        class="col-6"
        clearable
        hint="(optional)"
        input-class="text-right"
        label="VAT Rate"
        name="vatPercent"
        @update:model-value="dirty"
      />

      <div class="flex-break q-pt-none"></div>

      <PercentInputVal
        v-model="vm.secondVatPercent"
        class="col-6"
        clearable
        :disable="!f.isNumber(vm.vatPercent)"
        hint="(optional)"
        :input-class="{
          'text-right': true,
          'text-strike': !f.isNumber(vm.vatPercent),
        }"
        label="Second VAT Rate"
        name="secondVatPercent"
        @update:model-value="dirty"
      />

      <ThousandInputVal
        v-model="vm.secondVatableAmount"
        class="col-6"
        clearable
        :disable="!f.isNumber(vm.vatPercent)"
        :hint="`${f.currency(vm.secondVatableAmount) || ''} (optional)`"
        :input-class="{
          'text-right': true,
          'text-strike': !f.isNumber(vm.vatPercent),
        }"
        label="Second VAT-able Amount"
        name="secondVatableAmount"
        @update:model-value="dirty"
      />

      <QInputVal
        v-model.number="vm.vatAdjustment"
        class="col-6"
        clearable
        :disable="!f.isNumber(vm.vatPercent)"
        :hint="`${
          f.isNumber(vm.vatAdjustment) && vm.vatAdjustment > 0 ? '+' : ''
        }${f.currency(vm.vatAdjustment) || ''} (optional)`"
        :input-class="{
          'text-right': true,
          'text-strike': !f.isNumber(vm.vatPercent),
        }"
        label="VAT Adjustment"
        name="vatAdjustment"
        @update:model-value="dirty"
      />

      <div class="flex-break">
        <q-separator class="outset" />
      </div>

      <q-input
        v-model="vm.notes"
        autogrow
        class="col-12"
        clearable
        hint="Start with '!' for attention - (optional)"
        label="Notes"
        @update:model-value="dirty"
      />
    </template>
  </ExpandableCard>
</template>
