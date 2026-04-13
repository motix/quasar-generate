<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Timestamp, where } from 'firebase/firestore';

import { sortBy, uniqBy } from 'lodash-es';

import type { ProjectStatusName } from 'utils/finance/Project/ProjectStatus.js';
import { projectStatusNames } from 'utils/finance/Project/ProjectStatus.js';
import type { QuotationStatusName } from 'utils/finance/Quotation/QuotationStatus.js';
import { quotationStatusNames } from 'utils/finance/Quotation/QuotationStatus.js';
import stringContains from 'utils/stringContains.js';

import type { Project, Quotation } from 'models/finance/index.js';

import { projectsStoreDefaultSort, useProjectsStore } from 'stores/finance/Projects.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import type { FilterOptions } from 'composables/crud-pages/useListPageFilterWithOptions.js';
import useListPageFilterWithOptionsAndStore from 'composables/crud-pages/useListPageFilterWithOptionsAndStore.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import useQuotationCalculator from 'composables/finance/quotation/useQuotationCalculator.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import QuotationStatusIcon from 'components/Quotation/QuotationStatusIcon.vue';
import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

type QuotationRow = {
  project: Project;
  hasQuotation: boolean;
  projectLength: number;
  isLastProject: boolean;
  quotation: Quotation | null;
  isFirstQuotation: boolean;
};

// Constants

const SCOPE_NAME = 'quotations-list-page';

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

const mc = useQuotationCalculator<Quotation>();

const $p = useListPage<Project, QuotationRow>(SCOPE_NAME, true);
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
const clientFilterStatus = ref<QuotationStatusName | null>(null);

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

const quotationStatusOptions = computed(() => [
  {
    label: 'All',
    value: null,
  },
  ...($p.items.value
    ? sortBy(
        uniqBy(
          $p.items.value.flatMap((project) => project.quotations),
          (value) => value.statusHelper.statusName,
        ).map((value) => ({
          label: value.statusHelper.text,
          value: value.statusHelper.statusName as QuotationStatusName,
        })),
        (value) => quotationStatusNames.indexOf(value.value),
      )
    : []),
]);

// Private Executions

// useTableView
$p.columns.value = [
  {
    name: 'createDate',
    label: 'Create Date',
    align: 'center',
    field: (row) => row.quotation?.createDate,
    format: (val) => f.date(val as Quotation['createDate'] | undefined),
    style: (row) => `${!row.hasQuotation ? 'cursor: default;' : ''}`,
  },
  {
    name: 'quotation',
    label: 'Quotation',
    align: 'left',
    field: (row) => row,
  },
  {
    name: 'total',
    label: 'Total',
    align: 'right',
    field: (row) => (row.quotation ? f.currency(mc.quotationTotal(row.quotation)) : undefined),
    style: (row) => `${!row.quotation ? 'display: none;' : ''}`,
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
    style: (row) => `${!row.hasQuotation ? 'cursor: default;' : ''}`,
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
    style: (row) => `${!row.hasQuotation ? 'cursor: default;' : ''}`,
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
    style: (row) => `max-width: 150px; ${!row.hasQuotation ? 'cursor: default;' : ''}`,
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
    style: (row) => `${!row.hasQuotation ? 'cursor: default;' : ''}`,
  },
];
$p.buildRows.value = (items) =>
  items.flatMap((item, itemIndex) => {
    const filteredQuotations = filterQuotations(item);

    return filteredQuotations.length === 0
      ? [
          {
            project: item,
            hasQuotation: false,
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
              hasQuotation: true,
              projectLength: filteredQuotations.length,
              isLastProject: itemIndex === items.length - 1,
              quotation,
              isFirstQuotation: quotationIndex === 0,
            }) as QuotationRow,
        );
  });
$p.onRowClick.value = (evt: Event, row: QuotationRow) => {
  const elm = evt.target as Element;

  if (elm.localName === 'td') {
    if (elm.classList.contains('project-cell') || !row.quotation) {
      if (row.hasQuotation) {
        onItemClick(evt as MouseEvent, row.project, false);
      }
    } else {
      void router.push(
        `/quotations/${row.project.urlFriendlyName}/${row.quotation.code.replaceAll('.', '_')}`,
      );
    }
  }
};

// usePageData
$p.modelFindKeyField.value = 'urlFriendlyName';

// useClientFilter
$p.clientFilterItems.value = (items) =>
  items.filter((item) => {
    let children = [...item.quotations];

    if (
      clientFilterText.value &&
      !stringContains(item.name, clientFilterText.value) &&
      !stringContains(item.customer.name, clientFilterText.value) &&
      (children = children.filter((value) => stringContains(value.code, clientFilterText.value)))
        .length === 0
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
$p.viewUrl.value = '/quotations/';

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
        clientFilterStatus.value === null ||
        value.statusHelper.statusName === clientFilterStatus.value,
    );
  }

  return project.quotations.filter(
    (value) =>
      stringContains(value.code, clientFilterText.value) &&
      (clientFilterStatus.value === null ||
        value.statusHelper.statusName === clientFilterStatus.value),
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
                label="Project Name, Customer, Code"
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
                :options="quotationStatusOptions"
              />
            </template>
          </div>
        </div>
      </template>

      <template #body-cell-createDate="{ props }">
        <q-td
          :auto-width="!!cr(props.row).quotation"
          :colspan="cr(props.row).quotation ? 1 : 3"
          :props="props"
        >
          <template v-if="!cr(props.row).quotation"> This project has no quotation. </template>

          <template v-else>
            {{ props.value }}
          </template>
        </q-td>
      </template>
      <template #body-cell-quotation="{ props }">
        <q-td v-if="!!cr(props.row).quotation" :props="props">
          <ObjectLink
            color="primary"
            :label="cr(props.row).quotation!.code"
            :to="`/quotations/${cr(props.row).project.urlFriendlyName}/${cr(
              props.row,
            ).quotation!.code.replaceAll('.', '_')}`"
          >
            <template #icon>
              <QuotationStatusIcon class="q-mr-sm" :quotation="cr(props.row).quotation!" />
            </template>
          </ObjectLink>
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
                This project has no quotation.
              </template>

              <template v-else>
                <div
                  v-for="quotation in filterQuotations(model).reverse()"
                  :key="quotation.code"
                  class="row q-col-gutter-x-xs"
                >
                  <div class="col-3">
                    <div class="text-muted">
                      {{ f.date(quotation.createDate) }}
                      <TopTooltip>Create Date</TopTooltip>
                    </div>
                  </div>

                  <div class="col-5">
                    <ObjectLink
                      color="primary"
                      :label="quotation.code"
                      size="sm"
                      :to="`/quotations/${
                        model.urlFriendlyName
                      }/${quotation.code.replaceAll('.', '_')}`"
                    >
                      <template #icon>
                        <QuotationStatusIcon class="q-mr-sm" :quotation="quotation" />
                      </template>
                    </ObjectLink>
                  </div>

                  <div class="col-4 text-right">
                    <div>
                      {{ f.currency(mc.quotationTotal(quotation)) }}
                      <TopTooltip>Total</TopTooltip>
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
