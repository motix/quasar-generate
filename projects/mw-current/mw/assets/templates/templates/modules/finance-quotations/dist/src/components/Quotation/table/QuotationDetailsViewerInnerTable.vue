<script setup lang="ts">
import useQuotationViewPage from 'composables/finance/quotation/useQuotationViewPage.js';

// Props

const props = withDefaults(
  defineProps<{
    scopeName: string;
    printerFriendly?: boolean;
  }>(),
  {
    printerFriendly: false,
  },
);

// Composables

const $p = useQuotationViewPage(props.scopeName);
const {
  // Auto sort
  displayDetails,
  f,
  m,
  mc,
} = $p;
</script>

<template>
  <q-markup-table bordered separator="cell" wrap-cells>
    <thead>
      <tr>
        <th class="q-table--col-auto-width">#</th>
        <th
          v-if="!printerFriendly && mc.quotationHasQuotationOnly(m)"
          class="q-table--col-auto-width"
        >
          <q-avatar color="grey-9" size="sm">
            <q-icon class="q-my-xs" color="white" name="fal fa-file-invoice" />
            <TopTooltip>Quotation Only</TopTooltip>
          </q-avatar>
        </th>
        <th>Content</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>

    <tbody>
      <!-- Details -->
      <tr v-for="(detail, index) in displayDetails" :key="index">
        <!-- Number -->
        <td class="text-right">
          {{ index + 1 }}
        </td>

        <!-- Quotation Only -->
        <td v-if="!printerFriendly && mc.quotationHasQuotationOnly(m)">
          <q-avatar v-if="detail.isQuotationOnly" color="accent" size="sm">
            <q-icon class="q-my-xs" color="white" name="fal fa-file-invoice" />
            <TopTooltip>Quotation Only</TopTooltip>
          </q-avatar>
        </td>

        <!-- Content -->
        <td>
          {{ detail.content }}
        </td>

        <!-- Quantity -->
        <td class="text-right">
          {{ detail.quantity }}
        </td>

        <!-- Unit Price -->
        <td class="text-right">
          {{ f.currency(detail.unitPrice) }}
        </td>

        <!-- Amount -->
        <td class="text-right">
          {{ f.currency(mc.quotationDetailAmount(detail)) }}
        </td>
      </tr>

      <!-- Subtotal -->
      <tr>
        <!-- Number -->
        <!-- Quotation Only -->
        <!-- Content -->
        <td
          class="text-right"
          :colspan="!printerFriendly && mc.quotationHasQuotationOnly(m) ? 3 : 2"
        >
          <strong>Subtotal</strong>
        </td>

        <!-- Quantity -->
        <td class="text-right">
          <strong>{{ mc.quotationTotalQuantity(m) }}</strong>
        </td>

        <!-- Unit Price -->
        <td></td>

        <!-- Amount -->
        <td class="text-right">
          <strong>
            {{ f.currency(mc.quotationSubtotal(m)) }}
          </strong>
        </td>
      </tr>

      <!-- Discount -->
      <tr v-if="m.discount !== undefined">
        <!-- Number -->
        <!-- Quotation Only -->
        <!-- Content -->
        <td
          class="text-right"
          :colspan="!printerFriendly && mc.quotationHasQuotationOnly(m) ? 3 : 2"
        >
          <strong>Discount</strong>
        </td>

        <!-- Quantity -->
        <!-- Unit Price -->
        <td colspan="2"></td>

        <!-- Amount -->
        <td class="text-right">
          {{ f.currency(m.discount, true) }}
        </td>
      </tr>

      <!-- After Discount -->
      <tr v-if="m.discount !== undefined">
        <!-- Number -->
        <!-- Quotation Only -->
        <!-- Content -->
        <td
          class="text-right"
          :colspan="!printerFriendly && mc.quotationHasQuotationOnly(m) ? 3 : 2"
        >
          <strong>After Discount</strong>
        </td>

        <!-- Quantity -->
        <!-- Unit Price -->
        <td colspan="2"></td>

        <!-- Amount -->
        <td class="text-right">
          <strong>
            {{ f.currency(mc.quotationVatExcludedTotal(m)) }}
          </strong>
        </td>
      </tr>

      <!-- VAT -->
      <tr v-if="m.vatPercent !== undefined || m.vatableAmount !== undefined">
        <!-- Number -->
        <!-- Quotation Only -->
        <!-- Content -->
        <td
          class="text-right"
          :colspan="!printerFriendly && mc.quotationHasQuotationOnly(m) ? 3 : 2"
        >
          <strong>VAT</strong> ({{ m.vatPercent === undefined ? 'None' : f.percent(m.vatPercent) }})
        </td>

        <!-- Quantity -->
        <!-- Unit Price -->
        <td class="text-right" colspan="2">
          {{ f.currency(m.vatableAmount) }}
        </td>

        <!-- Amount -->
        <td class="text-right">
          {{ f.currency(mc.quotationVat(m)) }}
        </td>
      </tr>

      <!-- Total -->
      <tr>
        <!-- Number -->
        <!-- Quotation Only -->
        <!-- Content -->
        <td
          class="text-right"
          :colspan="!printerFriendly && mc.quotationHasQuotationOnly(m) ? 3 : 2"
        >
          <strong>Total</strong>
        </td>

        <!-- Quantity -->
        <!-- Unit Price -->
        <td colspan="2"></td>

        <!-- Amount -->
        <td class="text-right">
          <strong>{{ f.currency(mc.quotationTotal(m)) }}</strong>
        </td>
      </tr>
    </tbody>
  </q-markup-table>
</template>
