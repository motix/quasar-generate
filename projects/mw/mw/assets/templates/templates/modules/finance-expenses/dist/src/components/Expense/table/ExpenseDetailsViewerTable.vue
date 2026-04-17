<script setup lang="ts">
import { useExpenseViewPage } from 'composables/finance/expense/useExpenseEditPage.js';

import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  f,
  m,
  mc,
} = useExpenseViewPage(props.scopeName);
</script>

<template>
  <q-expansion-item
    default-opened
    expand-icon-class="text-white"
    header-class="text-white text-h6 bg-accent"
    icon="fal fa-list-ol"
    label="Details"
    popup
  >
    <q-card>
      <StickyHeaders markup-table separated target="#detailsViewerTable" />

      <q-markup-table id="detailsViewerTable" bordered separator="cell" wrap-cells>
        <thead>
          <tr>
            <th class="q-table--col-auto-width">#</th>
            <th>Content</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          <!-- Details -->
          <tr v-for="(detail, index) in m.details" :key="index">
            <!-- Number -->
            <td class="text-right">
              {{ index + 1 }}
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
              {{ f.currency(mc.expenseDetailAmount(detail)) }}
            </td>
          </tr>

          <!-- Subtotal -->
          <tr>
            <!-- Number -->
            <!-- Content -->
            <td class="text-right" colspan="2">
              <strong>Subtotal</strong>
            </td>

            <!-- Quantity -->
            <td class="text-right">
              <strong>{{ mc.expenseTotalQuantity(m) }}</strong>
            </td>

            <!-- Unit Price -->
            <td></td>

            <!-- Amount -->
            <td class="text-right">
              <strong>
                {{ f.currency(mc.expenseSubtotal(m)) }}
              </strong>
            </td>
          </tr>

          <!-- Discount -->
          <!-- After Discount -->
          <template v-if="m.discount !== undefined">
            <tr>
              <!-- Number -->
              <!-- Content -->
              <td class="text-right" colspan="2">
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

            <tr>
              <!-- Number -->
              <!-- Content -->
              <td class="text-right" colspan="2">
                <strong>After Discount</strong>
              </td>

              <!-- Quantity -->
              <!-- Unit Price -->
              <td colspan="2"></td>

              <!-- Amount -->
              <td class="text-right">
                <strong>
                  {{ f.currency(mc.expenseVatExcludedTotal(m)) }}
                </strong>
              </td>
            </tr>
          </template>

          <!-- VAT -->
          <template v-if="m.vatPercent !== undefined">
            <tr v-if="m.secondVatPercent === undefined || m.secondVatableAmount === undefined">
              <!-- Number -->
              <!-- Content -->
              <td class="text-right" colspan="2">
                <strong>VAT</strong> ({{ f.percent(m.vatPercent) }})
              </td>

              <!-- Quantity -->
              <!-- Unit Price -->
              <td class="text-right" colspan="2">
                {{ f.currency(m.vatableAmount) }}
              </td>

              <!-- Amount -->
              <td>
                <div class="row justify-between no-wrap q-gutter-x-xs">
                  <span>{{
                    m.vatAdjustment !== undefined
                      ? `${m.vatAdjustment > 0 ? '+' : ''}${f.currency(m.vatAdjustment)}`
                      : ''
                  }}</span>
                  <span>{{ f.currency(mc.expenseVat(m)) }}</span>
                </div>
              </td>
            </tr>

            <template v-else>
              <tr>
                <!-- Number -->
                <!-- Content -->
                <td class="text-right" colspan="2">
                  <strong>VAT 1</strong> ({{ f.percent(m.vatPercent) }})
                </td>

                <!-- Quantity -->
                <!-- Unit Price -->
                <td class="text-right" colspan="2">
                  {{
                    f.currency(
                      (m.vatableAmount === undefined
                        ? mc.expenseVatExcludedTotal(m)
                        : m.vatableAmount) - m.secondVatableAmount,
                    )
                  }}
                </td>

                <!-- Amount -->
                <td rowspan="2">
                  <div class="row justify-between no-wrap q-gutter-x-xs">
                    <span>{{
                      m.vatAdjustment !== undefined
                        ? `${m.vatAdjustment > 0 ? '+' : ''}${f.currency(m.vatAdjustment)}`
                        : ''
                    }}</span>
                    <span>{{ f.currency(mc.expenseVat(m)) }}</span>
                  </div>
                </td>
              </tr>

              <tr>
                <!-- Number -->
                <!-- Content -->
                <td class="text-right" colspan="2">
                  <strong>VAT 2</strong> ({{ f.percent(m.secondVatPercent) }})
                </td>

                <!-- Quantity -->
                <!-- Unit Price -->
                <td class="text-right" colspan="2">
                  {{ f.currency(m.secondVatableAmount) }}
                </td>
              </tr>
            </template>
          </template>

          <!-- Total -->
          <tr>
            <!-- Number -->
            <!-- Content -->
            <td class="text-right" colspan="2">
              <strong>Total</strong>
            </td>

            <!-- Quantity -->
            <!-- Unit Price -->
            <td colspan="2"></td>

            <!-- Amount -->
            <td class="text-right">
              <strong>{{ f.currency(mc.expenseTotal(m)) }}</strong>
            </td>
          </tr>

          <!-- Total Payment -->
          <tr>
            <!-- Number -->
            <!-- Content -->
            <td class="text-right" colspan="2">Total Payment</td>

            <!-- Quantity -->
            <!-- Unit Price -->
            <td colspan="2"></td>

            <!-- Amount -->
            <td class="text-right">
              {{ f.currency(mc.expenseTotalPayment(m), true) }}
            </td>
          </tr>

          <!-- Balance -->
          <tr>
            <!-- Number -->
            <!-- Content -->
            <td class="text-right" colspan="2">
              <strong>Balance</strong>
            </td>

            <!-- Quantity -->
            <!-- Unit Price -->
            <td colspan="2"></td>

            <!-- Amount -->
            <td class="text-right">
              <strong>{{ f.currency(mc.expenseBalance(m)) }}</strong>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card>
  </q-expansion-item>
</template>
