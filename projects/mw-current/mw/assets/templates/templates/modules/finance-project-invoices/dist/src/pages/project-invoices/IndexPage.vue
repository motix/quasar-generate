<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Timestamp, where } from 'firebase/firestore';

import { sortBy, uniqBy } from 'lodash-es';

import type { InvoiceStatusName } from 'utils/finance/Invoice/InvoiceStatus.js';
import { invoiceStatusNames } from 'utils/finance/Invoice/InvoiceStatus.js';
import type { ProjectStatusName } from 'utils/finance/Project/ProjectStatus.js';
import { projectStatusNames } from 'utils/finance/Project/ProjectStatus.js';
import stringContains from 'utils/stringContains.js';

import type { Invoice, Project, Quotation } from 'models/finance/index.js';

import { projectsStoreDefaultSort, useProjectsStore } from 'stores/finance/Projects.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import type { FilterOptions } from 'composables/crud-pages/useListPageFilterWithOptions.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

type InvoiceRow = {
  project: Project;
  hasInvoice: boolean;
  projectLength: number;
  isLastProject: boolean;
  quotation: Quotation | null;
  isFirstQuotation: boolean;
};

// Constants

const SCOPE_NAME = 'project-invoices-list-page';

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

const mc = useInvoiceCalculator<Invoice>();

const $p = useListPage<Project, InvoiceRow>(SCOPE_NAME, true);
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
const clientFilterStatus = ref<InvoiceStatusName | null>(null);
const clientFilterBalanceNotZero = ref(false);

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

const invoiceStatusOptions = computed(() => [
  {
    label: 'All',
    value: null,
  },
  ...($p.items.value
    ? sortBy(
        uniqBy(
          $p.items.value.flatMap((project) =>
            project.quotations.flatMap((quotation) =>
              quotation.invoice ? [quotation.invoice] : [],
            ),
          ),
          (value) => value.statusHelper.statusName,
        ).map((value) => ({
          label: value.statusHelper.text,
          value: value.statusHelper.statusName as InvoiceStatusName,
        })),
        (value) => invoiceStatusNames.indexOf(value.value),
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
    field: (row) => row.quotation?.invoice,
    format: (val) => ({
      issueDate: f.date((val as Invoice | undefined)?.issueDate),
      createDate: f.date((val as Invoice | undefined)?.createDate),
    }),
    style: (row) => `${!row.hasInvoice ? 'cursor: default;' : ''}`,
  },
  {
    name: 'invoiceQuotationNotes',
    label: 'Invoice / Quotation / Notes',
    align: 'left',
    field: (row) => row,
    classes: 'text-wrap',
  },
  {
    name: 'referenceNumber',
    label: 'Reference Number',
    align: 'left',
    field: (row) => row.quotation?.invoice?.referenceNumber,
    classes: 'text-wrap',
  },
  {
    name: 'totalBalance',
    label: 'Total / Balance',
    align: 'right',
    field: (row) => ({
      total: row.quotation?.invoice
        ? f.currency(mc.invoiceTotal(row.quotation.invoice))
        : undefined,
      balance: row.quotation?.invoice
        ? f.currency(mc.invoiceBalance(row.quotation.invoice))
        : undefined,
    }),
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
    style: (row) => `${!row.hasInvoice ? 'cursor: default;' : ''}`,
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
    style: (row) => `${!row.hasInvoice ? 'cursor: default;' : ''}`,
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
    style: (row) => `max-width: 150px; ${!row.hasInvoice ? 'cursor: default;' : ''}`,
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
    style: (row) => `${!row.hasInvoice ? 'cursor: default;' : ''}`,
  },
];
$p.buildRows.value = (items) =>
  items.flatMap((item, itemIndex) => {
    const filteredQuotations = filterQuotations(item);

    return filteredQuotations.length === 0
      ? [
          {
            project: item,
            hasInvoice: false,
            projectLength: 1,
            isLastProject: itemIndex === items.length - 1,
            quotation: null,
            isFirstQuotation: true,
          },
        ]
      : filteredQuotations.reverse().map(
          (quotation, quotationIndex) =>
            ({
              project: item,
              hasInvoice: true,
              projectLength: filteredQuotations.length,
              isLastProject: itemIndex === items.length - 1,
              quotation,
              isFirstQuotation: quotationIndex === 0,
            }) as InvoiceRow,
        );
  });
$p.onRowClick.value = (evt: Event, row: InvoiceRow) => {
  const elm = evt.target as Element;

  if (elm.localName === 'td') {
    if (elm.classList.contains('project-cell') || !row.quotation?.invoice) {
      if (row.hasInvoice) {
        onItemClick(evt as MouseEvent, row.project, false);
      }
    } else {
      void router.push(
        `/project-invoices/${
          row.project.urlFriendlyName
        }/${row.quotation.invoice.code.replaceAll('.', '_')}`,
      );
    }
  }
};

// usePageData
$p.modelFindKeyField.value = 'urlFriendlyName';

// useClientFilter
$p.clientFilterItems.value = (items) =>
  items.filter((item) => {
    let children = item.quotations.flatMap((value) => (value.invoice ? [value.invoice] : []));

    if (
      clientFilterText.value &&
      !stringContains(item.name, clientFilterText.value) &&
      !stringContains(item.customer.name, clientFilterText.value) &&
      (children = children.filter(
        (value) =>
          stringContains(value.code, clientFilterText.value) ||
          stringContains(value.referenceNumber || '', clientFilterText.value),
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
      (children = children.filter(
        (value) => value.statusHelper.statusName === clientFilterStatus.value,
      )).length === 0
    ) {
      return false;
    }

    if (
      clientFilterBalanceNotZero.value &&
      children.filter((value) => mc.invoiceBalance(value) !== 0).length === 0
    ) {
      return false;
    }

    return true;
  });

// useNavigateToViewPage
$p.viewUrl.value = '/project-invoices/';

// useNavigateToNewPage
$p.newButton.value = false;

// Methods

function filterQuotations(project: Project) {
  if (
    !clientFilterText.value ||
    stringContains(project.name, clientFilterText.value) ||
    stringContains(project.customer.name, clientFilterText.value)
  ) {
    return project.quotations.filter(
      (value) =>
        !!value.invoice &&
        (clientFilterStatus.value === null ||
          value.invoice.statusHelper.statusName === clientFilterStatus.value) &&
        (!clientFilterBalanceNotZero.value || mc.invoiceBalance(value.invoice) !== 0),
    );
  }

  return project.quotations.filter(
    (value) =>
      !!value.invoice &&
      (stringContains(value.invoice.code, clientFilterText.value) ||
        stringContains(value.invoice.referenceNumber || '', clientFilterText.value)) &&
      (clientFilterStatus.value === null ||
        value.invoice.statusHelper.statusName === clientFilterStatus.value) &&
      (!clientFilterBalanceNotZero.value || mc.invoiceBalance(value.invoice) !== 0),
  );
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
                label="Project Name, Customer, Code, Reference Number"
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
                :options="invoiceStatusOptions"
              />

              <q-toggle
                v-model="clientFilterBalanceNotZero"
                checked-icon="fal fa-check"
                color="primary"
                icon-color="white"
                label="Balance Not Zero"
                unchecked-icon="clear"
              >
              </q-toggle>
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
          :auto-width="!!cr(props.row).quotation?.invoice"
          :colspan="cr(props.row).quotation?.invoice ? 1 : 4"
          :props="props"
        >
          <template v-if="!cr(props.row).quotation?.invoice">
            This project has no invoice.
          </template>

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
      <template #header-cell-invoiceQuotationNotes="{ props }">
        <q-th :props="props">
          Invoice - Quotation<br />
          <span class="text-caption text-italic">Notes</span>
        </q-th>
      </template>
      <template #body-cell-invoiceQuotationNotes="{ props }">
        <q-td v-if="!!cr(props.row).quotation?.invoice" :props="props">
          <div>
            <ObjectLink
              color="primary"
              :label="cr(props.row).quotation!.invoice!.code"
              :to="`/project-invoices/${
                cr(props.row).project.urlFriendlyName
              }/${cr(props.row).quotation!.invoice!.code.replaceAll('.', '_')}`"
            >
              <template #icon>
                <StatusIcon
                  class="q-mr-sm"
                  icon="fal fa-file-invoice-dollar"
                  :status="cr(props.row).quotation!.invoice!.statusHelper"
                />
              </template>
            </ObjectLink>
          </div>
          <div class="text-no-wrap">
            <q-icon
              class="text-caption text-muted"
              name="fal fa-arrow-turn-up fa-flip-horizontal"
            />
            <ObjectLink
              color="primary"
              :label="cr(props.row).quotation!.code"
              size="sm"
              :to="`/quotations/${cr(props.row).project.urlFriendlyName}/${cr(
                props.row,
              ).quotation!.code.replaceAll('.', '_')}`"
            >
              <template #icon>
                <StatusIcon
                  class="q-mr-sm"
                  icon="fal fa-file-invoice"
                  :status="cr(props.row).quotation!.statusHelper"
                />
              </template>
            </ObjectLink>
          </div>
          <div
            v-if="cr(props.row).quotation!.invoice!.notes !== undefined"
            class="text-caption text-italic q-mt-xs"
            :class="{
              'bg-negative text-white q-px-sm q-py-xs rounded-borders shadow-2': cr(
                props.row,
              ).quotation!.invoice!.notes!.startsWith('!'),
            }"
          >
            {{ cr(props.row).quotation!.invoice!.notes }}
          </div>
        </q-td>
      </template>
      <template #body-cell-referenceNumber="{ props }">
        <q-td v-if="!!cr(props.row).quotation?.invoice" :props="props">
          <template v-if="props.value">
            <div
              v-for="(referenceNumber, index) of (
                props.value as NonNullable<Invoice['referenceNumber']>
              ).split(', ')"
              :key="`${index}-${referenceNumber}`"
            >
              <ObjectLink icon="fal fa-hashtag" :label="referenceNumber" :ripple="false" />
            </div>
          </template>
        </q-td>
      </template>
      <template #header-cell-totalBalance="{ props }">
        <q-th :props="props">
          Total<br />
          <span class="text-caption">Balance</span>
        </q-th>
      </template>
      <template #body-cell-totalBalance="{ props }">
        <q-td v-if="!!cr(props.row).quotation?.invoice" :props="props">
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
          v-if="cr(props.row).isFirstQuotation"
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
          v-if="cr(props.row).isFirstQuotation"
          :props="props"
          :rowspan="cr(props.row).projectLength"
        >
          {{ props.value }}
        </q-td>
      </template>
      <template #body-cell-customer="{ props }">
        <q-td
          v-if="cr(props.row).isFirstQuotation"
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
          v-if="cr(props.row).isFirstQuotation"
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
            filterQuotations(model).length > 0 ? link() : `/projects/${model.urlFriendlyName}`
          "
          header-separator
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="f.date(model.finishDate) || undefined"
          subtitle-tooltip="Finish Date"
          :title="model.name"
          title-full-width
          @click="
            filterQuotations(model).length === 0
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
              class="text-caption"
              :class="{
                'q-gutter-y-xs': filterQuotations(model).length > 0,
              }"
            >
              <template v-if="filterQuotations(model).length === 0">
                This project has no invoice.
              </template>

              <template v-else>
                <template
                  v-for="quotation in filterQuotations(model).reverse()"
                  :key="quotation.code"
                >
                  <div class="row q-col-gutter-x-xs">
                    <div class="col-3">
                      <div>
                        {{ f.date(quotation.invoice!.issueDate) }}
                        <TopTooltip>Issue Date</TopTooltip>
                      </div>
                      <div class="text-muted">
                        {{ f.date(quotation.invoice!.createDate) }}
                        <TopTooltip>Create Date</TopTooltip>
                      </div>
                    </div>

                    <div class="col-5">
                      <div>
                        <ObjectLink
                          color="primary"
                          :label="quotation.invoice!.code"
                          size="sm"
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

                      <div class="text-no-wrap">
                        <q-icon class="text-muted" name="fal fa-arrow-turn-up fa-flip-horizontal" />
                        <ObjectLink
                          color="primary"
                          :label="quotation.code"
                          size="sm"
                          :to="`/quotations/${
                            model.urlFriendlyName
                          }/${quotation.code.replaceAll('.', '_')}`"
                        >
                          <template #icon>
                            <StatusIcon
                              class="q-mr-sm"
                              icon="fal fa-file-invoice"
                              :status="quotation.statusHelper"
                            />
                          </template>
                        </ObjectLink>
                      </div>
                    </div>

                    <div class="col-4 text-right">
                      <div>
                        {{ f.currency(mc.invoiceTotal(quotation.invoice!)) }}
                        <TopTooltip>Total</TopTooltip>
                      </div>
                      <div class="text-muted">
                        {{ f.currency(mc.invoiceBalance(quotation.invoice!)) }}
                        <TopTooltip>Balance</TopTooltip>
                      </div>
                    </div>
                  </div>
                  <div v-if="quotation.invoice!.referenceNumber" class="row q-col-gutter-x-xs">
                    <div class="col-9 offset-3">
                      <div
                        v-for="(referenceNumber, index) of quotation.invoice!.referenceNumber.split(
                          ', ',
                        )"
                        :key="`${index}-${referenceNumber}`"
                      >
                        <ObjectLink
                          icon="fal fa-hashtag"
                          :label="referenceNumber"
                          :ripple="false"
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div v-if="quotation.invoice!.notes !== undefined" class="row q-col-gutter-x-xs">
                    <div
                      class="col-9 offset-3 text-caption text-italic"
                      :class="{
                        'bg-negative text-white q-px-sm q-py-xs rounded-borders shadow-2':
                          quotation.invoice!.notes.startsWith('!'),
                      }"
                    >
                      {{ quotation.invoice!.notes }}
                    </div>
                  </div>
                </template>
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
