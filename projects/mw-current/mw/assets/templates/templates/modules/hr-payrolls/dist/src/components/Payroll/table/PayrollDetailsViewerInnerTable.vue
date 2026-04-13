<script setup lang="ts">
import type { Payroll, PayrollVm } from 'models/hr/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import usePayrollCalculator from 'composables/hr/payroll/usePayrollCalculator.js';
import useFormats from 'composables/useFormats.js';

// Props

const props = withDefaults(
  defineProps<{
    scopeName: string;
    printerFriendly?: boolean;
  }>(),
  {
    printerFriendly: false,
  },
);

// Composables

const f = useFormats();

const mc = usePayrollCalculator<Payroll>();

const { m } = useViewPage<Payroll, PayrollVm>(props.scopeName);
</script>

<template>
  <q-markup-table id="viewerTable" bordered separator="cell" wrap-cells>
    <thead>
      <tr>
        <th class="q-table--col-auto-width">#</th>
        <th>Full Name</th>
        <th>Base Salary</th>
        <th>Production Salary</th>
        <th>Working Days</th>
        <th>Base And Production Salary</th>
        <th>Bonus</th>
        <th>Social Insurance Salary</th>
        <th>Social Insurance</th>
        <th>Personal Income Tax</th>
        <th>Union Dues</th>
        <th>Adjustment</th>
        <th>Net Salary</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(detail, index) in m.details" :key="index">
        <td class="text-right">
          {{ index + 1 }}
        </td>
        <td :class="{ 'text-no-wrap': !printerFriendly }">
          {{ detail.fullName }}
        </td>
        <td class="text-right">
          {{ f.currency(detail.baseSalary) }}
        </td>
        <td class="text-right">
          {{ f.currency(detail.productionSalary) }}
        </td>
        <td class="text-right">
          {{ detail.workingDays }}
        </td>
        <td class="text-right">
          {{ f.currency(mc.payrollDetailBaseAndProductionSalary(detail, m.workingDays)) }}
        </td>
        <td class="text-right">
          {{ f.currency(detail.bonus) }}
        </td>
        <td class="text-right">
          {{ f.currency(detail.socialInsuranceSalary) }}
        </td>
        <td class="text-right">
          {{ f.currency(mc.payrollDetailSocialInsurance(detail, m.socialInsurancePercent)) }}
        </td>
        <td class="text-right">
          {{ f.currency(detail.personalIncomeTax) }}
        </td>
        <td class="text-right">
          {{ f.currency(mc.payrollDetailUnionDues(detail, m.unionDuesPercent)) }}
        </td>
        <td class="text-right">
          {{ f.currency(detail.adjustment) }}
        </td>
        <td class="text-right">
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
        </td>
      </tr>

      <tr>
        <td class="text-right" colspan="2">
          <strong>Total</strong>
        </td>
        <td class="text-right">
          <strong>{{ f.currency(mc.payrollTotalBaseSalary(m)) }}</strong>
        </td>
        <td class="text-right">
          <strong>
            {{ f.currency(mc.payrollTotalProductionSalary(m)) }}
          </strong>
        </td>
        <td></td>
        <td class="text-right">
          <strong>
            {{ f.currency(mc.payrollTotalBaseAndProductionSalary(m)) }}
          </strong>
        </td>
        <td class="text-right">
          <strong>{{ f.currency(mc.payrollTotalBonus(m)) }}</strong>
        </td>
        <td class="text-right">
          <strong>
            {{ f.currency(mc.payrollTotalSocialInsuranceSalary(m)) }}
          </strong>
        </td>
        <td class="text-right">
          <strong>
            {{ f.currency(mc.payrollTotalSocialInsurance(m)) }}
          </strong>
        </td>
        <td class="text-right">
          <strong>{{ f.currency(mc.payrollTotalPersonalIncomeTax(m)) }}</strong>
        </td>
        <td class="text-right">
          <strong>
            {{ f.currency(mc.payrollTotalUnionDues(m)) }}
          </strong>
        </td>
        <td class="text-right">
          <strong>{{ f.currency(mc.payrollTotalAdjustment(m)) }}</strong>
        </td>
        <td class="text-right">
          <strong>{{ f.currency(mc.payrollTotalNetSalary(m)) }}</strong>
        </td>
      </tr>

      <tr>
        <td class="text-right" colspan="8">
          <strong>Payable</strong>
        </td>
        <td class="text-right" colspan="5">
          <strong>{{ f.currency(mc.payrollTotalPayable(m)) }}</strong>
        </td>
      </tr>
    </tbody>
  </q-markup-table>
</template>
