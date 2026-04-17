<script setup lang="ts">
import { computed } from 'vue';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Props

const props = defineProps<{
  scopeName: string;
  invoiceIndex: number;
}>();

// Composables

const { listItemCardWidth } = requiredConfigEntries('listItemCardWidth');

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  editMode,
  f,
  onInvoiceClick,
  mc,
} = $p;

// Computed

const record = computed(
  () =>
    $p.invoices.value[props.invoiceIndex] ||
    (() => {
      throw new Error('[finance-sales-contracts] Index out of range');
    })(),
);

// Methods

function removeRecord() {
  if (record.value.project) {
    $p.removeProject($p.vm.value.projects.indexOf(record.value.project));
  } else if (record.value.invoice) {
    $p.removeGeneralInvoice($p.vm.value.generalInvoices.indexOf(record.value.invoice));
  }
}
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-file-invoice-dollar"
    avatar-size=""
    avatar-top
    body-class="text-caption"
    :clickable="!!record.invoice"
    :external-link-url="
      record.invoice
        ? record.project
          ? `/project-invoices/${
              record.project.urlFriendlyName
            }/${record.invoice.code.replaceAll('.', '_')}`
          : `/general-invoices/${record.invoice.code.replaceAll('.', '_')}`
        : undefined
    "
    header-background-color="primary"
    header-dark
    side-top
    :style="{ maxWidth: listItemCardWidth + 'px' }"
    :title="record.invoice?.code || 'This project has no active invoice.'"
    :title-top="!!record.invoice"
    @click="onInvoiceClick(record)"
  >
    <template v-if="record.invoice" #main>
      <div class="q-mt-sm">
        <StatusBadge v-if="record.invoice" revert-color :status="record.invoice.statusHelper" />
      </div>

      <div v-if="record.invoice.referenceNumber" class="q-mt-sm">
        <div
          v-for="(referenceNumber, index) in record.invoice.referenceNumber.split(', ')"
          :key="`${index}-${referenceNumber}`"
        >
          <ObjectLink icon="fal fa-hashtag" :label="referenceNumber" :ripple="false" />
        </div>
      </div>
    </template>

    <template #side>
      <q-item-label caption class="text-overline"> #{{ invoiceIndex + 1 }} </q-item-label>
    </template>

    <template #bezel-less-top>
      <q-card-section :class="{ 'text-body2': !record.project }">
        <ObjectLink
          v-if="record.project"
          color="primary"
          :label="record.project.name"
          :to="`/projects/${record.project.urlFriendlyName}`"
        >
          <template #icon>
            <StatusIcon
              class="q-mr-sm"
              icon="fal fa-briefcase"
              :status="record.project.statusHelper"
            />
          </template>
        </ObjectLink>

        <template v-else>
          {{ record.invoice?.content }}
        </template>
      </q-card-section>

      <q-separator v-if="record.invoice" />
    </template>

    <template v-if="record.invoice" #body>
      <div class="row justify-between">
        <div>Subtotal</div>
        <div class="text-right">
          <div>
            {{ f.currency(mc.invoiceSubtotal(record.invoice)) }}
          </div>
          <div v-if="record.invoice?.relocatedSubtotal !== undefined">
            {{ f.currency(record.invoice.relocatedSubtotal, true) }}
            <TopTooltip>Relocated Subtotal</TopTooltip>
          </div>
        </div>
      </div>
      <div
        v-if="
          record.invoice?.vatPercent !== undefined || record.invoice?.relocatedVat !== undefined
        "
        class="row justify-between"
      >
        <div>
          VAT
          <template v-if="record.invoice?.vatPercent !== undefined">
            ({{ f.percent(record.invoice.vatPercent)
            }}{{
              record.invoice.secondVatPercent !== undefined &&
              record.invoice.secondVatableAmount !== undefined
                ? `, ${f.percent(record.invoice.secondVatPercent)}`
                : ''
            }}{{
              record.invoice.vatAdjustment !== undefined
                ? `, ${record.invoice.vatAdjustment > 0 ? '+' : ''}${f.currency(
                    record.invoice.vatAdjustment,
                  )}`
                : ''
            }})
          </template>
        </div>
        <div class="text-right">
          <div v-if="record.invoice?.vatPercent !== undefined">
            {{ f.currency(mc.invoiceVat(record.invoice)) }}
          </div>
          <div v-if="record.invoice?.relocatedVat !== undefined">
            {{ f.currency(record.invoice.relocatedVat, true) }}
            <TopTooltip>Relocated VAT</TopTooltip>
          </div>
        </div>
      </div>
      <div class="row justify-between">
        <div>
          <strong>Total</strong>
        </div>
        <div>
          <strong>{{ f.currency(mc.invoiceTotal(record.invoice)) }}</strong>
        </div>
      </div>
    </template>

    <template v-if="editMode" #bezel-less>
      <q-separator inset />

      <q-card-actions align="around">
        <q-btn
          color="negative"
          icon="fal fa-trash-alt"
          outline
          padding="sm"
          @click="removeRecord()"
        >
          <TopTooltip>
            Remove
            <template v-if="record.project">Project</template>
            <template v-else>General Invoice</template>
          </TopTooltip>
        </q-btn>
      </q-card-actions>
    </template>
  </ExpandableCard>
</template>
