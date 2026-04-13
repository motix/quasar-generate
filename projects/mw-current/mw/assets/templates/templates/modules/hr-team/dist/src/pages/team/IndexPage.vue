<script setup lang="ts">
import { Dark } from 'quasar';

import { where } from 'firebase/firestore';

import type { Member } from 'models/hr/index.js';

import { membersStoreDefaultSort, useMembersStore } from 'stores/hr/Members.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import useFormats from 'composables/useFormats.js';

// Constants

const SCOPE_NAME = 'team-list-page';

// Options

defineOptions({ name: 'AliveIndex' });

// Composables

const f = useFormats();

const $p = useListPage<Member, Member>(SCOPE_NAME, true);
const {
  // Auto sort
  cr,
  listItemCardWidth,
  onItemClick,
} = $p;

const { store, onLoadNextPage } = useListPageStore<Member>(
  useMembersStore(),
  $p.loadPage,
  $p.appendItems,
  $p.updateItems,
);

const { filterLabel, filterItems, filterOptions } = useListPageFilterWithOptionsAndStore<
  Member,
  'active' | 'all'
>(
  $p.ready,
  $p.queryConstraints,
  'active',
  store,
  $p.loadFirstPage,
  $p.resetItems,
  {
    type: 'active',
    label: 'Active Members',
    queryConstraints: [where('isActive', '==', true), ...membersStoreDefaultSort],
  },
  {
    type: 'all',
    label: 'All Members',
    queryConstraints: [...membersStoreDefaultSort],
  },
);

// Private Executions

// useTableView
$p.columns.value = [
  {
    name: 'photoUrl',
    label: 'Avatar',
    align: 'center',
    field: 'photoUrl',
  },
  {
    name: 'fullName',
    label: 'Full Name',
    align: 'left',
    field: 'fullName',
  },
  {
    name: 'email',
    label: 'Email',
    align: 'left',
    field: 'email',
  },
  {
    name: 'startDate',
    label: 'Start Date',
    align: 'center',
    field: 'startDate',
    format: (val) => f.date(val as Member['startDate']) || '[Start Date]',
    classes: (row) => (row.startDate ? '' : 'text-negative'),
  },
  {
    name: 'contract',
    label: 'Contract',
    align: 'center',
    field: (row) => row,
    format: (val) => ({
      contractStartDate: f.date((val as Member | undefined)?.contractStartDate),
      contractExpiration: f.date((val as Member | undefined)?.contractExpiration),
    }),
  },
  {
    name: 'isIncludedInPayroll',
    label: 'In Payroll',
    align: 'center',
    field: 'isIncludedInPayroll',
  },
  {
    name: 'baseSalary',
    label: 'Base Salary',
    align: 'right',
    field: 'baseSalary',
    format: (val) => f.currency(val as Member['baseSalary']) || '[Base Salary]',
    classes: (row) => (row.baseSalary === undefined ? 'text-negative' : ''),
  },
  {
    name: 'socialInsuranceSalary',
    label: 'Social Insurance Salary',
    align: 'right',
    field: 'socialInsuranceSalary',
    format: (val) => f.currency(val as Member['socialInsuranceSalary']) || '_',
    headerClasses: 'text-wrap',
    classes: (row) => (row.socialInsuranceSalary === undefined ? 'text-muted' : ''),
  },
  {
    name: 'personalIncomeTax',
    label: 'Personal Income Tax',
    align: 'right',
    field: 'personalIncomeTax',
    format: (val) => f.currency(val as Member['personalIncomeTax']) || '_',
    headerClasses: 'text-wrap',
    classes: (row) => (row.personalIncomeTax === undefined ? 'text-muted' : ''),
  },
  {
    name: 'payUnionDues',
    label: 'Pay Union Dues',
    align: 'center',
    field: 'payUnionDues',
    headerClasses: 'text-wrap',
  },
  {
    name: 'isActive',
    label: 'Active',
    align: 'center',
    field: 'isActive',
  },
];

// useNavigateToViewPage
$p.viewUrl.value = '/team/member/';

// useNavigateToNewPage
$p.newButton.value = false;
</script>

<template>
  <QPagePadding padding>
    <ListPage :composition="$p" :scope-name="SCOPE_NAME" @load-next-page="onLoadNextPage">
      <template #top>
        <q-btn-dropdown color="accent" :label="filterLabel" rounded>
          <q-list>
            <q-item
              v-for="option in filterOptions"
              :key="option.type"
              clickable
              :disable="option.selected"
              :v-close-popup="!option.selected"
              @click="filterItems(option.type)"
            >
              <q-item-section>
                <q-item-label>{{ option.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>

      <template #body-cell-photoUrl="{ props }">
        <q-td auto-width :props="props">
          <q-avatar size="md">
            <q-img v-if="props.value" :src="props.value" />
            <q-icon v-else color="dark" name="fas fa-user-alt" size="lg" />
          </q-avatar>
        </q-td>
      </template>
      <template #body-cell-contract="{ props }">
        <q-td :props="props">
          <span
            v-if="
              props.value.contractStartDate === undefined &&
              props.value.contractExpiration === undefined
            "
            class="text-muted"
          >
            _
          </span>
          <template v-else>
            <span :class="`${props.value.contractStartDate === undefined ? 'text-muted' : ''}`">
              {{ props.value.contractStartDate || 'None' }}
              <TopTooltip>Contract Start Date</TopTooltip>
            </span>
            -
            <span :class="`${props.value.contractExpiration === undefined ? 'text-muted' : ''}`">
              {{ props.value.contractExpiration || 'None' }}
              <TopTooltip>Contract Expiration</TopTooltip>
            </span>
          </template>
        </q-td>
      </template>
      <template #body-cell-isIncludedInPayroll="{ props }">
        <q-td auto-width :props="props">
          <q-toggle
            v-model="props.value"
            checked-icon="fal fa-money-bill"
            color="primary"
            disable
            unchecked-icon="clear"
          />
        </q-td>
      </template>
      <template #body-cell-baseSalary="{ props }">
        <q-td v-if="cr(props.row).isIncludedInPayroll" :props="props">
          {{ props.value }}
        </q-td>
        <q-td
          v-else
          class="text-center text-muted"
          :class="`${Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'}`"
          colspan="4"
        >
          Not included in payroll
        </q-td>
      </template>
      <template #body-cell-socialInsuranceSalary="{ props }">
        <q-td v-if="cr(props.row).isIncludedInPayroll" :props="props">
          {{ props.value }}
        </q-td>
      </template>
      <template #body-cell-personalIncomeTax="{ props }">
        <q-td v-if="cr(props.row).isIncludedInPayroll" :props="props">
          {{ props.value }}
        </q-td>
      </template>
      <template #body-cell-payUnionDues="{ props }">
        <q-td v-if="cr(props.row).isIncludedInPayroll" auto-width :props="props">
          <q-toggle
            v-model="props.value"
            checked-icon="fal fa-user-helmet-safety"
            color="primary"
            disable
            unchecked-icon="clear"
          />
        </q-td>
      </template>
      <template #body-cell-isActive="{ props }">
        <q-td auto-width :props="props">
          <q-toggle
            v-model="props.value"
            checked-icon="fal fa-power-off"
            color="primary"
            disable
            unchecked-icon="clear"
          />
        </q-td>
      </template>

      <template #item-card="{ model, link }">
        <ExpandableCard
          :avatar-icon="model.photoUrl ? undefined : 'fas fa-user-alt'"
          :avatar-image="model.photoUrl || undefined"
          :caption="model.email"
          clickable
          :external-link-url="link()"
          header-separator
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :title="model.fullName"
          @click="onItemClick($event, model, true)"
        >
          <template #side>
            <q-toggle
              v-model="model.isActive"
              checked-icon="fal fa-power-off"
              class="right-toggle"
              color="primary"
              disable
              unchecked-icon="clear"
            >
              <TopTooltip>Active</TopTooltip>
            </q-toggle>

            <q-toggle
              v-model="model.isIncludedInPayroll"
              checked-icon="fal fa-money-bill"
              class="right-toggle"
              color="primary"
              disable
              unchecked-icon="clear"
            >
              <TopTooltip>In Payroll</TopTooltip>
            </q-toggle>
          </template>

          <template #bezel-less>
            <q-card-section class="text-body2">
              <div class="text-overline text-weight-regular text-uppercase text-muted">Dates</div>

              <div>
                Started from
                <template v-if="model.startDate">
                  {{ f.date(model.startDate) }}
                </template>
                <span v-else class="text-negative">[Start Date]</span>
              </div>
              <div v-if="model.contractStartDate || model.contractExpiration">
                Contract
                <span v-if="model.contractStartDate"
                  >from {{ f.date(model.contractStartDate) }}</span
                >
                <span v-if="model.contractExpiration">
                  to {{ f.date(model.contractExpiration) }}</span
                >
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section v-if="model.isIncludedInPayroll" class="text-body2">
              <div class="text-overline text-weight-regular text-uppercase text-muted">Salary</div>

              <div class="row justify-between">
                <div>Base</div>
                <div>
                  <template v-if="model.baseSalary !== undefined">
                    {{ f.currency(model.baseSalary) }}
                  </template>
                  <span v-else class="text-negative">[Base Salary]</span>
                </div>
              </div>
              <div v-if="model.socialInsuranceSalary !== undefined" class="row justify-between">
                <div>Social Insurance</div>
                <div>
                  {{ f.currency(model.socialInsuranceSalary) }}
                </div>
              </div>
              <div v-if="model.personalIncomeTax !== undefined" class="row justify-between">
                <div>Personal Income Tax</div>
                <div>
                  {{ f.currency(model.personalIncomeTax) }}
                </div>
              </div>
              <div class="q-col-gutter-md row">
                <q-toggle
                  v-model="model.payUnionDues"
                  checked-icon="fal fa-user-helmet-safety"
                  class="col-6"
                  color="primary"
                  disable
                  label="Pay Union Dues"
                  unchecked-icon="clear"
                />
              </div>
            </q-card-section>

            <q-card-section v-else class="text-body2"> Not included in payroll </q-card-section>
          </template>
        </ExpandableCard>
      </template>
    </ListPage>
  </QPagePadding>
</template>
