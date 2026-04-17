<script setup lang="ts">
import { computed, ref } from 'vue';

import { Timestamp, where } from 'firebase/firestore';

import { sortBy, uniqBy } from 'lodash-es';

import type { SalesContractStatusName } from 'utils/finance/SalesContract/SalesContractStatus.js';
import { salesContractStatusNames } from 'utils/finance/SalesContract/SalesContractStatus.js';
import stringContains from 'utils/stringContains.js';

import type { SalesContract } from 'models/finance/index.js';

import {
  salesContractsStoreDefaultSort,
  useSalesContractsStore,
} from 'stores/finance/SalesContracts.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import type { FilterOptions } from 'composables/crud-pages/useListPageFilterWithOptions.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import useSalesContractCalculator from 'composables/finance/sales-contract/useSalesContractCalculator.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Constants

const SCOPE_NAME = 'sales-contracts-list-page';

// Options

defineOptions({ name: 'AliveIndex' });

// Private

const options: FilterOptions<'current' | number | 'archived' | 'all'>[] = [
  {
    type: 'current',
    label: 'Current Contracts',
    queryConstraints: [where('isArchived', '==', false), ...salesContractsStoreDefaultSort],
  },
];

useSelectDateRange().yearOptions.value.forEach((year) => {
  options.push({
    type: year,
    label: year.toString(),
    selectedLabel: `${year} Contracts`,
    queryConstraints: [
      where('signDate', '>=', Timestamp.fromDate(new Date(year, 0, 1))),
      where('signDate', '<', Timestamp.fromDate(new Date(year + 1, 0, 1))),
      ...salesContractsStoreDefaultSort,
    ],
  });
});

options.push(
  {
    type: 'archived',
    label: 'Archived Contracts',
    queryConstraints: [where('isArchived', '==', true), ...salesContractsStoreDefaultSort],
  },
  {
    type: 'all',
    label: 'All Contracts',
    queryConstraints: [...salesContractsStoreDefaultSort],
  },
);

// Composables

const f = useFormats();

const { isTableView, isCardsView } = useMultiViews();

const mc = useSalesContractCalculator<SalesContract>();

const $p = useListPage<SalesContract, SalesContract>(SCOPE_NAME, true);
const {
  // Auto sort
  cr,
  clientFilterText,
  itemLink,
  items,
  listItemCardWidth,
  onItemClick,
} = $p;

const { store, onLoadNextPage } = useListPageStore<SalesContract>(
  useSalesContractsStore(),
  $p.loadPage,
  $p.appendItems,
  $p.updateItems,
);

const { filterLabel, filterItems, filterOptions } = useListPageFilterWithOptionsAndStore<
  SalesContract,
  'current' | number | 'archived' | 'all'
>($p.ready, $p.queryConstraints, 'current', store, $p.loadFirstPage, $p.resetItems, ...options);

// Data

const clientFilterStatus = ref<SalesContractStatusName | null>(null);

// Computed

const salesContractStatusOptions = computed(() => [
  {
    label: 'All',
    value: null,
  },
  ...($p.items.value
    ? sortBy(
        uniqBy($p.items.value, (value) => value.statusHelper.statusName).map((value) => ({
          label: value.statusHelper.text,
          value: value.statusHelper.statusName as SalesContractStatusName,
        })),
        (value) => salesContractStatusNames.indexOf(value.value),
      )
    : []),
]);

// Private Executions

// useTableView
$p.columns.value = [
  {
    name: 'signDate',
    label: 'Sign Date',
    align: 'center',
    field: 'signDate',
    format: (val) => f.date(val as SalesContract['signDate']),
    classes: 'q-table--col-auto-width',
  },
  {
    name: 'code',
    label: 'Code',
    align: 'left',
    field: 'code',
    classes: 'text-wrap',
  },
  {
    name: 'vatInvoices',
    label: 'VAT Invoices',
    align: 'left',
    field: (row) => row,
  },
  {
    name: 'projectsGeneralInvoicesContentNotes',
    label: 'Projects / General Invoices / Content / Notes',
    align: 'left',
    field: (row) => row,
    classes: 'text-wrap',
  },
  {
    name: 'customer',
    label: 'Customer',
    align: 'center',
    field: 'customer',
    style: 'max-width: 150px',
  },
  {
    name: 'status',
    label: 'Status',
    align: 'center',
    field: 'statusHelper',
  },
  {
    name: 'totalBalance',
    label: 'Total / Balance',
    align: 'right',
    field: (row) => ({
      total: f.currency(mc.salesContractTotal(row)),
      balance: f.currency(mc.salesContractBalance(row)),
    }),
  },
  {
    name: 'isArchived',
    label: 'Archived',
    align: 'center',
    field: 'isArchived',
  },
];

// usePageData
$p.modelFindKeyField.value = 'urlFriendlyCode';

// useClientFilter
$p.clientFilterItems.value = (items) =>
  items.filter((item) => {
    if (
      clientFilterText.value &&
      !stringContains(item.code, clientFilterText.value) &&
      item.projects.find((value) => stringContains(value.name, clientFilterText.value)) ===
        undefined &&
      item.generalInvoices.find((value) => stringContains(value.code, clientFilterText.value)) ===
        undefined &&
      item.vatInvoices.find(
        (value) =>
          stringContains(value.code, clientFilterText.value) ||
          stringContains(value.content, clientFilterText.value),
      ) === undefined &&
      !stringContains(item.content, clientFilterText.value) &&
      !stringContains(item.customer.name, clientFilterText.value) &&
      !stringContains(item.notes || '', clientFilterText.value)
    ) {
      return false;
    }

    if (clientFilterStatus.value && item.statusHelper.statusName !== clientFilterStatus.value) {
      return false;
    }

    return true;
  });

// useNavigateToViewPage
$p.viewUrl.value = '/sales-contracts/';

// useNavigateToNewPage
$p.newUrl.value = '/sales-contracts/new';
</script>

<template>
  <QPagePadding padding>
    <ListPage :composition="$p" :scope-name="SCOPE_NAME" @load-next-page="onLoadNextPage">
      <template #top>
        <div :class="{ 'col-12': isTableView, 'q-px-md': isCardsView }">
          <div class="q-col-gutter-md row">
            <div class="col-12 col-md-auto">
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
            </div>

            <template v-if="items?.length || 0 > 0">
              <q-input
                v-model="clientFilterText"
                class="col-12 col-md"
                clearable
                debounce="300"
                dense
                hide-bottom-space
                label="Code, Project, General Invoice, VAT Invoice (Code, Content), Content, Customer, Notes"
              />

              <q-select
                v-model="clientFilterStatus"
                class="col-12 col-md-2"
                dense
                emit-value
                hide-bottom-space
                label="Status"
                map-options
                :options="salesContractStatusOptions"
              />
            </template>
          </div>
        </div>
      </template>

      <template #body-cell-code="{ props }">
        <q-td :props="props">
          <ObjectLink color="primary" :label="props.value" :to="itemLink(cr(props.row))" wrap-label>
            <template #icon>
              <StatusIcon
                class="q-mr-sm"
                icon="fal fa-file-signature fa-fw"
                :status="cr(props.row).statusHelper"
              />
            </template>
          </ObjectLink>
        </q-td>
      </template>
      <template #body-cell-vatInvoices="{ props }">
        <q-td :props="props">
          <div v-for="vatInvoice in cr(props.row).vatInvoices" :key="vatInvoice.code">
            {{ vatInvoice.code }}
          </div>
        </q-td>
      </template>
      <template #header-cell-projectsGeneralInvoicesContentNotes="{ props }">
        <q-th :props="props">
          Projects / General Invoices<br />
          <span class="text-caption">Content</span> /
          <span class="text-caption text-italic">Notes</span>
        </q-th>
      </template>
      <template #body-cell-projectsGeneralInvoicesContentNotes="{ props }">
        <q-td :props="props">
          <div v-for="project in cr(props.row).projects" :key="project.id">
            <ObjectLink
              color="primary"
              :label="project.name"
              :to="`/projects/${project.urlFriendlyName}`"
              wrap-label
            >
              <template #icon>
                <StatusIcon
                  class="q-mr-sm"
                  icon="fal fa-briefcase"
                  :status="project.statusHelper"
                />
              </template>
            </ObjectLink>
          </div>
          <div v-for="invoice in cr(props.row).generalInvoices" :key="invoice.id">
            <ObjectLink
              color="primary"
              :label="invoice.code"
              :to="`/general-invoices/${invoice.code.replaceAll('.', '_')}`"
            >
              <template #icon>
                <StatusIcon
                  class="q-mr-sm"
                  icon="fal fa-file-invoice-dollar"
                  :status="invoice.statusHelper"
                />
              </template>
            </ObjectLink>
          </div>
          <div class="text-caption">
            {{ cr(props.row).content }}
          </div>
          <div
            v-if="cr(props.row).notes !== undefined"
            class="text-caption text-italic q-mt-xs"
            :class="{
              'bg-negative text-white q-px-sm q-py-xs rounded-borders shadow-2': cr(
                props.row,
              ).notes!.startsWith('!'),
            }"
          >
            {{ cr(props.row).notes }}
          </div>
        </q-td>
      </template>
      <template #body-cell-customer="{ props }">
        <q-td :props="props">
          <ObjectLink
            color="primary"
            :label="props.value.name"
            :to="`/customers/${props.value.code}`"
          />
        </q-td>
      </template>
      <template #body-cell-status="{ props }">
        <q-td auto-width :props="props">
          <StatusBadge :status="props.value" />
        </q-td>
      </template>
      <template #header-cell-totalBalance="{ props }">
        <q-th :props="props">
          Total<br />
          <span class="text-caption">Balance</span>
        </q-th>
      </template>
      <template #body-cell-totalBalance="{ props }">
        <q-td :props="props">
          <div>
            {{ props.value.total }}
            <TopTooltip>Total</TopTooltip>
          </div>
          <div class="text-caption">
            {{ props.value.balance }}
            <TopTooltip>Balance</TopTooltip>
          </div>
        </q-td>
      </template>
      <template #body-cell-isArchived="{ props }">
        <q-td auto-width :props="props">
          <q-toggle
            v-model="props.value"
            checked-icon="fal fa-box-taped"
            color="primary"
            disable
            unchecked-icon="fal fa-box-open"
          />
        </q-td>
      </template>

      <template #item-card="{ model, link }">
        <ExpandableCard
          body-class="q-col-gutter-xs row"
          clickable
          :external-link-url="link()"
          header-separator
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="f.date(model.signDate) || undefined"
          subtitle-tooltip="Sign Date"
          :title="model.code"
          title-full-width
          @click="onItemClick($event, model, true)"
        >
          <template #main>
            <div class="q-mt-sm">
              <StatusBadge :status="model.statusHelper" />
            </div>

            <div v-if="model.vatInvoices.length > 0" class="q-mt-sm">
              <div
                v-for="vatInvoice in model.vatInvoices"
                :key="vatInvoice.code"
                class="text-caption"
              >
                {{ vatInvoice.code }}
              </div>
              <TopTooltip>VAT Invoices</TopTooltip>
            </div>
          </template>

          <template #side>
            <q-toggle
              v-model="model.isArchived"
              checked-icon="fal fa-box-taped"
              class="right-toggle"
              color="primary"
              disable
              unchecked-icon="fal fa-box-open"
            >
              <TopTooltip>Archived</TopTooltip>
            </q-toggle>

            <q-item-label caption>
              {{ f.currency(mc.salesContractTotal(model)) }}
              <TopTooltip>Total</TopTooltip>
            </q-item-label>
            <q-item-label caption>
              <span class="text-muted">
                {{ f.currency(mc.salesContractBalance(model)) }}
              </span>
              <TopTooltip>Balance</TopTooltip>
            </q-item-label>
          </template>

          <template #body>
            <div v-for="project in model.projects" :key="project.id" class="col-12">
              <ObjectLink
                color="primary"
                :label="project.name"
                :to="`/projects/${project.urlFriendlyName}`"
                wrap-label
              >
                <template #icon>
                  <StatusIcon
                    class="q-mr-sm"
                    icon="fal fa-briefcase"
                    :status="project.statusHelper"
                  />
                </template>
              </ObjectLink>
            </div>

            <div v-for="invoice in model.generalInvoices" :key="invoice.id" class="col-6">
              <ObjectLink
                color="primary"
                :label="invoice.code"
                :to="`/general-invoices/${invoice.code.replaceAll('.', '_')}`"
              >
                <template #icon>
                  <StatusIcon
                    class="q-mr-sm"
                    icon="fal fa-file-invoice-dollar"
                    :status="invoice.statusHelper"
                  />
                </template>
              </ObjectLink>
            </div>

            <div class="flex-break q-pt-none"></div>

            <div class="col-6">
              <ObjectLink
                color="primary"
                icon="fal fa-user-crown"
                :label="model.customer.name"
                size="sm"
                :to="`/customers/${model.customer.code}`"
              />
            </div>

            <div class="col-12 text-body2">
              {{ model.content }}
            </div>
          </template>

          <template v-if="model.notes !== undefined" #bezel-less>
            <q-separator />

            <q-card-section
              class="text-caption text-italic"
              :class="{
                'bg-negative text-white': model.notes?.startsWith('!'),
              }"
              style="border-bottom-left-radius: 4px; border-bottom-right-radius: 4px"
            >
              {{ model.notes }}
            </q-card-section>
          </template>
        </ExpandableCard>
      </template>
    </ListPage>
  </QPagePadding>
</template>
