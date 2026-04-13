<script setup lang="ts">
import { computed, ref } from 'vue';

import { Timestamp, where } from 'firebase/firestore';

import { sortBy, uniqBy } from 'lodash-es';

import type { TransactionStatusName } from 'utils/finance/Transaction/TransactionStatus.js';
import { transactionStatusNames } from 'utils/finance/Transaction/TransactionStatus.js';
import stringContains from 'utils/stringContains.js';

import type { Transaction } from 'models/finance/index.js';

import {
  generalTransactionsStoreDefaultSort,
  useGeneralTransactionsStore,
} from 'stores/finance/GeneralTransactions.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import type { FilterOptions } from 'composables/crud-pages/useListPageFilterWithOptions.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Constants

const SCOPE_NAME = 'general-transactions-list-page';

// Options

defineOptions({ name: 'AliveIndex' });

// Private

const options: FilterOptions<'current' | number | 'archived' | 'all'>[] = [
  {
    type: 'current',
    label: 'Current Transactions',
    queryConstraints: [where('isArchived', '==', false), ...generalTransactionsStoreDefaultSort],
  },
];

useSelectDateRange().yearOptions.value.forEach((year) => {
  options.push({
    type: year,
    label: year.toString(),
    selectedLabel: `${year} Transactions`,
    queryConstraints: [
      where('issueDate', '>=', Timestamp.fromDate(new Date(year, 0, 1))),
      where('issueDate', '<', Timestamp.fromDate(new Date(year + 1, 0, 1))),
      ...generalTransactionsStoreDefaultSort,
    ],
  });
});

options.push(
  {
    type: 'archived',
    label: 'Archived Transactions',
    queryConstraints: [where('isArchived', '==', true), ...generalTransactionsStoreDefaultSort],
  },
  {
    type: 'all',
    label: 'All Transactions',
    queryConstraints: [...generalTransactionsStoreDefaultSort],
  },
);

// Composables

const f = useFormats();

const { isTableView, isCardsView } = useMultiViews();

const mc = useTransactionCalculator<Transaction>();

const $p = useListPage<Transaction, Transaction>(SCOPE_NAME, true);
const {
  // Auto sort
  clientFilterText,
  cr,
  itemLink,
  items,
  listItemCardWidth,
  onItemClick,
} = $p;

const { store, onLoadNextPage } = useListPageStore<Transaction>(
  useGeneralTransactionsStore(),
  $p.loadPage,
  $p.appendItems,
  $p.updateItems,
);

const { filterLabel, filterItems, filterOptions } = useListPageFilterWithOptionsAndStore<
  Transaction,
  'current' | number | 'archived' | 'all'
>($p.ready, $p.queryConstraints, 'current', store, $p.loadFirstPage, $p.resetItems, ...options);

// Data

const clientFilterStatus = ref<TransactionStatusName | null>(null);

// Computed

const transactionStatusOptions = computed(() => [
  {
    label: 'All',
    value: null,
  },
  ...($p.items.value
    ? sortBy(
        uniqBy($p.items.value, (value) => value.statusHelper.statusName).map((value) => ({
          label: value.statusHelper.text,
          value: value.statusHelper.statusName as TransactionStatusName,
        })),
        (value) => transactionStatusNames.indexOf(value.value),
      )
    : []),
]);

// Private Executions

// useTableView
$p.columns.value = [
  {
    name: 'issueDateCreateDate',
    label: 'Issue Date / Create Date',
    align: 'center',
    field: (row) => row,
    format: (val) => ({
      issueDate: f.date((val as Transaction | undefined)?.issueDate),
      createDate: f.date((val as Transaction | undefined)?.createDate),
    }),
  },
  {
    name: 'code',
    label: 'Code',
    align: 'left',
    field: 'code',
  },
  {
    name: 'contentNotes',
    label: 'Content / Notes',
    align: 'left',
    field: (row) => row,
    classes: 'text-wrap',
  },
  {
    name: 'sourceFinanceAccount',
    label: 'From',
    align: 'center',
    field: 'sourceFinanceAccount',
  },
  {
    name: 'destinationFinanceAccount',
    label: 'To',
    align: 'center',
    field: 'destinationFinanceAccount',
  },
  {
    name: 'status',
    label: 'Status',
    align: 'center',
    field: 'statusHelper',
  },
  {
    name: 'total',
    label: 'Total',
    align: 'right',
    field: (row) => f.currency(mc.transactionTotal(row)),
  },
  {
    name: 'isArchived',
    label: 'Archived',
    align: 'center',
    field: 'isArchived',
  },
];

// usePageData
$p.modelFindKeyField.value = 'code';

// useClientFilter
$p.clientFilterItems.value = (items) =>
  items.filter((item) => {
    if (
      clientFilterText.value &&
      !stringContains(item.code, clientFilterText.value) &&
      !stringContains(item.content, clientFilterText.value) &&
      (!item.sourceFinanceAccount ||
        !stringContains(item.sourceFinanceAccount.name, clientFilterText.value)) &&
      (!item.destinationFinanceAccount ||
        !stringContains(item.destinationFinanceAccount.name, clientFilterText.value))
    ) {
      return false;
    }

    if (clientFilterStatus.value && item.statusHelper.statusName !== clientFilterStatus.value) {
      return false;
    }

    return true;
  });

// useNavigateToViewPage
$p.viewUrl.value = '/general-transactions/';

// useNavigateToNewPage
$p.newUrl.value = '/general-transactions/new';
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
                label="Code, Content, From, To"
              />

              <q-select
                v-model="clientFilterStatus"
                class="col-12 col-md-2"
                dense
                emit-value
                hide-bottom-space
                label="Status"
                map-options
                :options="transactionStatusOptions"
              />
            </template>
          </div>
        </div>
      </template>

      <template #header-cell-issueDateCreateDate="{ props }">
        <q-th :props="props">
          Issue Date<br />
          <span class="text-caption">Create Date</span>
        </q-th>
      </template>
      <template #body-cell-issueDateCreateDate="{ props }">
        <q-td auto-width :props="props">
          <div>
            {{ props.value.issueDate }}
            <TopTooltip>Issue Date</TopTooltip>
          </div>
          <div class="text-caption">
            {{ props.value.createDate }}
            <TopTooltip>Create Date</TopTooltip>
          </div>
        </q-td>
      </template>
      <template #body-cell-code="{ props }">
        <q-td :props="props">
          <ObjectLink color="primary" :label="props.value" :to="itemLink(cr(props.row))">
            <template #icon>
              <StatusIcon
                class="q-mr-sm"
                icon="fal fa-exchange"
                :status="cr(props.row).statusHelper"
              />
            </template>
          </ObjectLink>
        </q-td>
      </template>
      <template #header-cell-contentNotes="{ props }">
        <q-th :props="props">
          Content<br />
          <span class="text-caption text-italic">Notes</span>
        </q-th>
      </template>
      <template #body-cell-contentNotes="{ props }">
        <q-td :props="props">
          <div>
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
      <template #body-cell-sourceFinanceAccount="{ props }">
        <q-td :props="props">
          <ObjectLink
            color="primary"
            icon="fal fa-piggy-bank"
            :label="props.value.name"
            :to="`/finance-accounts/${props.value.id}`"
            wrap-label
          />
        </q-td>
      </template>
      <template #body-cell-destinationFinanceAccount="{ props }">
        <q-td :props="props">
          <ObjectLink
            color="primary"
            icon="fal fa-piggy-bank"
            :label="props.value.name"
            :to="`/finance-accounts/${props.value.id}`"
            wrap-label
          />
        </q-td>
      </template>
      <template #body-cell-status="{ props }">
        <q-td auto-width :props="props">
          <StatusBadge :status="props.value" />
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
          :caption="f.date(model.createDate) || undefined"
          caption-tooltip="Create Date"
          clickable
          :external-link-url="link()"
          header-separator
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="f.date(model.issueDate) || undefined"
          subtitle-tooltip="Issue Date"
          :title="model.code"
          @click="onItemClick($event, model, true)"
        >
          <template #main>
            <StatusBadge class="q-mt-sm" :status="model.statusHelper" />
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
              {{ model.type }}
              <TopTooltip>Type</TopTooltip>
            </q-item-label>

            <q-item-label caption>
              {{ f.currency(mc.transactionTotal(model)) }}
              <TopTooltip>Total</TopTooltip>
            </q-item-label>
          </template>

          <template #body>
            <div class="col-12 row justify-between">
              <div>
                <ObjectLink
                  v-if="
                    mc.transactionHasSourceAccount(model) &&
                    !mc.transactionNegative(model) &&
                    !!model.sourceFinanceAccount
                  "
                  color="primary"
                  icon="fal fa-piggy-bank"
                  :label="model.sourceFinanceAccount!.name"
                  size="sm"
                  :to="`/finance-accounts/${model.sourceFinanceAccount!.id}`"
                />
                <ObjectLink
                  v-if="
                    mc.transactionHasDestinationAccount(model) &&
                    mc.transactionNegative(model) &&
                    !!model.destinationFinanceAccount
                  "
                  color="primary"
                  icon="fal fa-piggy-bank"
                  :label="model.destinationFinanceAccount!.name"
                  size="sm"
                  :to="`/finance-accounts/${model.destinationFinanceAccount!.id}`"
                />
              </div>

              <div>
                <q-icon v-if="!mc.transactionNegative(model)" name="fal fa-arrow-right-long" />
                <q-icon v-else name="fal fa-arrow-left-long" />
              </div>

              <div>
                <ObjectLink
                  v-if="
                    mc.transactionHasSourceAccount(model) &&
                    mc.transactionNegative(model) &&
                    !!model.sourceFinanceAccount
                  "
                  color="primary"
                  icon="fal fa-piggy-bank"
                  :label="model.sourceFinanceAccount!.name"
                  size="sm"
                  :to="`/finance-accounts/${model.sourceFinanceAccount!.id}`"
                />
                <ObjectLink
                  v-if="
                    mc.transactionHasDestinationAccount(model) &&
                    !mc.transactionNegative(model) &&
                    !!model.destinationFinanceAccount
                  "
                  color="primary"
                  icon="fal fa-piggy-bank"
                  :label="model.destinationFinanceAccount!.name"
                  size="sm"
                  :to="`/finance-accounts/${model.destinationFinanceAccount!.id}`"
                />
              </div>
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
