<script setup lang="ts">
import { markRaw, watch } from 'vue';

import { object } from 'yup';

import { dateOptional, dateRequired, integerOptional, integerRequired } from 'utils/validation.js';

import type { Member, MemberVm } from 'models/hr/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFormats from 'composables/useFormats.js';

// Private

const validationSchema = markRaw(
  object({
    startDate: dateRequired('Start Date'),
    contractStartDate: dateOptional('Contract Start Date'),
    contractExpiration: dateOptional('Contact Expiration'),
    baseSalary: integerOptional('Base Salary').when({
      is: () => vm.value.isIncludedInPayroll,
      then: () => integerRequired('Base Salary').min(0),
    }),
    socialInsuranceSalary: integerOptional('Social Insurance Salary').min(0),
    personalIncomeTax: integerOptional('Persoanl Income Tax').min(0),
  }),
);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const f = useFormats();

const $p = useViewPage<Member, MemberVm>(props.scopeName);
const {
  // Auto sort
  dirty,
  vm,
} = $p;

// Private Executions

$p.useValidation(
  validationSchema,
  'startDate',
  'contractStartDate',
  'contractExpiration',
  'baseSalary',
  'socialInsuranceSalary',
  'personalIncomeTax',
);

// Watch

watch(
  () => vm.value.isIncludedInPayroll,
  () => {
    vm.value.baseSalary = '';
    vm.value.socialInsuranceSalary = '';
    vm.value.personalIncomeTax = '';
    vm.value.payUnionDues = false;
    vm.value.bankAccountNumber = '';
    vm.value.bankName = '';
  },
);
</script>

<template>
  <ExpandableCard
    :avatar-image="vm.photoUrl"
    body-cell-gutter
    :caption="vm.email"
    class="q-mx-auto"
    header-background-color="primary"
    header-dark
    :title="vm.fullName"
  >
    <template #side>
      <q-toggle
        v-model="vm.isActive"
        checked-icon="fal fa-power-off"
        class="right-toggle"
        color="white"
        disable
        icon-color="primary"
        label="Active"
        left-label
        unchecked-icon="clear"
      />

      <q-toggle
        v-model="vm.isIncludedInPayroll"
        checked-icon="fal fa-money-bill"
        class="right-toggle"
        color="white"
        icon-color="primary"
        label="In Payroll"
        left-label
        unchecked-icon="clear"
        @update:model-value="dirty"
      />
    </template>

    <template #bezel-less>
      <q-card-section class="q-col-gutter-md row">
        <QDateInputVal
          v-model="vm.startDate"
          class="col-6"
          label="Start Date"
          name="startDate"
          @update:model-value="dirty"
        />

        <div class="flex-break q-py-none"></div>

        <QDateInputVal
          v-model="vm.contractStartDate"
          class="col-6"
          label="Contract Start Date"
          name="contractStartDate"
          optional
          @update:model-value="dirty"
        />

        <QDateInputVal
          v-model="vm.contractExpiration"
          class="col-6"
          label="Contract Expiration"
          name="contractExpiration"
          optional
          @update:model-value="dirty"
        />
      </q-card-section>

      <q-slide-transition>
        <div v-if="vm.isIncludedInPayroll">
          <q-separator />

          <q-card-section class="q-col-gutter-md row">
            <ThousandInputVal
              v-model="vm.baseSalary"
              class="col-6"
              :hint="f.currency(vm.baseSalary) || undefined"
              input-class="text-right"
              label="Base Salary"
              name="baseSalary"
              @update:model-value="dirty"
            />

            <ThousandInputVal
              v-model="vm.socialInsuranceSalary"
              class="col-6"
              clearable
              :hint="`${f.currency(vm.socialInsuranceSalary) || ''} (optional)`"
              input-class="text-right"
              label="Social Insurance Salary"
              name="socialInsuranceSalary"
              @update:model-value="dirty"
            />

            <QInputVal
              v-model.number="vm.personalIncomeTax"
              class="col-6"
              clearable
              :hint="`${f.currency(vm.personalIncomeTax) || ''} (optional)`"
              input-class="text-right"
              label="Personal Income Tax"
              name="personalIncomeTax"
              @update:model-value="dirty"
            />

            <q-toggle
              v-model="vm.payUnionDues"
              checked-icon="fal fa-user-helmet-safety"
              class="col-6"
              color="primary"
              label="Pay Union Dues"
              unchecked-icon="clear"
              @update:model-value="dirty"
            />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-col-gutter-md row">
            <q-input
              v-model="vm.bankAccountNumber"
              class="col-6"
              clearable
              hint="(optional)"
              label="Bank Account Number"
              @update:model-value="dirty"
            />

            <q-input
              v-model="vm.bankName"
              class="col-6"
              clearable
              hint="(optional)"
              label="Bank Name"
              @update:model-value="dirty"
            />
          </q-card-section>
        </div>
      </q-slide-transition>
    </template>
  </ExpandableCard>
</template>
