<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Timestamp, where } from 'firebase/firestore';

import { sortBy, uniqBy } from 'lodash-es';

import type { ProjectStatusName } from 'utils/finance/Project/ProjectStatus.js';
import { projectStatusNames } from 'utils/finance/Project/ProjectStatus.js';
import type { TransactionStatusName } from 'utils/finance/Transaction/TransactionStatus.js';
import { transactionStatusNames } from 'utils/finance/Transaction/TransactionStatus.js';
import stringContains from 'utils/stringContains.js';

import type { Expense, Invoice, Project, Transaction } from 'models/finance/index.js';

import { projectsStoreDefaultSort, useProjectsStore } from 'stores/finance/Projects.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import type { FilterOptions } from 'composables/crud-pages/useListPageFilterWithOptions.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';
import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

type TransactionRow = {
  project: Project;
  hasTransaction: boolean;
  projectLength: number;
  isLastProject: boolean;
  invoice: Invoice | null;
  expense: Expense | null;
  directParentLength: number;
  isFirstDirectParent: boolean;
  isLastDirectParent: boolean;
  transaction: Transaction | null;
  isFirstTransaction: boolean;
};

// Constants

const SCOPE_NAME = 'project-transactions-list-page';

// Options

defineOptions({ name: 'AliveIndex' });

// Private

const options: FilterOptions<'current' | number | 'archived' | 'all'>[] = [
  {
    type: 'current',
    label: 'Current Projects',
    queryConstraints: [where('isArchived', '==', false), ...projectsStoreDefaultSort],
  },
];

useSelectDateRange().yearOptions.value.forEach((year) => {
  options.push({
    type: year,
    label: year.toString(),
    selectedLabel: `${year} Projects`,
    queryConstraints: [
      where('finishDate', '>=', Timestamp.fromDate(new Date(year, 0, 1))),
      where('finishDate', '<', Timestamp.fromDate(new Date(year + 1, 0, 1))),
      ...projectsStoreDefaultSort,
    ],
  });
});

options.push(
  {
    type: 'archived',
    label: 'Archived Projects',
    queryConstraints: [where('isArchived', '==', true), ...projectsStoreDefaultSort],
  },
  {
    type: 'all',
    label: 'All Projects',
    queryConstraints: [...projectsStoreDefaultSort],
  },
);

// Composables

const router = useRouter();

const f = useFormats();

const { isTableView, isCardsView } = useMultiViews();

const mc = useTransactionCalculator<Transaction>();
const imc = useInvoiceCalculator<Invoice>();
const emc = useExpenseCalculator<Expense>();

const $p = useListPage<Project, TransactionRow>(SCOPE_NAME, true);
const {
  // Auto sort
  clientFilterText,
  cr,
  items,
  listItemCardWidth,
  onItemClick,
} = $p;

const { store, onLoadNextPage } = useListPageStore<Project>(
  useProjectsStore(),
  $p.loadPage,
  $p.appendItems,
  $p.updateItems,
);

const { filterLabel, filterItems, filterOptions } = useListPageFilterWithOptionsAndStore<
  Project,
  'current' | number | 'archived' | 'all'
>($p.ready, $p.queryConstraints, 'current', store, $p.loadFirstPage, $p.resetItems, ...options);

// Data

const clientFilterProjectStatus = ref<ProjectStatusName | null>(null);
const clientFilterStatus = ref<TransactionStatusName | null>(null);

// Computed

const projectStatusOptions = computed(() => [
  {
    label: 'All',
    value: null,
  },
  ...($p.items.value
    ? sortBy(
        uniqBy($p.items.value, (value) => value.statusHelper.statusName).map((value) => ({
          label: value.statusHelper.text,
          value: value.statusHelper.statusName,
        })),
        (value) => projectStatusNames.indexOf(value.value),
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
          $p.items.value.flatMap((project) => [
            ...project.quotations.flatMap((quotation) =>
              quotation.invoice ? quotation.invoice.transactions : [],
            ),
            ...project.expenses.flatMap((expense) => expense.transactions),
          ]),
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
    name: 'directParentContent',
    label: 'Invoice / Expense / Content',
    align: 'left',
    field: (row) => row,
    classes: (row) =>
      `text-wrap cell-separator project-cell ${
        row.directParentLength > 1 ? 'vertical-top' : ''
      } ${row.isLastProject && row.isLastDirectParent ? 'bottom-cell' : ''}`,
  },
  {
    name: 'directParentTotalBalance',
    label: 'Total / Balance',
    align: 'right',
    field: (row) => row,
    format: (val) => ({
      total: f.currency(
        cr(val).invoice
          ? imc.invoiceTotal(cr(val).invoice!)
          : cr(val).expense
            ? emc.expenseTotal(cr(val).expense!)
            : undefined,
      ),
      balance: f.currency(
        cr(val).invoice
          ? imc.invoiceBalance(cr(val).invoice!)
          : cr(val).expense
            ? emc.expenseBalance(cr(val).expense!)
            : undefined,
      ),
    }),
    classes: (row) =>
      `text-wrap project-cell ${
        row.directParentLength > 1 ? 'vertical-top' : ''
      } ${row.isLastProject && row.isLastDirectParent ? 'bottom-cell' : ''}`,
  },
  {
    name: 'project',
    label: 'Project',
    align: 'left',
    field: 'project',
    classes: (row) =>
      `text-wrap cell-separator project-cell ${
        row.projectLength > 1 ? 'vertical-top' : ''
      } ${row.isLastProject ? 'bottom-cell' : ''}`,
    style: (row) => `${!row.hasTransaction ? 'cursor: default;' : ''}`,
  },
  {
    name: 'projectFinishDate',
    label: 'Finish Date',
    align: 'center',
    field: (row) => row.project.finishDate,
    format: (val) => f.date(val as Project['finishDate']),
    classes: (row) =>
      `project-cell ${row.projectLength > 1 ? 'vertical-top' : ''} ${
        row.isLastProject ? 'bottom-cell' : ''
      }`,
    style: (row) => `${!row.hasTransaction ? 'cursor: default;' : ''}`,
  },
  {
    name: 'customer',
    label: 'Customer',
    align: 'center',
    field: (row) => row.project.customer,
    classes: (row) =>
      `project-cell ${row.projectLength > 1 ? 'vertical-top' : ''} ${
        row.isLastProject ? 'bottom-cell' : ''
      }`,
    style: (row) => `max-width: 150px; ${!row.hasTransaction ? 'cursor: default;' : ''}`,
  },
  {
    name: 'isArchived',
    label: 'Archived',
    align: 'center',
    field: (row) => row.project.isArchived,
    classes: (row) =>
      `project-cell ${row.projectLength > 1 ? 'vertical-top' : ''} ${
        row.isLastProject ? 'bottom-cell' : ''
      }`,
    style: (row) => `${!row.hasTransaction ? 'cursor: default;' : ''}`,
  },
];
$p.buildRows.value = (items) =>
  items.flatMap((item, itemIndex) => {
    const directParents = [
      ...filterQuotations(item)
        .reverse()
        .map((value) => ({
          invoice: value.invoice!,
          expense: null,
        })),
      ...filterExpenses(item)
        .reverse()
        .map((value) => ({
          invoice: null,
          expense: value,
        })),
    ];

    const projectLength = directParents.flatMap((value) =>
      filterTransactions(item, (value.invoice || value.expense).transactions),
    ).length;

    return directParents.length === 0
      ? [
          {
            project: item,
            hasTransaction: false,
            projectLength: 1,
            isLastProject: itemIndex === items.length - 1,
            invoice: null,
            expense: null,
            directParentLength: 1,
            isFirstDirectParent: true,
            isLastDirectParent: true,
            transaction: null,
            isFirstTransaction: true,
          } as TransactionRow,
        ]
      : directParents.flatMap((directParent, directParentIndex) => {
          const transactions = [
            ...filterTransactions(
              item,
              (directParent.invoice || directParent.expense).transactions,
            ),
          ].reverse();

          return transactions.map(
            (transaction, transactionIndex) =>
              ({
                project: item,
                hasTransaction: true,
                projectLength,
                isLastProject: itemIndex === items.length - 1,
                invoice: directParent.invoice,
                expense: directParent.expense,
                directParentLength: transactions.length,
                isFirstDirectParent: directParentIndex === 0,
                isLastDirectParent: directParentIndex === directParents.length - 1,
                transaction,
                isFirstTransaction: transactionIndex === 0,
              }) as TransactionRow,
          );
        });
  });
$p.onRowClick.value = (evt: Event, row: TransactionRow) => {
  const elm = evt.target as Element;

  if (elm.localName === 'td') {
    if (elm.classList.contains('project-cell') || !row.transaction) {
      if (row.hasTransaction) {
        onItemClick(evt as MouseEvent, row.project, false);
      }
    } else {
      void router.push(
        `/project-transactions/${
          row.project.urlFriendlyName
        }/${row.transaction.code.replaceAll('.', '_')}`,
      );
    }
  }
};

// usePageData
$p.modelFindKeyField.value = 'urlFriendlyName';

// useClientFilter
$p.clientFilterItems.value = (items) =>
  items.filter((item) => {
    let children = [
      ...item.quotations.flatMap((value) => (value.invoice ? value.invoice.transactions : [])),
      ...item.expenses.flatMap((value) => value.transactions),
    ];

    if (
      clientFilterText.value &&
      !stringContains(item.name, clientFilterText.value) &&
      !stringContains(item.customer.name, clientFilterText.value) &&
      (children = children.filter(
        (value) =>
          stringContains(value.code, clientFilterText.value) ||
          stringContains(value.content, clientFilterText.value),
      )).length === 0
    ) {
      return false;
    }

    if (
      clientFilterProjectStatus.value &&
      item.statusHelper.statusName !== clientFilterProjectStatus.value
    ) {
      return false;
    }

    if (
      clientFilterStatus.value &&
      children.filter((value) => value.statusHelper.statusName === clientFilterStatus.value)
        .length === 0
    ) {
      return false;
    }

    return true;
  });

// useNavigateToViewPage
$p.viewUrl.value = '/project-transactions/';

// useNavigateToNewPage
$p.newButton.value = false;

// Methods

function filterQuotations(project: Project) {
  return project.quotations.filter(
    (quotation) => filterTransactions(project, quotation.invoice?.transactions || []).length > 0,
  );
}

function filterExpenses(project: Project) {
  return project.expenses.filter(
    (expense) => filterTransactions(project, expense.transactions).length > 0,
  );
}

function filterTransactions(project: Project, transactions: Transaction[]) {
  return transactions.filter((value) => {
    if (
      !clientFilterText.value ||
      stringContains(project.name, clientFilterText.value) ||
      stringContains(project.customer.name, clientFilterText.value)
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

function onProjectClick(project: Project) {
  // Wait for the ripple
  setTimeout(() => {
    void router.push(`/projects/${project.urlFriendlyName}`);
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
                label="Project Name, Customer, Code, Content"
              />

              <q-select
                v-model="clientFilterProjectStatus"
                class="col-12 col-md-2"
                dense
                emit-value
                hide-bottom-space
                label="Project Status"
                map-options
                :options="projectStatusOptions"
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
          :colspan="cr(props.row).transaction ? 1 : 6"
          :props="props"
        >
          <template v-if="!cr(props.row).transaction"> This project has no transaction. </template>

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
              :to="`/project-transactions/${
                cr(props.row).project.urlFriendlyName
              }/${cr(props.row).transaction!.code.replaceAll('.', '_')}`"
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
      <template #header-cell-directParentContent="{ props }">
        <q-th :props="props">
          Invoice / Expense<br />
          <span class="text-caption">Content</span>
        </q-th>
      </template>
      <template #body-cell-directParentContent="{ props }">
        <q-td
          v-if="cr(props.row).transaction && cr(props.row).isFirstTransaction"
          :props="props"
          :rowspan="cr(props.row).directParentLength"
        >
          <template v-if="!!cr(props.row).invoice">
            <div>
              <ObjectLink
                color="primary"
                :label="cr(props.row).invoice!.code"
                :to="`/project-invoices/${
                  cr(props.row).project.urlFriendlyName
                }/${cr(props.row).invoice!.code.replaceAll('.', '_')}`"
              >
                <template #icon>
                  <StatusIcon
                    class="q-mr-sm"
                    icon="fal fa-file-invoice-dollar"
                    :status="cr(props.row).invoice!.statusHelper"
                  />
                </template>
              </ObjectLink>
            </div>
          </template>
          <template v-if="!!cr(props.row).expense">
            <div>
              <ObjectLink
                color="primary"
                :label="cr(props.row).expense!.code"
                :to="`/project-expenses/${
                  cr(props.row).project.urlFriendlyName
                }/${cr(props.row).expense!.code.replaceAll('.', '_')}`"
              >
                <template #icon>
                  <StatusIcon
                    class="q-mr-sm"
                    icon="fal fa-receipt"
                    :status="cr(props.row).expense!.statusHelper"
                  />
                </template>
              </ObjectLink>
            </div>
            <div class="text-caption">
              {{ cr(props.row).expense?.content }}
            </div>
          </template>
        </q-td>
      </template>
      <template #header-cell-directParentTotalBalance="{ props }">
        <q-th :props="props">
          Total<br />
          <span class="text-caption">Balance</span>
        </q-th>
      </template>
      <template #body-cell-directParentTotalBalance="{ props }">
        <q-td
          v-if="cr(props.row).transaction && cr(props.row).isFirstTransaction"
          :props="props"
          :rowspan="cr(props.row).directParentLength"
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
      <template #body-cell-project="{ props }">
        <q-td
          v-if="cr(props.row).isFirstTransaction && cr(props.row).isFirstDirectParent"
          :props="props"
          :rowspan="cr(props.row).projectLength"
        >
          <ObjectLink
            color="primary"
            :label="props.value.name"
            :to="`/projects/${props.value.urlFriendlyName}`"
            wrap-label
          >
            <template #icon>
              <StatusIcon
                class="q-mr-sm"
                icon="fal fa-briefcase"
                :status="props.value.statusHelper"
              />
            </template>
          </ObjectLink>
        </q-td>
      </template>
      <template #body-cell-projectFinishDate="{ props }">
        <q-td
          v-if="cr(props.row).isFirstTransaction && cr(props.row).isFirstDirectParent"
          :props="props"
          :rowspan="cr(props.row).projectLength"
        >
          {{ props.value }}
        </q-td>
      </template>
      <template #body-cell-customer="{ props }">
        <q-td
          v-if="cr(props.row).isFirstTransaction && cr(props.row).isFirstDirectParent"
          :props="props"
          :rowspan="cr(props.row).projectLength"
        >
          <ObjectLink
            color="primary"
            :label="props.value.name"
            :to="`/customers/${props.value.code}`"
          />
        </q-td>
      </template>
      <template #body-cell-isArchived="{ props }">
        <q-td
          v-if="cr(props.row).isFirstTransaction && cr(props.row).isFirstDirectParent"
          auto-width
          :props="props"
          :rowspan="cr(props.row).projectLength"
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
          clickable
          :external-link-url="
            filterQuotations(model).length + filterExpenses(model).length > 0 ? link() : undefined
          "
          header-separator
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="f.date(model.finishDate) || undefined"
          subtitle-tooltip="Finish Date"
          :title="model.name"
          title-full-width
          @click="
            filterQuotations(model).length + filterExpenses(model).length === 0
              ? onProjectClick(model)
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
          </template>

          <template #bezel-less>
            <q-card-section>
              <ObjectLink
                color="primary"
                icon="fal fa-user-crown"
                :label="model.customer.name"
                size="sm"
                :to="`/customers/${model.customer.code}`"
              />
            </q-card-section>

            <q-separator />

            <q-card-section
              v-if="filterQuotations(model).length + filterExpenses(model).length === 0"
              class="text-caption"
            >
              This project has no transaction.
            </q-card-section>

            <template v-else>
              <!-- Invoices -->

              <template
                v-for="(quotation, index) in filterQuotations(model).reverse()"
                :key="quotation.code"
              >
                <q-separator v-if="index > 0" />

                <q-card-section class="text-caption q-gutter-y-xs">
                  <div class="row q-col-gutter-x-xs q-mt-none">
                    <div class="col-8">
                      <ObjectLink
                        color="primary"
                        :label="quotation.invoice!.code"
                        :to="`/project-invoices/${
                          model.urlFriendlyName
                        }/${quotation.invoice!.code.replaceAll('.', '_')}`"
                      >
                        <template #icon>
                          <StatusIcon
                            class="q-mr-sm"
                            icon="fal fa-file-invoice-dollar"
                            :status="quotation.invoice!.statusHelper"
                          />
                        </template>
                      </ObjectLink>
                    </div>

                    <div class="col-4 text-right">
                      <div>
                        {{ f.currency(imc.invoiceTotal(quotation.invoice!)) }}
                        <TopTooltip>Total</TopTooltip>
                      </div>
                      <div class="text-muted">
                        {{ f.currency(imc.invoiceBalance(quotation.invoice!)) }}
                        <TopTooltip>Balance</TopTooltip>
                      </div>
                    </div>
                  </div>

                  <q-separator />

                  <div
                    v-for="transaction in filterTransactions(
                      model,
                      quotation.invoice!.transactions,
                    ).reverse()"
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
                          :to="`/project-transactions/${
                            model.urlFriendlyName
                          }/${transaction.code.replaceAll('.', '_')}`"
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
                </q-card-section>
              </template>

              <!-- Expenses -->

              <template
                v-for="(expense, index) in filterExpenses(model).reverse()"
                :key="expense.code"
              >
                <q-separator v-if="index > 0 || filterQuotations(model).length > 0" />

                <q-card-section class="text-caption q-gutter-y-xs">
                  <div class="row q-col-gutter-x-xs q-mt-none">
                    <div class="col-8">
                      <div>
                        <ObjectLink
                          color="primary"
                          :label="expense.code"
                          :to="`/project-expenses/${
                            model.urlFriendlyName
                          }/${expense.code.replaceAll('.', '_')}`"
                        >
                          <template #icon>
                            <StatusIcon
                              class="q-mr-sm"
                              icon="fal fa-receipt"
                              :status="expense.statusHelper"
                            />
                          </template>
                        </ObjectLink>
                      </div>

                      <div>
                        {{ expense.content }}
                      </div>
                    </div>

                    <div class="col-4 text-right">
                      <div>
                        {{ f.currency(emc.expenseTotal(expense)) }}
                        <TopTooltip>Total</TopTooltip>
                      </div>
                      <div class="text-muted">
                        {{ f.currency(emc.expenseBalance(expense)) }}
                        <TopTooltip>Balance</TopTooltip>
                      </div>
                    </div>
                  </div>

                  <q-separator />

                  <div
                    v-for="transaction in filterTransactions(model, expense.transactions).reverse()"
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
                          :to="`/project-transactions/${
                            model.urlFriendlyName
                          }/${transaction.code.replaceAll('.', '_')}`"
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
                </q-card-section>
              </template>
            </template>
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
