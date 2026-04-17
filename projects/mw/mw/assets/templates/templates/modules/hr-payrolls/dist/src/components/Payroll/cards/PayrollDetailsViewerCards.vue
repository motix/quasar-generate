<script setup lang="ts">
import { computed } from 'vue';

import { Dark } from 'quasar';

import type { Payroll, PayrollVm } from 'models/hr/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import usePayrollCalculator from 'composables/hr/payroll/usePayrollCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

// Props

const props = defineProps<{
  scopeName: string;
  hideExtraInfo: boolean;
}>();

// Composables

const { cardWidth, listItemCardWidth } = requiredConfigEntries('cardWidth', 'listItemCardWidth');

const f = useFormats();

const mc = usePayrollCalculator<Payroll>();

const { m } = useViewPage<Payroll, PayrollVm>(props.scopeName);

// Computed

const payrollTitle = computed(() => `Payroll ${f.yearMonth(m.value.year, m.value.month)}`);
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
        <div class="text-h6 text-center">
          {{ payrollTitle }}
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row justify-between">
          <div>Net Salary</div>
          <div class="text-warning">
            <strong>{{ f.currency(mc.payrollTotalNetSalary(m)) }}</strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Payable</div>
          <div class="text-warning">
            <strong>{{ f.currency(mc.payrollTotalPayable(m)) }}</strong>
          </div>
        </div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section>
        <div class="row justify-between">
          <div>Base Salary</div>
          <div class="text-warning">
            <strong>{{ f.currency(mc.payrollTotalBaseSalary(m)) }}</strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Production Salary</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(mc.payrollTotalProductionSalary(m)) }}
            </strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Base And Production Salary</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(mc.payrollTotalBaseAndProductionSalary(m)) }}
            </strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Bonus</div>
          <div class="text-warning">
            <strong>{{ f.currency(mc.payrollTotalBonus(m)) }}</strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Social Insurance</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(mc.payrollTotalSocialInsurance(m)) }}
            </strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Personal Income Tax</div>
          <div class="text-warning">
            <strong>{{ f.currency(mc.payrollTotalPersonalIncomeTax(m)) }}</strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Union Dues</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(mc.payrollTotalUnionDues(m)) }}
            </strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Adjustment</div>
          <div class="text-warning">
            <strong>{{ f.currency(mc.payrollTotalAdjustment(m)) }}</strong>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="row items-start justify-evenly q-gutter-md q-mt-none">
      <ExpandableCard
        v-for="(detail, index) in m.details"
        :key="index"
        :caption="`${detail.workingDays} working day${detail.workingDays > 1 ? 's' : ''}`"
        side-top
        :style="{ maxWidth: listItemCardWidth + 'px' }"
        :subtitle="(f.currency(detail.productionSalary) as string) || undefined"
        subtitle-color="accent"
        subtitle-tooltip="Production Salary"
        :title="detail.fullName"
        title-color="primary"
      >
        <template #side>
          <q-item-label class="text-accent">
            <strong>
              {{
                f.currency(
                  mc.payrollDetailNetSalary(
                    detail,
                    m.socialInsurancePercent,
                    m.unionDuesPercent,
                    m.workingDays,
                  ),
                )
              }}
            </strong>
            <TopTooltip>Net Salary</TopTooltip>
          </q-item-label>
        </template>

        <template #bezel-less>
          <q-slide-transition>
            <div v-if="!hideExtraInfo">
              <q-separator />

              <q-card-section class="text-caption">
                <div class="row justify-between">
                  <div>Base Salary</div>
                  <div class="text-accent">
                    {{ f.currency(detail.baseSalary) }}
                  </div>
                </div>

                <div class="row justify-between">
                  <div>Base And Production Salary</div>
                  <div class="text-accent">
                    {{ f.currency(mc.payrollDetailBaseAndProductionSalary(detail, m.workingDays)) }}
                  </div>
                </div>

                <div class="row justify-between">
                  <div>Bonus</div>
                  <div class="text-accent">
                    {{ f.currency(detail.bonus) }}
                  </div>
                </div>

                <div class="row justify-between">
                  <div>Social Insurance Salary</div>
                  <div class="text-accent">
                    {{ f.currency(detail.socialInsuranceSalary) }}
                  </div>
                </div>

                <div class="row justify-between">
                  <div>Social Insurance</div>
                  <div class="text-accent">
                    {{
                      f.currency(mc.payrollDetailSocialInsurance(detail, m.socialInsurancePercent))
                    }}
                  </div>
                </div>

                <div class="row justify-between">
                  <div>Personal Income Tax</div>
                  <div class="text-accent">
                    {{ f.currency(detail.personalIncomeTax) }}
                  </div>
                </div>

                <div class="row justify-between">
                  <div>Union Dues</div>
                  <div class="text-accent">
                    {{ f.currency(mc.payrollDetailUnionDues(detail, m.unionDuesPercent)) }}
                  </div>
                </div>

                <div class="row justify-between">
                  <div>Adjustment</div>
                  <div class="text-accent">
                    {{ f.currency(detail.adjustment) }}
                  </div>
                </div>
              </q-card-section>
            </div>
          </q-slide-transition>
        </template>
      </ExpandableCard>
    </div>
  </div>
</template>
