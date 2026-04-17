<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Timestamp, where } from 'firebase/firestore';

import { sortBy, uniqBy } from 'lodash-es';

import type { ExpenseStatusName } from 'utils/finance/Expense/ExpenseStatus.js';
import { expenseStatusNames } from 'utils/finance/Expense/ExpenseStatus.js';
import type { TransactionStatusName } from 'utils/finance/Transaction/TransactionStatus.js';
import { transactionStatusNames } from 'utils/finance/Transaction/TransactionStatus.js';
import stringContains from 'utils/stringContains.js';

import type { Expense, Transaction } from 'models/finance/index.js';

import {
  generalExpensesStoreDefaultSort,
  useGeneralExpensesStore,
} from 'stores/finance/GeneralExpenses.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import type { FilterOptions } from 'composables/crud-pages/useListPageFilterWithOptions.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

type TransactionRow = {
  expense: Expense;
  hasTransaction: boolean;
  expenseLength: number;
  isLastExpense: boolean;
  transaction: Transaction | null;
  isFirstTransaction: boolean;
};

// Constants

const SCOPE_NAME = 'general-expense-transactions-list-page';

// Options

defineOptions({ name: 'AliveIndex' });

// Private

const options: FilterOptions<'current' | number | 'archived' | 'all'>[] = [
  {
    type: 'current',
    label: 'Current Expenses',
    queryConstraints: [where('isArchived', '==', false), ...generalExpensesStoreDefaultSort],
  },
];

useSelectDateRange().yearOptions.value.forEach((year) => {
  options.push({
    type: year,
    label: year.toString(),
    selectedLabel: `${year} Expenses`,
    queryConstraints: [
      where('issueDate', '>=', Timestamp.fromDate(new Date(year, 0, 1))),
      where('issueDate', '<', Timestamp.fromDate(new Date(year + 1, 0, 1))),
      ...generalExpensesStoreDefaultSort,
    ],
  });
});

options.push(
  {
    type: 'archived',
    label: 'Archived Expenses',
    queryConstraints: [where('isArchived', '==', true), ...generalExpensesStoreDefaultSort],
  },
  {
    type: 'all',
    label: 'All Expenses',
    queryConstraints: [...generalExpensesStoreDefaultSort],
  },
);

// Composables

const router = useRouter();

const f = useFormats();

const { isTableView, isCardsView } = useMultiViews();

const mc = useTransactionCalculator<Transaction>();
const pmc = useExpenseCalculator<Expense>();

const $p = useListPage<Expense, TransactionRow>(SCOPE_NAME, true);
const {
  // Auto sort
  clientFilterText,
  cr,
  items,
  listItemCardWidth,
  onItemClick,
} = $p;

const { store, onLoadNextPage } = useListPageStore<Expense>(
  useGeneralExpensesStore(),
  $p.loadPage,
  $p.appendItems,
  $p.updateItems,
);

const { filterLabel, filterItems, filterOptions } = useListPageFilterWithOptionsAndStore<
  Expense,
  'current' | number | 'archived' | 'all'
>($p.ready, $p.queryConstraints, 'current', store, $p.loadFirstPage, $p.resetItems, ...options);

// Data

const clientFilterExpenseStatus = ref<ExpenseStatusName | null>(null);
const clientFilterStatus = ref<TransactionStatusName | null>(null);

// Computed

const expenseStatusOptions = computed(() => [
  {
    label: 'All',
    value: null,
  },
  ...($p.items.value
    ? sortBy(
        uniqBy($p.items.value, (value) => value.statusHelper.statusName).map((value) => ({
          label: value.statusHelper.text,
          value: value.statusHelper.statusName as ExpenseStatusName,
        })),
        (value) => expenseStatusNames.indexOf(value.value),
      )
    : []),
]);

const transactionStatusOptions = computed(() => [
  {
    label: 'All',
    value: null,
  },
  ...($p.items.value
    ? sortBy(
        uniqBy(
          $p.items.value.flatMap((expense) => expense.transactions),
          (value) => value.statusHelper.statusName,
        ).map((value) => ({
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
    field: (row) => row.transaction,
    format: (val) => ({
      issueDate: f.date((val as Transaction | undefined)?.issueDate),
      createDate: f.date((val as Transaction | undefined)?.createDate),
    }),
    style: (row) => `${!row.hasTransaction ? 'cursor: default;' : ''}`,
  },
  {
    name: 'transactionContentNotes',
    label: 'Transaction / Content / Notes',
    align: 'left',
    field: (row) => row,
    classes: 'text-wrap',
  },
  {
    name: 'type',
    label: 'Type',
    align: 'center',
    field: (row) => row.transaction?.type,
    style: (row) => `${!row.transaction ? 'display: none;' : ''}`,
  },
  {
    name: 'total',
    label: 'Total',
    align: 'right',
    field: (row) =>
      row.transaction
        ? f.currency(
            mc.transactionTotal(row.transaction) *
              (mc.transactionNegative(row.transaction) ? -1 : 1),
          )
        : undefined,
    style: (row) => `${!row.transaction ? 'display: none;' : ''}`,
  },
  {
    name: 'expenseContent',
    label: 'Expense / Content',
    align: 'left',
    field: 'expense',
    classes: (row) =>
      `text-wrap cell-separator expense-cell ${
        row.expenseLength > 1 ? 'vertical-top' : ''
      } ${row.isLastExpense ? 'bottom-cell' : ''}`,
    style: (row) => `${!row.hasTransaction ? 'cursor: default;' : ''}`,
  },
  {
    name: 'expenseIssueDateCreateDate',
    label: 'Issue Date / Create Date',
    align: 'center',
    field: (row) => row.expense,
    format: (val) => ({
      issueDate: f.date((val as Expense).issueDate),
      createDate: f.date((val as Expense).createDate),
    }),
    classes: (row) =>
      `expense-cell ${row.expenseLength > 1 ? 'vertical-top' : ''} ${
        row.isLastExpense ? 'bottom-cell' : ''
      }`,
    style: (row) => `${!row.hasTransaction ? 'cursor: default;' : ''}`,
  },
  {
    name: 'supplierSupplierExtraInfo',
    label: 'Supplier / Extra Info',
    align: 'center',
    field: (row) => row.expense.supplier,
    classes: (row) =>
      `text-wrap expense-cell ${row.expenseLength > 1 ? 'vertical-top' : ''} ${
        row.isLastExpense ? 'bottom-cell' : ''
      }`,
    style: (row) => `max-width: 150px; ${!row.hasTransaction ? 'cursor: default;' : ''}`,
  },
  {
    name: 'expenseTotalBalance',
    label: 'Total / Balance',
    align: 'right',
    field: (row) => row.expense,
    format: (val) => ({
      total: f.currency(pmc.expenseTotal(val as Expense)),
      balance: f.currency(pmc.expenseBalance(val as Expense)),
    }),
    classes: (row) =>
      `expense-cell ${row.expenseLength > 1 ? 'vertical-top' : ''} ${
        row.isLastExpense ? 'bottom-cell' : ''
      }`,
    style: (row) => `${!row.hasTransaction ? 'cursor: default;' : ''}`,
  },
  {
    name: 'isArchived',
    label: 'Archived',
    align: 'center',
    field: (row) => row.expense.isArchived,
    classes: (row) =>
      `expense-cell ${row.expenseLength > 1 ? 'vertical-top' : ''} ${
        row.isLastExpense ? 'bottom-cell' : ''
      }`,
    style: (row) => `${!row.hasTransaction ? 'cursor: default;' : ''}`,
  },
];
$p.buildRows.value = (items) =>
  items.flatMap((item, itemIndex) => {
    const filteredTransactions = filterTransactions(item);

    return filteredTransactions.length === 0
      ? [
          {
            expense: item,
            hasTransaction: false,
            expenseLength: 1,
            isLastExpense: itemIndex === items.length - 1,
            transaction: null,
            isFirstTransaction: true,
          },
        ]
      : filteredTransactions.reverse().map(
          (transaction, transactionIndex) =>
            ({
              expense: item,
              hasTransaction: true,
              expenseLength: filteredTransactions.length,
              isLastExpense: itemIndex === items.length - 1,
              transaction,
              isFirstTransaction: transactionIndex === 0,
            }) as TransactionRow,
        );
  });
$p.onRowClick.value = (evt: Event, row: TransactionRow) => {
  const elm = evt.target as Element;

  if (elm.localName === 'td') {
    if (elm.classList.contains('expense-cell') || !row.transaction) {
      if (row.hasTransaction) {
        onItemClick(evt as MouseEvent, row.expense, false);
      }
    } else {
      void router.push(
        `/general-expense-transactions/${row.expense.code.replaceAll(
          '.',
          '_',
        )}/${row.transaction.code.replaceAll('.', '_')}`,
      );
    }
  }
};

// usePageData
$p.modelFindKeyField.value = 'code';

// useClientFilter
$p.clientFilterItems.value = (items) =>
  items.filter((item) => {
    let children = [...item.transactions];

    if (
      clientFilterText.value &&
      !stringContains(item.code, clientFilterText.value) &&
      !stringContains(item.content, clientFilterText.value) &&
      !stringContains(item.supplier.name, clientFilterText.value) &&
      (!item.supplierExtraInfo ||
        !stringContains(item.supplierExtraInfo, clientFilterText.value)) &&
      (children = children.filter(
        (value) =>
          stringContains(value.code, clientFilterText.value) ||
          stringContains(value.content, clientFilterText.value),
      )).length === 0
    ) {
      return false;
    }

    if (
      clientFilterExpenseStatus.value &&
      item.statusHelper.statusName !== clientFilterExpenseStatus.value
    ) {
      return false;
    }

    if (
      clientFilterStatus.value &&
      children.filter(
        (transaction) => transaction.statusHelper.statusName === clientFilterStatus.value,
      ).length === 0
    ) {
      return false;
    }

    return true;
  });

// useNavigateToViewPage
$p.viewUrl.value = '/general-expense-transactions/';

// useNavigateToNewPage
$p.newButton.value = false;

// Methods

function filterTransactions(expense: Expense) {
  return expense.transactions.filter((value) => {
    if (
      !clientFilterText.value ||
      stringContains(expense.code, clientFilterText.value) ||
      stringContains(expense.content, clientFilterText.value) ||
      stringContains(expense.supplier.name, clientFilterText.value) ||
      (!!expense.supplierExtraInfo &&
        stringContains(expense.supplierExtraInfo, clientFilterText.value))
    ) {
      return (
        clientFilterStatus.value === null ||
        value.statusHelper.statusName === clientFilterStatus.value
      );
    }

    return (
      (stringContains(value.code, clientFilterText.value) ||
        stringContains(value.content, clientFilterText.value)) &&
      (clientFilterStatus.value === null ||
        value.statusHelper.statusName === clientFilterStatus.value)
    );
  });
}

function onExpenseClick(expense: Expense) {
  // Wait for the ripple
  setTimeout(() => {
    void router.push(`/general-expenses/${expense.code.replaceAll('.', '_')}`);
  }, 300);
}
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
                label="Expense Code, Content, Supplier, Transation Code, Content"
              />

              <q-select
                v-model="clientFilterExpenseStatus"
                class="col-12 col-md-2"
                dense
                emit-value
                hide-bottom-space
                label="Expense Status"
                map-options
                :options="expenseStatusOptions"
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
        <q-td
          :auto-width="!!cr(props.row).transaction"
          :colspan="cr(props.row).transaction ? 1 : 4"
          :props="props"
        >
          <template v-if="!cr(props.row).transaction"> This expense has no transaction. </template>

          <template v-else>
            <div>
              {{ props.value.issueDate }}
              <TopTooltip>Issue Date</TopTooltip>
            </div>
            <div class="text-caption">
              {{ props.value.createDate }}
              <TopTooltip>Create Date</TopTooltip>
            </div>
          </template>
        </q-td>
      </template>
      <template #header-cell-transactionContentNotes="{ props }">
        <q-th :props="props">
          Transaction<br />
          <span class="text-caption">Content</span> /
          <span class="text-caption text-italic">Notes</span>
        </q-th>
      </template>
      <template #body-cell-transactionContentNotes="{ props }">
        <q-td v-if="!!cr(props.row).transaction" :props="props">
          <div>
            <ObjectLink
              color="primary"
              :label="cr(props.row).transaction!.code"
              :to="`/general-expense-transactions/${cr(props.row).expense.code.replaceAll(
                '.',
                '_',
              )}/${cr(props.row).transaction!.code.replaceAll('.', '_')}`"
            >
              <template #icon>
                <StatusIcon
                  class="q-mr-sm"
                  icon="fal fa-exchange"
                  :status="cr(props.row).transaction!.statusHelper"
                />
              </template>
            </ObjectLink>
          </div>
          <div class="text-caption">
            {{ cr(props.row).transaction!.content }}
          </div>
          <div
            v-if="cr(props.row).transaction!.notes !== undefined"
            class="text-caption text-italic q-mt-xs"
            :class="{
              'bg-negative text-white q-px-sm q-py-xs rounded-borders shadow-2': cr(
                props.row,
              ).transaction!.notes!.startsWith('!'),
            }"
          >
            {{ cr(props.row).transaction!.notes }}
          </div>
        </q-td>
      </template>
      <template #header-cell-expenseContent="{ props }">
        <q-th :props="props">
          Expense<br />
          <span class="text-caption">Content</span>
        </q-th>
      </template>
      <template #body-cell-expenseContent="{ props }">
        <q-td
          v-if="cr(props.row).isFirstTransaction"
          :props="props"
          :rowspan="cr(props.row).expenseLength"
        >
          <div>
            <ObjectLink
              color="primary"
              :label="props.value.code"
              :to="`/general-expenses/${props.value.code.replaceAll('.', '_')}`"
              wrap-label
            >
              <template #icon>
                <StatusIcon
                  class="q-mr-sm"
                  icon="fal fa-receipt"
                  :status="props.value.statusHelper"
                />
              </template>
            </ObjectLink>
          </div>
          <div class="text-caption">
            {{ props.value.content }}
          </div>
        </q-td>
      </template>
      <template #header-cell-expenseIssueDateCreateDate="{ props }">
        <q-th :props="props">
          Issue Date<br />
          <span class="text-caption">Create Date</span>
        </q-th>
      </template>
      <template #body-cell-expenseIssueDateCreateDate="{ props }">
        <q-td
          v-if="cr(props.row).isFirstTransaction"
          :props="props"
          :rowspan="cr(props.row).expenseLength"
        >
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
      <template #header-cell-supplierSupplierExtraInfo="{ props }">
        <q-th :props="props">
          Supplier<br />
          <span class="text-caption">Extra Info</span>
        </q-th>
      </template>
      <template #body-cell-supplierSupplierExtraInfo="{ props }">
        <q-td
          v-if="cr(props.row).isFirstTransaction"
          :props="props"
          :rowspan="cr(props.row).expenseLength"
        >
          <div>
            <ObjectLink
              color="primary"
              :label="props.value.name"
              :to="`/suppliers/${props.value.code}`"
            />
          </div>
          <div v-if="cr(props.row).expense.supplierExtraInfo" class="text-caption">
            {{ cr(props.row).expense.supplierExtraInfo }}
          </div>
        </q-td>
      </template>
      <template #header-cell-expenseTotalBalance="{ props }">
        <q-th :props="props">
          Total<br />
          <span class="text-caption">Balance</span>
        </q-th>
      </template>
      <template #body-cell-expenseTotalBalance="{ props }">
        <q-td
          v-if="cr(props.row).isFirstTransaction"
          :props="props"
          :rowspan="cr(props.row).expenseLength"
        >
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
        <q-td
          v-if="cr(props.row).isFirstTransaction"
          auto-width
          :props="props"
          :rowspan="cr(props.row).expenseLength"
        >
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
          :caption="f.date(model.createDate) || undefined"
          caption-tooltip="Create Date"
          clickable
          :external-link-url="
            filterTransactions(model).length > 0
              ? link()
              : `/general-expenses/${model.code.replaceAll('.', '_')}`
          "
          header-separator
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="f.date(model.issueDate) || undefined"
          subtitle-tooltip="Issue Date"
          :title="model.code"
          @click="
            filterTransactions(model).length === 0
              ? onExpenseClick(model)
              : onItemClick($event, model, true)
          "
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
              {{ f.currency(pmc.expenseTotal(model)) }}
              <TopTooltip>Total</TopTooltip>
            </q-item-label>
            <q-item-label caption>
              <span class="text-muted">
                {{ f.currency(pmc.expenseBalance(model)) }}
              </span>
              <TopTooltip>Balance</TopTooltip>
            </q-item-label>
          </template>

          <template #bezel-less>
            <q-card-section class="q-col-gutter-xs row">
              <div class="col-12">
                <ObjectLink
                  color="primary"
                  icon="fal fa-building"
                  :label="
                    model.supplier.name +
                    (model.supplierExtraInfo ? ` (${model.supplierExtraInfo})` : '')
                  "
                  size="sm"
                  :to="`/suppliers/${model.supplier.code}`"
                />
              </div>

              <div class="col-12 text-body2">
                {{ model.content }}
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section
              class="text-caption"
              :class="{
                'q-gutter-y-xs': filterTransactions(model).length > 0,
              }"
            >
              <template v-if="filterTransactions(model).length === 0">
                This expense has no transaction.
              </template>

              <template v-else>
                <div
                  v-for="transaction in filterTransactions(model).reverse()"
                  :key="transaction.code"
                  class="row q-col-gutter-x-xs"
                >
                  <div class="col-3">
                    <div>
                      {{ f.date(transaction.issueDate) }}
                      <TopTooltip>Issue Date</TopTooltip>
                    </div>
                    <div class="text-muted">
                      {{ f.date(transaction.createDate) }}
                      <TopTooltip>Create Date</TopTooltip>
                    </div>
                  </div>

                  <div class="col-5">
                    <div>
                      <ObjectLink
                        color="primary"
                        :label="transaction.code"
                        size="sm"
                        :to="`/general-expense-transactions/${model.code.replaceAll(
                          '.',
                          '_',
                        )}/${transaction.code.replaceAll('.', '_')}`"
                      >
                        <template #icon>
                          <StatusIcon
                            class="q-mr-sm"
                            icon="fal fa-exchange"
                            :status="transaction.statusHelper"
                          />
                        </template>
                      </ObjectLink>
                    </div>
                    <div>
                      {{ transaction.content }}
                    </div>
                    <div
                      v-if="transaction.notes !== undefined"
                      class="text-caption text-italic q-mt-xs"
                      :class="{
                        'bg-negative text-white q-px-sm q-py-xs rounded-borders shadow-2':
                          transaction.notes.startsWith('!'),
                      }"
                    >
                      {{ transaction.notes }}
                    </div>
                  </div>

                  <div class="col-4 text-right">
                    <div>
                      {{
                        f.currency(
                          mc.transactionTotal(transaction) *
                            (mc.transactionNegative(transaction) ? -1 : 1),
                        )
                      }}
                      <TopTooltip>Total {{ transaction.type }}</TopTooltip>
                    </div>
                  </div>
                </div>
              </template>
            </q-card-section>
          </template>
        </ExpandableCard>
      </template>
    </ListPage>
  </QPagePadding>
</template>

<style lang="scss" scoped>
.cell-separator {
  border-left: 1px solid $table-border-color;
}

.q-table--dark .cell-separator {
  border-left-color: $table-dark-border-color;
}

.bottom-cell {
  border-bottom: 0px;
}
</style>
