<script setup lang="ts">
import { computed, ref } from 'vue';

import { Timestamp, where } from 'firebase/firestore';

import { sortBy, uniqBy } from 'lodash-es';

import type { InvoiceStatusName } from 'utils/finance/Invoice/InvoiceStatus.js';
import { invoiceStatusNames } from 'utils/finance/Invoice/InvoiceStatus.js';
import stringContains from 'utils/stringContains.js';

import type { Invoice } from 'models/finance/index.js';

import {
  generalInvoicesStoreDefaultSort,
  useGeneralInvoicesStore,
} from 'stores/finance/GeneralInvoices.js';

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

// Constants

const SCOPE_NAME = 'general-invoices-list-page';

// Options

defineOptions({ name: 'AliveIndex' });

// Private

const options: FilterOptions<'current' | number | 'archived' | 'all'>[] = [
  {
    type: 'current',
    label: 'Current Invoices',
    queryConstraints: [where('isArchived', '==', false), ...generalInvoicesStoreDefaultSort],
  },
];

useSelectDateRange().yearOptions.value.forEach((year) => {
  options.push({
    type: year,
    label: year.toString(),
    selectedLabel: `${year} Invoices`,
    queryConstraints: [
      where('issueDate', '>=', Timestamp.fromDate(new Date(year, 0, 1))),
      where('issueDate', '<', Timestamp.fromDate(new Date(year + 1, 0, 1))),
      ...generalInvoicesStoreDefaultSort,
    ],
  });
});

options.push(
  {
    type: 'archived',
    label: 'Archived Invoices',
    queryConstraints: [where('isArchived', '==', true), ...generalInvoicesStoreDefaultSort],
  },
  {
    type: 'all',
    label: 'All Invoices',
    queryConstraints: [...generalInvoicesStoreDefaultSort],
  },
);

// Composables

const f = useFormats();

const { isTableView, isCardsView } = useMultiViews();

const mc = useInvoiceCalculator<Invoice>();

const $p = useListPage<Invoice, Invoice>(SCOPE_NAME, true);
const {
  // Auto sort
  clientFilterText,
  cr,
  itemLink,
  items,
  listItemCardWidth,
  onItemClick,
} = $p;

const { store, onLoadNextPage } = useListPageStore<Invoice>(
  useGeneralInvoicesStore(),
  $p.loadPage,
  $p.appendItems,
  $p.updateItems,
);

const { filterLabel, filterItems, filterOptions } = useListPageFilterWithOptionsAndStore<
  Invoice,
  'current' | number | 'archived' | 'all'
>($p.ready, $p.queryConstraints, 'current', store, $p.loadFirstPage, $p.resetItems, ...options);

// Data

const clientFilterStatus = ref<InvoiceStatusName | null>(null);
const clientFilterBalanceNotZero = ref(false);

// Computed

const invoiceStatusOptions = computed(() => [
  {
    label: 'All',
    value: null,
  },
  ...($p.items.value
    ? sortBy(
        uniqBy($p.items.value, (value) => value.statusHelper.statusName).map((value) => ({
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
    field: (row) => row,
    format: (val) => ({
      issueDate: f.date((val as Invoice | undefined)?.issueDate),
      createDate: f.date((val as Invoice | undefined)?.createDate),
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
    name: 'referenceNumber',
    label: 'Reference Number',
    align: 'left',
    field: 'referenceNumber',
    classes: 'text-wrap',
  },
  {
    name: 'group',
    label: 'Group',
    align: 'center',
    field: 'group',
    style: 'max-width: 150px',
  },
  {
    name: 'customerCustomerExtraInfo',
    label: 'Customer / Extra Info',
    align: 'center',
    field: 'customer',
    style: 'max-width: 150px',
    classes: 'text-wrap',
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
      total: f.currency(mc.invoiceTotal(row)),
      balance: f.currency(mc.invoiceBalance(row)),
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
$p.modelFindKeyField.value = 'code';

// useClientFilter
$p.clientFilterItems.value = (items) =>
  items.filter((item) => {
    if (
      clientFilterText.value &&
      !stringContains(item.code, clientFilterText.value) &&
      !stringContains(item.content, clientFilterText.value) &&
      !stringContains(item.referenceNumber || '', clientFilterText.value) &&
      !stringContains(item.group?.name || '', clientFilterText.value) &&
      !stringContains(item.customer.name, clientFilterText.value) &&
      (!item.customerExtraInfo || !stringContains(item.customerExtraInfo, clientFilterText.value))
    ) {
      return false;
    }

    if (clientFilterStatus.value && item.statusHelper.statusName !== clientFilterStatus.value) {
      return false;
    }

    if (clientFilterBalanceNotZero.value && mc.invoiceBalance(item) === 0) {
      return false;
    }

    return true;
  });

// useNavigateToViewPage
$p.viewUrl.value = '/general-invoices/';

// useNavigateToNewPage
$p.newUrl.value = '/general-invoices/new';
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
                label="Code, Content, Reference Number, Group, Customer"
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
                icon="fal fa-file-invoice-dollar"
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
      <template #body-cell-referenceNumber="{ props }">
        <q-td :props="props">
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
      <template #body-cell-group="{ props }">
        <q-td :props="props">
          <ObjectLink
            v-if="props.value"
            color="primary"
            :label="props.value.name"
            :to="`/invoice-groups/${props.value.id}`"
          />
        </q-td>
      </template>
      <template #header-cell-customerCustomerExtraInfo="{ props }">
        <q-th :props="props">
          Customer<br />
          <span class="text-caption">Extra Info</span>
        </q-th>
      </template>
      <template #body-cell-customerCustomerExtraInfo="{ props }">
        <q-td :props="props">
          <div>
            <ObjectLink
              color="primary"
              :label="props.value.name"
              :to="`/customers/${props.value.code}`"
            />
          </div>
          <div v-if="cr(props.row).customerExtraInfo" class="text-caption">
            {{ cr(props.row).customerExtraInfo }}
          </div>
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
            <div>
              <ObjectLink
                v-if="model.group"
                icon-right="fal fa-layer-group"
                :label="model.group.name"
                size="sm"
                :to="`/invoice-groups/${model.group.id}`"
              />
            </div>

            <div class="q-mt-sm">
              <StatusBadge :status="model.statusHelper" />
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
              {{ f.currency(mc.invoiceTotal(model)) }}
              <TopTooltip>Total</TopTooltip>
            </q-item-label>
            <q-item-label caption>
              <span class="text-muted">
                {{ f.currency(mc.invoiceBalance(model)) }}
              </span>
              <TopTooltip>Balance</TopTooltip>
            </q-item-label>
          </template>

          <template #body>
            <div class="col-6">
              <ObjectLink
                color="primary"
                icon="fal fa-user-crown"
                :label="
                  model.customer.name +
                  (model.customerExtraInfo ? ` (${model.customerExtraInfo})` : '')
                "
                size="sm"
                :to="`/customers/${model.customer.code}`"
              />
            </div>

            <div class="col-12 text-body2">
              {{ model.content }}
            </div>

            <div v-if="model.referenceNumber" class="col-6">
              <div
                v-for="(referenceNumber, index) of model.referenceNumber!.split(', ')"
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
