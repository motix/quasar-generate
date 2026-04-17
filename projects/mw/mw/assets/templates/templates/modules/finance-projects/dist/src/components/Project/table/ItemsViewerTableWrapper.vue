<script setup lang="ts">
import useProjectViewPage from 'composables/finance/project/useProjectViewPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { hasRole } = useFirebaseAuth();

const {
  // Auto sort
  addItem,
  f,
  m,
  mc,
  readonlyMode,
} = useProjectViewPage(props.scopeName);
</script>

<template>
  <ListTransition no-tag>
    <template v-if="m.items.length === 0">
      <!-- Smoothing enter animation -->
      <div key="smoothing"></div>

      <q-item v-if="!readonlyMode" key="addItem" class="q-py-md">
        <div class="text-center full-width">
          <q-btn color="primary" label="Add Item" @click="addItem" />
        </div>
      </q-item>
    </template>

    <q-expansion-item
      v-else
      key="items"
      default-opened
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      icon="fal fa-list-ol"
      label="Items"
      popup
    >
      <q-card>
        <StickyHeaders markup-table separated target="#itemsViewerTable" />

        <q-markup-table id="itemsViewerTable" bordered separator="cell" wrap-cells>
          <thead>
            <tr>
              <th class="q-table--col-auto-width">#</th>
              <th>Title / Description</th>
              <th>Product Type</th>
              <th>Production Salary Amount</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, itemIndex) in m.items" :key="itemIndex">
              <!-- Number -->
              <td>
                {{ item.number }}
              </td>

              <!-- Title / Description -->
              <td>
                <div>
                  {{ item.title }}
                </div>
                <div v-if="item.description" class="text-caption text-muted">
                  {{ item.description }}
                </div>
              </td>

              <!-- Product Type -->
              <!-- Production Salary Amount -->
              <td v-if="item.isFinanceOnly" class="text-center" colspan="2">
                <q-avatar v-if="item.isQuotationOnly" color="accent" size="sm">
                  <q-icon class="q-my-xs" color="white" name="fal fa-file-invoice" />
                  <TopTooltip>Quotation Only</TopTooltip>
                </q-avatar>
                <q-avatar v-else color="accent" size="sm">
                  <q-icon class="q-my-xs" color="white" name="fal fa-usd-circle" />
                  <TopTooltip>Finance Only</TopTooltip>
                </q-avatar>
              </td>
              <template v-else>
                <!-- Product Type -->
                <td class="text-center text-no-wrap">
                  {{ item.productType }}
                </td>

                <!-- Production Salary Amount -->
                <td class="text-right">
                  {{ f.currency(mc.itemProductionSalaryAmount(item)) }}
                </td>
              </template>

              <!-- Quantity -->
              <td class="text-right">
                {{ item.quantity }}
              </td>

              <!-- Unit Price -->
              <!-- Amount -->
              <td v-if="item.isProductionOnly" class="text-center" colspan="2">
                <q-avatar color="accent" size="sm">
                  <q-icon class="q-my-xs" color="white" name="fal fa-thunderstorm" />
                  <TopTooltip>Production Only</TopTooltip>
                </q-avatar>
              </td>
              <template v-else>
                <!-- Unit Price -->
                <td class="text-right">
                  {{ f.currency(item.unitPrice) }}
                </td>

                <!-- Amount -->
                <td class="text-right">
                  {{ f.currency(mc.itemAmount(item)) }}
                </td>
              </template>
            </tr>

            <!-- Subtotal -->
            <tr>
              <!-- Number -->
              <!-- Title / Description -->
              <!-- Product Type -->
              <td class="text-right" colspan="3">
                <strong>Subtotal</strong>
              </td>

              <!-- Production Salary Amount -->
              <td></td>

              <!-- Quantity -->
              <td class="text-right">
                <strong>{{ mc.projectTotalQuantity(m) }}</strong>
              </td>

              <!-- Unit Price -->
              <td></td>

              <!-- Amount -->
              <td class="text-right">
                <strong>
                  {{ f.currency(mc.projectSubtotal(m)) }}
                </strong>
              </td>
            </tr>

            <!-- Discount -->
            <!-- After Discount -->
            <template v-if="m.discount !== undefined">
              <tr>
                <!-- Number -->
                <!-- Title / Description -->
                <!-- Product Type -->
                <td class="text-right" colspan="3">
                  <strong>Discount</strong>
                </td>

                <!-- Production Salary Amount -->
                <!-- Quantity -->
                <!-- Unit Price -->
                <td colspan="3"></td>

                <!-- Amount -->
                <td class="text-right">
                  {{ f.currency(m.discount, true) }}
                </td>
              </tr>

              <tr>
                <!-- Number -->
                <!-- Title / Description -->
                <!-- Product Type -->
                <td class="text-right" colspan="3">
                  <strong>After Discount</strong>
                </td>

                <!-- Production Salary Amount -->
                <!-- Quantity -->
                <!-- Unit Price -->
                <td colspan="3"></td>

                <!-- Amount -->
                <td class="text-right">
                  <strong>
                    {{ f.currency(mc.projectVatExcludedTotal(m)) }}
                  </strong>
                </td>
              </tr>
            </template>

            <!-- VAT -->
            <tr v-if="m.vatPercent !== undefined || m.vatableAmount !== undefined">
              <!-- Number -->
              <!-- Title / Description -->
              <!-- Product Type -->
              <td class="text-right" colspan="3">
                <strong>VAT</strong> ({{
                  m.vatPercent === undefined ? 'None' : f.percent(m.vatPercent)
                }})
              </td>

              <!-- Production Salary Amount -->
              <!-- Quantity -->
              <!-- Unit Price -->
              <td class="text-right" colspan="3">
                {{ f.currency(m.vatableAmount) }}
              </td>

              <!-- Amount -->
              <td class="text-right">
                {{ f.currency(mc.projectVat(m)) }}
              </td>
            </tr>

            <!-- Total -->
            <tr>
              <!-- Number -->
              <!-- Title / Description -->
              <!-- Product Type -->
              <td class="text-right" colspan="3">
                <strong>Total</strong>
              </td>

              <!-- Production Salary Amount -->
              <td class="text-right">
                <strong>
                  {{ f.currency(mc.projectTotalProductionSalary(m)) }}
                </strong>
              </td>

              <!-- Quantity -->
              <!-- Unit Price -->
              <td class="text-center" colspan="2">
                <template v-if="hasRole('manager') && mc.projectPriceRatio(m) !== undefined">
                  x{{ mc.projectPriceRatio(m) }}
                </template>
              </td>

              <!-- Amount -->
              <td class="text-right">
                <strong>{{ f.currency(mc.projectTotal(m)) }}</strong>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-expansion-item>
  </ListTransition>
</template>
