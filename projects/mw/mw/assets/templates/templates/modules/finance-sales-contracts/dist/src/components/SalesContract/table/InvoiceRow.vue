<script setup lang="ts">
import { computed } from 'vue';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';

// Props

const props = defineProps<{
  scopeName: string;
  invoiceIndex: number;
}>();

// Composables

const $p = useSalesContractViewPage(props.scopeName);
const {
  // Auto sort
  editMode,
  f,
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
  <tr>
    <!-- Number -->
    <td class="text-right">
      {{ invoiceIndex + 1 }}
    </td>

    <!-- Project -->
    <td>
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
    </td>

    <!-- Invoice -->
    <td>
      <ObjectLink
        v-if="record.project && record.invoice"
        color="primary"
        :label="record.invoice.code"
        :to="`/project-invoices/${
          record.project.urlFriendlyName
        }/${record.invoice.code.replaceAll('.', '_')}`"
      >
        <template #icon>
          <StatusIcon
            class="q-mr-sm"
            icon="fal fa-file-invoice"
            :status="record.invoice.statusHelper"
          />
        </template>
      </ObjectLink>

      <template v-else-if="record.invoice">
        <div>
          <ObjectLink
            color="primary"
            :label="record.invoice.code"
            :to="`/general-invoices/${record.invoice.code.replaceAll('.', '_')}`"
          >
            <template #icon>
              <StatusIcon
                class="q-mr-sm"
                icon="fal fa-file-invoice"
                :status="record.invoice.statusHelper"
              />
            </template>
          </ObjectLink>
        </div>
        <div class="text-caption">
          {{ record.invoice.content }}
        </div>
      </template>
    </td>

    <!-- Ref. Number -->
    <td>
      <template v-if="record.invoice?.referenceNumber">
        <div
          v-for="(referenceNumber, index) in (record.invoice?.referenceNumber).split(', ')"
          :key="`${index}-${referenceNumber}`"
        >
          <ObjectLink icon="fal fa-hashtag" :label="referenceNumber" :ripple="false" />
        </div>
      </template>
    </td>

    <!-- Subtotal -->
    <td class="text-right">
      <div>
        {{ f.currency(mc.invoiceSubtotal(record.invoice)) }}
      </div>
      <div v-if="record.invoice?.relocatedSubtotal !== undefined" class="text-caption">
        {{ f.currency(record.invoice.relocatedSubtotal, true) }}
        <TopTooltip>Relocated Subtotal</TopTooltip>
      </div>
    </td>

    <!-- VAT -->
    <td>
      <div
        v-if="record.invoice?.vatPercent !== undefined"
        class="row justify-between no-wrap q-gutter-x-xs"
      >
        <span
          >({{ f.percent(record.invoice.vatPercent)
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
          }})</span
        >
        <span>{{ f.currency(mc.invoiceVat(record.invoice)) }}</span>
      </div>
      <div v-if="record.invoice?.relocatedVat !== undefined" class="text-caption text-right">
        {{ f.currency(record.invoice.relocatedVat, true) }}
        <TopTooltip>Relocated VAT</TopTooltip>
      </div>
    </td>

    <!-- Total -->
    <td class="text-right">
      {{ f.currency(mc.invoiceTotal(record.invoice)) }}
    </td>

    <!-- Buttons -->
    <td v-if="editMode" class="vertical-top">
      <q-btn color="negative" icon="fal fa-trash-alt" outline padding="sm" @click="removeRecord()">
        <TopTooltip>
          Remove
          <template v-if="record.project">Project</template>
          <template v-else>General Invoice</template>
        </TopTooltip>
      </q-btn>
    </td>
  </tr>
</template>
