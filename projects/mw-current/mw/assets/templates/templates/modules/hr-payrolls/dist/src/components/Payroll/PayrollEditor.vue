<script setup lang="ts">
import { computed, markRaw } from 'vue';

import { Dark } from 'quasar';

import { array, boolean, object } from 'yup';

import {
  integerRequired,
  percentRequiredMinOneMax,
  percentRequiredMinZeroMax,
  stringRequired,
} from 'utils/validation.js';

import type { Payroll, PayrollDetailVm, PayrollVm } from 'models/hr/index.js';

import useEditPage from 'composables/crud-pages/useEditPage.js';
import useFormats from 'composables/useFormats.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';

// Private

const validationSchema = markRaw(
  object({
    socialInsurancePercent: percentRequiredMinOneMax('Social Insurance Rate'),
    unionDuesPercent: percentRequiredMinZeroMax('Union Dues Rate'),
    workingDays: integerRequired('Working Days').min(1),
    details: array()
      .of<PayrollDetailVm>(
        object({
          fullName: stringRequired('FullName'),
          baseSalary: integerRequired('Base Salary'),
          productionSalary: integerRequired('Production Salary'),
          workingDays: integerRequired('Working Days').min(0),
          bonus: integerRequired('Bonus').min(0),
          socialInsuranceSalary: integerRequired('Social Insurance Salary'),
          personalIncomeTax: integerRequired('Social Insurance Salary'),
          payUnionDues: boolean().required(),
          adjustment: integerRequired('Social Insurance Salary'),
        }),
      )
      .required(),
  }),
);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const f = useFormats();

const { yearOptions, monthOptions } = useSelectDateRange();

const $p = useEditPage<Payroll, PayrollVm>(props.scopeName);
const {
  // Auto sort
  dirty,
  vm,
} = $p;

// Computed

const displaySocialInsurrancePercent = computed(() => {
  const value = vm.value.socialInsurancePercent;

  return (
    (f.percent(value, 1) || '[Social Insurrance Percent]') +
    (value || value === 0 ? ' social insurance' : '')
  );
});

const displayUnionDuesPercent = computed(() => {
  const value = vm.value.unionDuesPercent;

  return (
    (f.percent(value, 1) || '[Union Dues Percent]') + (value || value === 0 ? ' union dues' : '')
  );
});

const displayWorkingDays = computed(() => {
  const value = vm.value.workingDays;

  return value || value === 0
    ? `${value} working day${typeof value === 'number' && value > 1 ? 's' : ''}`
    : '[Working Days]';
});

// Private Executions

$p.useValidation(validationSchema, 'socialInsurancePercent', 'workingDays', 'details');
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-money-bill"
    avatar-top
    body-cell-gutter
    class="q-mx-auto"
    header-background-color="primary"
    header-dark
    side-top
    :title="$p.isNewPage($p) ? '[Auto-generated Code]' : vm.code"
    :title-no-wrap="!$p.isNewPage($p)"
    title-top
  >
    <template #main>
      <StatusBadge class="q-mt-sm" revert-color :status="vm.statusHelper" />
    </template>

    <template #side>
      <q-item-label caption>
        {{ f.yearMonthViewModel(vm.year, vm.month, '[Year]', '[Month]') }}
      </q-item-label>
      <q-item-label caption>
        {{ displayWorkingDays }}
      </q-item-label>
      <q-item-label caption>
        {{ displaySocialInsurrancePercent }}
      </q-item-label>
      <q-item-label caption>
        {{ displayUnionDuesPercent }}
      </q-item-label>
    </template>

    <template #body>
      <template v-if="$p.isNewPage($p)">
        <q-select
          v-model="vm.year"
          class="col-6"
          label="Year"
          :options="yearOptions"
          @update:model-value="dirty"
        />

        <q-select
          v-model="vm.month"
          class="col-6"
          label="Month"
          :options="monthOptions"
          @update:model-value="dirty"
        />
      </template>

      <QInputVal
        v-model.number="vm.workingDays"
        class="col-6"
        input-class="text-right"
        label="Working Days"
        name="workingDays"
        @update:model-value="dirty"
      />

      <div class="flex-break q-py-none"></div>

      <PercentInputVal
        v-model="vm.socialInsurancePercent"
        class="col-6"
        input-class="text-right"
        label="Social Insurance Rate"
        name="socialInsurancePercent"
        @update:model-value="dirty"
      />

      <PercentInputVal
        v-model="vm.unionDuesPercent"
        class="col-6"
        input-class="text-right"
        label="Union Dues Rate"
        name="unionDuesPercent"
        @update:model-value="dirty"
      />
    </template>

    <template v-if="!$p.isNewPage($p) && !vm.isCompleted" #bezel-less>
      <q-markup-table bordered dense separator="cell">
        <thead>
          <tr :class="Dark.isActive ? 'bg-grey-9' : 'bg-grey-3'">
            <th>Working Days</th>
            <th>Bonus</th>
            <th>Personal Income Tax</th>
            <th>Adjustment</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(detail, index) in vm.details" :key="index">
            <tr
              :class="{
                [Dark.isActive ? 'bg-grey-10' : 'bg-grey-1']: index % 2 == 0,
                [Dark.isActive ? 'bg-grey-9' : 'bg-grey-3']: index % 2 == 1,
              }"
            >
              <td class="text-center" colspan="4">
                {{ detail.fullName }}
              </td>
            </tr>

            <tr
              :class="{
                [Dark.isActive ? 'bg-grey-10' : 'bg-grey-1']: index % 2 == 0,
                [Dark.isActive ? 'bg-grey-9' : 'bg-grey-3']: index % 2 == 1,
              }"
            >
              <td class="vertical-top">
                <QInputVal
                  v-model.number="detail.workingDays"
                  dense
                  hide-bottom-space
                  input-class="text-right"
                  :name="`details[${index}].workingDays`"
                  placeholder="Working Days"
                  @update:model-value="dirty"
                />
              </td>
              <td class="vertical-top">
                <ThousandInputVal
                  v-model="detail.bonus"
                  dense
                  hide-bottom-space
                  :hint="detail.bonus === 0 ? undefined : f.currency(detail.bonus) || undefined"
                  input-class="text-right"
                  :name="`details[${index}].bonus`"
                  placeholder="Bonus"
                  @update:model-value="dirty"
                />
              </td>
              <td class="vertical-top">
                <QInputVal
                  v-model.number="detail.personalIncomeTax"
                  dense
                  hide-bottom-space
                  :hint="
                    detail.personalIncomeTax === 0
                      ? undefined
                      : f.currency(detail.personalIncomeTax) || undefined
                  "
                  input-class="text-right"
                  :name="`details[${index}].personalIncomeTax`"
                  placeholder="Personal Income Tax"
                  @update:model-value="dirty"
                />
              </td>
              <td class="vertical-top">
                <QInputVal
                  v-model.number="detail.adjustment"
                  dense
                  hide-bottom-space
                  :hint="
                    detail.adjustment === 0 ? undefined : f.currency(detail.adjustment) || undefined
                  "
                  input-class="text-right"
                  :name="`details[${index}].adjustment`"
                  placeholder="Adjustment"
                  @update:model-value="dirty"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </q-markup-table>
    </template>
  </ExpandableCard>
</template>
