<script setup lang="ts">
import type { Member, MemberVm } from 'models/hr/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFormats from 'composables/useFormats.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const f = useFormats();

const { m } = useViewPage<Member, MemberVm>(props.scopeName);
</script>

<template>
  <ExpandableCard
    :avatar-icon="m.photoUrl ? undefined : 'fas fa-user-alt'"
    :avatar-image="m.photoUrl || undefined"
    :caption="m.email"
    class="q-mx-auto"
    header-background-color="primary"
    header-dark
    :title="m.fullName"
  >
    <template #side>
      <q-toggle
        v-model="m.isActive"
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
        v-model="m.isIncludedInPayroll"
        checked-icon="fal fa-money-bill"
        class="right-toggle"
        color="white"
        disable
        icon-color="primary"
        label="In Payroll"
        left-label
        unchecked-icon="clear"
      />
    </template>

    <template #bezel-less>
      <q-card-section>
        <div class="text-overline text-weight-regular text-uppercase text-muted">Dates</div>

        <div>
          Started from
          <template v-if="m.startDate">
            {{ f.date(m.startDate) }}
          </template>
          <span v-else class="text-negative">[Start Date]</span>
        </div>
        <div v-if="m.contractStartDate || m.contractExpiration">
          Contract
          <span v-if="m.contractStartDate">from {{ f.date(m.contractStartDate) }}</span>
          <span v-if="m.contractExpiration">to {{ f.date(m.contractExpiration) }}</span>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="m.isIncludedInPayroll" horizontal>
        <q-card-section class="col">
          <div class="text-overline text-weight-regular text-uppercase text-muted">Salary</div>

          <div class="row justify-between">
            <div>Base</div>
            <div>
              <template v-if="m.baseSalary !== undefined">
                {{ f.currency(m.baseSalary) }}
              </template>
              <span v-else class="text-negative">[Base Salary]</span>
            </div>
          </div>
          <div v-if="m.socialInsuranceSalary !== undefined" class="row justify-between">
            <div>Social Insurance</div>
            <div>
              {{ f.currency(m.socialInsuranceSalary) }}
            </div>
          </div>
          <div v-if="m.personalIncomeTax !== undefined" class="row justify-between">
            <div>Personal Income Tax</div>
            <div>
              {{ f.currency(m.personalIncomeTax) }}
            </div>
          </div>
          <div class="q-col-gutter-md row">
            <q-toggle
              v-model="m.payUnionDues"
              checked-icon="fal fa-user-helmet-safety"
              class="col-6"
              color="primary"
              disable
              label="Pay Union Dues"
              unchecked-icon="clear"
            />
          </div>
        </q-card-section>

        <q-separator v-if="m.bankAccountNumber || m.bankName" vertical />

        <q-card-section v-if="m.bankAccountNumber || m.bankName" class="col">
          <div class="text-overline text-weight-regular text-uppercase text-muted">
            Bank Account
          </div>

          <div>
            {{ m.bankAccountNumber }}
          </div>
          <div>
            {{ m.bankName }}
          </div>
        </q-card-section>
      </q-card-section>

      <q-card-section v-else> Not included in payroll </q-card-section>
    </template>
  </ExpandableCard>
</template>
