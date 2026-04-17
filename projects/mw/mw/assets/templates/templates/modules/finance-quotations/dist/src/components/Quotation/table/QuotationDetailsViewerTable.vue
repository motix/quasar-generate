<script setup lang="ts">
import { Dark } from 'quasar';

import useQuotationViewPage from 'composables/finance/quotation/useQuotationViewPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import QuotationDetailsViewerInnerTable from 'components/Quotation/table/QuotationDetailsViewerInnerTable.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { hasRole } = useFirebaseAuth();

const $p = useQuotationViewPage(props.scopeName);
const {
  // Auto sort
  f,
  m,
  pmc,
  pm,
  projectAddedItems,
  mc,
  showComparision,
} = $p;
</script>

<template>
  <q-list class="rounded-list">
    <q-expansion-item
      default-opened
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      icon="fal fa-list-ol"
      label="Details"
      popup
    >
      <q-card>
        <FadeTransition>
          <div v-if="!showComparision" key="comparision-hidden">
            <StickyHeaders markup-table separated target="#detailsViewerTable" />

            <QuotationDetailsViewerInnerTable id="detailsViewerTable" :scope-name="scopeName" />
          </div>

          <div v-else key="comparision-showing">
            <StickyHeaders markup-table separated target="#detailsViewerTable" />

            <q-markup-table id="detailsViewerTable" bordered separator="cell" wrap-cells>
              <thead>
                <tr>
                  <!-- Number -->
                  <td></td>
                  <!-- Content -->
                  <td></td>
                  <th colspan="4">Quotation</th>
                  <th colspan="4">Project</th>
                  <!-- Status -->
                  <th></th>
                </tr>
                <tr>
                  <th class="q-table--col-auto-width">#</th>
                  <th>Content</th>
                  <th>Production Salary Amount</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                  <th>Production Salary Amount</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                  <th>Status</th>
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

                  <!-- Production Salary Amount -->
                  <td
                    v-if="detail.productionSalaryUnitPrice === undefined"
                    class="text-center"
                    :class="{
                      'bg-amber-2':
                        !Dark.isActive && mc.quotationDetailIsQuotationOnlyChanged(detail, pm),
                      'bg-lime-10':
                        Dark.isActive && mc.quotationDetailIsQuotationOnlyChanged(detail, pm),
                    }"
                  >
                    <q-avatar v-if="detail.isQuotationOnly" color="accent" size="sm">
                      <q-icon class="q-my-xs" color="white" name="fal fa-file-invoice" />
                      <TopTooltip>Quotation Only</TopTooltip>
                    </q-avatar>
                    <q-avatar v-else color="accent" size="sm">
                      <q-icon class="q-my-xs" color="white" name="fal fa-usd-circle" />
                      <TopTooltip>Finance Only</TopTooltip>
                    </q-avatar>
                  </td>
                  <td
                    v-else
                    class="text-right"
                    :class="{
                      'bg-amber-2':
                        !Dark.isActive &&
                        mc.quotationDetailProductionSalaryUnitPriceChanged(detail, pm),
                      'bg-lime-10':
                        Dark.isActive &&
                        mc.quotationDetailProductionSalaryUnitPriceChanged(detail, pm),
                    }"
                  >
                    {{ f.currency(mc.quotationDetailProductionSalaryAmount(detail)) }}
                  </td>

                  <!-- Quantity -->
                  <td
                    class="text-right"
                    :class="{
                      'text-strike': detail.isProductionOnly,
                      'text-muted': detail.isProductionOnly,
                      'bg-amber-2': !Dark.isActive && mc.quotationDetailQuantityChanged(detail, pm),
                      'bg-lime-10': Dark.isActive && mc.quotationDetailQuantityChanged(detail, pm),
                    }"
                  >
                    {{ detail.quantity }}
                  </td>

                  <!-- Unit Price -->
                  <!-- Amount -->
                  <td
                    v-if="detail.isProductionOnly"
                    class="text-center"
                    :class="{
                      'bg-amber-2':
                        !Dark.isActive && mc.quotationDetailIsProductionOnlyChanged(detail, pm),
                      'bg-lime-10':
                        Dark.isActive && mc.quotationDetailIsProductionOnlyChanged(detail, pm),
                    }"
                    colspan="2"
                  >
                    <q-avatar color="accent" size="sm">
                      <q-icon class="q-my-xs" color="white" name="fal fa-thunderstorm" />
                      <TopTooltip>Production Only</TopTooltip>
                    </q-avatar>
                  </td>
                  <template v-else>
                    <!-- Unit Price -->
                    <td
                      class="text-right"
                      :class="{
                        'bg-amber-2':
                          !Dark.isActive && mc.quotationDetailUnitPriceChanged(detail, pm),
                        'bg-lime-10':
                          Dark.isActive && mc.quotationDetailUnitPriceChanged(detail, pm),
                      }"
                    >
                      {{ f.currency(detail.unitPrice) }}
                    </td>

                    <!-- Amount -->
                    <td
                      class="text-right"
                      :class="{
                        'bg-amber-2': !Dark.isActive && mc.quotationDetailAmountChanged(detail, pm),
                        'bg-lime-10': Dark.isActive && mc.quotationDetailAmountChanged(detail, pm),
                      }"
                    >
                      {{ f.currency(mc.quotationDetailAmount(detail)) }}
                    </td>
                  </template>

                  <template v-if="mc.quotationDetailHasItem(detail, pm)">
                    <!-- Production Salary Amount -->
                    <td
                      v-if="mc.quotationDetailSafeItem(detail, pm).isFinanceOnly"
                      class="text-center"
                      :class="{
                        'bg-amber-2':
                          !Dark.isActive && mc.quotationDetailIsQuotationOnlyChanged(detail, pm),
                        'bg-lime-10':
                          Dark.isActive && mc.quotationDetailIsQuotationOnlyChanged(detail, pm),
                        'bg-blue-2':
                          !Dark.isActive &&
                          mc.quotationDetailChangeStatus(detail, pm).text === 'Identical',
                        'bg-light-blue-10':
                          Dark.isActive &&
                          mc.quotationDetailChangeStatus(detail, pm).text === 'Identical',
                      }"
                    >
                      <q-avatar
                        v-if="mc.quotationDetailSafeItem(detail, pm).isQuotationOnly"
                        color="accent"
                        size="sm"
                      >
                        <q-icon class="q-my-xs" color="white" name="fal fa-file-invoice" />
                        <TopTooltip>Quotation Only</TopTooltip>
                      </q-avatar>
                      <q-avatar v-else color="accent" size="sm">
                        <q-icon class="q-my-xs" color="white" name="fal fa-usd-circle" />
                        <TopTooltip>Finance Only</TopTooltip>
                      </q-avatar>
                    </td>
                    <td
                      v-else
                      class="text-right"
                      :class="{
                        'bg-amber-2':
                          !Dark.isActive &&
                          mc.quotationDetailProductionSalaryUnitPriceChanged(detail, pm),
                        'bg-lime-10':
                          Dark.isActive &&
                          mc.quotationDetailProductionSalaryUnitPriceChanged(detail, pm),
                        'bg-blue-2':
                          !Dark.isActive &&
                          mc.quotationDetailChangeStatus(detail, pm).text === 'Identical',
                        'bg-light-blue-10':
                          Dark.isActive &&
                          mc.quotationDetailChangeStatus(detail, pm).text === 'Identical',
                      }"
                    >
                      {{
                        f.currency(
                          pmc.itemProductionSalaryAmount(mc.quotationDetailSafeItem(detail, pm)),
                        )
                      }}
                    </td>

                    <!-- Quantity -->
                    <td
                      class="text-right"
                      :class="{
                        'bg-amber-2':
                          !Dark.isActive && mc.quotationDetailQuantityChanged(detail, pm),
                        'bg-lime-10':
                          Dark.isActive && mc.quotationDetailQuantityChanged(detail, pm),
                        'bg-blue-2':
                          !Dark.isActive &&
                          mc.quotationDetailChangeStatus(detail, pm).text === 'Identical',
                        'bg-light-blue-10':
                          Dark.isActive &&
                          mc.quotationDetailChangeStatus(detail, pm).text === 'Identical',
                      }"
                    >
                      {{ mc.quotationDetailSafeItem(detail, pm).quantity }}
                    </td>

                    <!-- Unit Price -->
                    <!-- Amount -->
                    <td
                      v-if="mc.quotationDetailSafeItem(detail, pm).isProductionOnly"
                      class="text-center"
                      :class="{
                        'bg-amber-2':
                          !Dark.isActive && mc.quotationDetailIsProductionOnlyChanged(detail, pm),
                        'bg-lime-10':
                          Dark.isActive && mc.quotationDetailIsProductionOnlyChanged(detail, pm),
                        'bg-blue-2':
                          !Dark.isActive &&
                          mc.quotationDetailChangeStatus(detail, pm).text === 'Identical',
                        'bg-light-blue-10':
                          Dark.isActive &&
                          mc.quotationDetailChangeStatus(detail, pm).text === 'Identical',
                      }"
                      colspan="2"
                    >
                      <q-avatar color="accent" size="sm">
                        <q-icon class="q-my-xs" color="white" name="fal fa-thunderstorm" />
                        <TopTooltip>Production Only</TopTooltip>
                      </q-avatar>
                    </td>
                    <template v-else>
                      <!-- Unit Price -->
                      <td
                        class="text-right"
                        :class="{
                          'bg-amber-2':
                            !Dark.isActive && mc.quotationDetailUnitPriceChanged(detail, pm),
                          'bg-lime-10':
                            Dark.isActive && mc.quotationDetailUnitPriceChanged(detail, pm),
                          'bg-blue-2':
                            !Dark.isActive &&
                            mc.quotationDetailChangeStatus(detail, pm).text === 'Identical',
                          'bg-light-blue-10':
                            Dark.isActive &&
                            mc.quotationDetailChangeStatus(detail, pm).text === 'Identical',
                        }"
                      >
                        {{ f.currency(mc.quotationDetailSafeItem(detail, pm).unitPrice) }}
                      </td>

                      <!-- Amount -->
                      <td
                        class="text-right"
                        :class="{
                          'bg-amber-2':
                            !Dark.isActive && mc.quotationDetailAmountChanged(detail, pm),
                          'bg-lime-10':
                            Dark.isActive && mc.quotationDetailAmountChanged(detail, pm),
                          'bg-blue-2':
                            !Dark.isActive &&
                            mc.quotationDetailChangeStatus(detail, pm).text === 'Identical',
                          'bg-light-blue-10':
                            Dark.isActive &&
                            mc.quotationDetailChangeStatus(detail, pm).text === 'Identical',
                        }"
                      >
                        {{ f.currency(pmc.itemAmount(mc.quotationDetailSafeItem(detail, pm))) }}
                      </td>
                    </template>
                  </template>
                  <!-- Production Salary Amount -->
                  <!-- Quantity -->
                  <!-- Unit Price -->
                  <!-- Amount -->
                  <td v-else class="text-center bg-red-2" colspan="4"></td>

                  <!-- Status -->
                  <td class="text-center">
                    <q-btn
                      class="shadow-2 cursor-inherit"
                      :color="mc.quotationDetailChangeStatus(detail, pm).color"
                      padding="xs"
                      :ripple="false"
                      size="sm"
                      text-color="white"
                      unelevated
                    >
                      <span class="text-weight-regular q-mx-xs">
                        {{ mc.quotationDetailChangeStatus(detail, pm).text }}
                      </span>
                    </q-btn>
                  </td>
                </tr>

                <!-- Added items -->
                <tr
                  v-for="(item, itemIndex) in projectAddedItems"
                  :key="itemIndex + (m.details.length || 0)"
                >
                  <!-- Number -->
                  <td>
                    {{ itemIndex + (m.details.length || 0) + 1 }}
                  </td>

                  <!-- Title -->
                  <td>
                    {{ item.title }}
                  </td>

                  <!-- Production Salary Amount -->
                  <!-- Quantity -->
                  <!-- Unit Price -->
                  <!-- Amount -->
                  <td
                    class="text-center"
                    :class="Dark.isActive ? 'bg-light-green-10' : 'bg-green-2'"
                    colspan="4"
                  ></td>

                  <!-- Production Salary Amount -->
                  <td v-if="item.isFinanceOnly" class="text-center">
                    <q-avatar v-if="item.isQuotationOnly" color="accent" size="sm">
                      <q-icon class="q-my-xs" color="white" name="fal fa-file-invoice" />
                      <TopTooltip>Quotation Only</TopTooltip>
                    </q-avatar>
                    <q-avatar v-else color="accent" size="sm">
                      <q-icon class="q-my-xs" color="white" name="fal fa-usd-circle" />
                      <TopTooltip>Finance Only</TopTooltip>
                    </q-avatar>
                  </td>
                  <td v-else class="text-right">
                    {{ f.currency(pmc.itemProductionSalaryAmount(item)) }}
                  </td>

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
                      {{ f.currency(pmc.itemAmount(item)) }}
                    </td>
                  </template>

                  <!-- Status -->
                  <td class="text-center">
                    <q-btn
                      class="shadow-2 cursor-inherit"
                      color="positive"
                      padding="xs"
                      :ripple="false"
                      size="sm"
                      text-color="white"
                      unelevated
                    >
                      <span class="text-weight-regular q-mx-xs">Added</span>
                    </q-btn>
                  </td>
                </tr>

                <!-- Subtotal -->
                <tr>
                  <!-- Number -->
                  <!-- Content -->
                  <td class="text-right" colspan="2">
                    <strong>Subtotal</strong>
                  </td>

                  <!-- Production Salary Amount -->
                  <td></td>

                  <!-- Quantity -->
                  <td class="text-right">
                    <strong>{{ mc.quotationTotalQuantity(m) }}</strong>
                  </td>

                  <!-- Unit Price -->
                  <td></td>

                  <!-- Amount -->
                  <td class="text-right">
                    <strong>{{ f.currency(mc.quotationSubtotal(m)) }}</strong>
                  </td>

                  <!-- Production Salary Amount -->
                  <td></td>

                  <!-- Quantity -->
                  <td class="text-right">
                    <strong>{{ pmc.projectTotalQuantity(pm) }}</strong>
                  </td>

                  <!-- Unit Price -->
                  <td></td>

                  <!-- Amount -->
                  <td class="text-right">
                    <strong>{{ f.currency(pmc.projectSubtotal(pm)) }}</strong>
                  </td>

                  <!-- Status -->
                  <td></td>
                </tr>

                <!-- Discount -->
                <tr v-if="m.discount !== undefined || pm.discount !== undefined">
                  <!-- Number -->
                  <!-- Content -->
                  <td class="text-right" colspan="2">
                    <strong>Discount</strong>
                  </td>

                  <!-- Production Salary Amount -->
                  <!-- Quantity -->
                  <!-- Unit Price -->
                  <td colspan="3"></td>

                  <!-- Amount -->
                  <td
                    class="text-right"
                    :class="{
                      'bg-amber-2': !Dark.isActive && m.discount !== pm.discount,
                      'bg-lime-10': Dark.isActive && m.discount !== pm.discount,
                    }"
                  >
                    {{ m.discount === undefined ? '-' : f.currency(m.discount, true) }}
                  </td>

                  <!-- Production Salary Amount -->
                  <!-- Quantity -->
                  <!-- Unit Price -->
                  <td colspan="3"></td>

                  <!-- Amount -->
                  <td
                    class="text-right"
                    :class="{
                      'bg-amber-2': !Dark.isActive && m.discount !== pm.discount,
                      'bg-lime-10': Dark.isActive && m.discount !== pm.discount,
                      'bg-blue-2': !Dark.isActive && m.discount === pm.discount,
                      'bg-light-blue-10': Dark.isActive && m.discount === pm.discount,
                    }"
                  >
                    {{ pm.discount === undefined ? '-' : f.currency(pm.discount, true) }}
                  </td>

                  <!-- Status -->
                  <td>
                    <q-btn
                      class="shadow-2 cursor-inherit"
                      :color="m.discount === pm.discount ? 'primary' : 'warning'"
                      padding="xs"
                      :ripple="false"
                      size="sm"
                      text-color="white"
                      unelevated
                    >
                      <span class="text-weight-regular q-mx-xs">
                        {{ m.discount === pm.discount ? 'Identical' : 'Modified' }}
                      </span>
                    </q-btn>
                  </td>
                </tr>

                <!-- After Discount -->
                <tr v-if="m.discount !== undefined || pm.discount !== undefined">
                  <!-- Number -->
                  <!-- Content -->
                  <td class="text-right" colspan="2">
                    <strong>After Discount</strong>
                  </td>

                  <!-- Production Salary Amount -->
                  <!-- Quantity -->
                  <!-- Unit Price -->
                  <td colspan="3"></td>

                  <!-- Amount -->
                  <td class="text-right">
                    <strong>
                      {{
                        m.discount === undefined ? '-' : f.currency(mc.quotationVatExcludedTotal(m))
                      }}
                    </strong>
                  </td>

                  <!-- Production Salary Amount -->
                  <!-- Quantity -->
                  <!-- Unit Price -->
                  <td colspan="3"></td>

                  <!-- Amount -->
                  <td class="text-right">
                    <strong>
                      {{
                        pm.discount === undefined
                          ? '-'
                          : f.currency(pmc.projectVatExcludedTotal(pm))
                      }}
                    </strong>
                  </td>

                  <!-- Status -->
                  <td></td>
                </tr>

                <!-- VAT -->
                <tr
                  v-if="
                    m.vatPercent !== undefined ||
                    pm.vatPercent !== undefined ||
                    m.vatableAmount !== undefined ||
                    pm.vatableAmount !== undefined
                  "
                >
                  <!-- Number -->
                  <!-- Content -->
                  <td class="text-right" colspan="2">
                    <strong>VAT</strong>
                  </td>

                  <!-- Production Salary Amount -->
                  <td></td>

                  <!-- Quantity -->
                  <td
                    class="text-right"
                    :class="{
                      'bg-amber-2': !Dark.isActive && m.vatPercent !== pm.vatPercent,
                      'bg-lime-10': Dark.isActive && m.vatPercent !== pm.vatPercent,
                    }"
                  >
                    <template v-if="m.vatPercent === undefined">-</template>
                    <template v-else>
                      {{ f.percent(m.vatPercent) }}
                    </template>
                  </td>

                  <!-- Unit Price -->
                  <td
                    class="text-right"
                    :class="{
                      'bg-amber-2': !Dark.isActive && m.vatableAmount !== pm.vatableAmount,
                      'bg-lime-10': Dark.isActive && m.vatableAmount !== pm.vatableAmount,
                    }"
                  >
                    <template v-if="m.vatableAmount === undefined">-</template>
                    <template v-else>
                      {{ f.currency(m.vatableAmount) }}
                    </template>
                  </td>

                  <!-- Amount -->
                  <td class="text-right">
                    <template v-if="m.vatPercent === undefined">-</template>
                    <template v-else>
                      {{ f.currency(mc.quotationVat(m)) }}
                    </template>
                  </td>

                  <!-- Production Salary Amount -->
                  <td></td>

                  <!-- Quantity -->
                  <td
                    class="text-right"
                    :class="{
                      'bg-amber-2': !Dark.isActive && m.vatPercent !== pm.vatPercent,
                      'bg-lime-10': Dark.isActive && m.vatPercent !== pm.vatPercent,
                      'bg-blue-2': !Dark.isActive && m.vatPercent === pm.vatPercent,
                      'bg-light-blue-10': Dark.isActive && m.vatPercent === pm.vatPercent,
                    }"
                  >
                    <template v-if="pm.vatPercent === undefined">-</template>
                    <template v-else>
                      {{ f.percent(pm.vatPercent) }}
                    </template>
                  </td>

                  <!-- Unit Price -->
                  <td
                    class="text-right"
                    :class="{
                      'bg-amber-2': !Dark.isActive && m.vatableAmount !== pm.vatableAmount,
                      'bg-lime-10': Dark.isActive && m.vatableAmount !== pm.vatableAmount,
                      'bg-blue-2': !Dark.isActive && m.vatableAmount === pm.vatableAmount,
                      'bg-light-blue-10': Dark.isActive && m.vatableAmount === pm.vatableAmount,
                    }"
                  >
                    <template v-if="pm.vatableAmount === undefined">-</template>
                    <template v-else>
                      {{ f.currency(pm.vatableAmount) }}
                    </template>
                  </td>

                  <!-- Amount -->
                  <td class="text-right">
                    <template v-if="pm.vatPercent === undefined">-</template>
                    <template v-else>
                      {{ f.currency(pmc.projectVat(pm)) }}
                    </template>
                  </td>

                  <!-- Status -->
                  <td>
                    <q-btn
                      class="shadow-2 cursor-inherit"
                      :color="
                        m.vatPercent === pm.vatPercent && m.vatableAmount === pm.vatableAmount
                          ? 'primary'
                          : 'warning'
                      "
                      padding="xs"
                      :ripple="false"
                      size="sm"
                      text-color="white"
                      unelevated
                    >
                      <span class="text-weight-regular q-mx-xs">
                        {{
                          m.vatPercent === pm.vatPercent && m.vatableAmount === pm.vatableAmount
                            ? 'Identical'
                            : 'Modified'
                        }}
                      </span>
                    </q-btn>
                  </td>
                </tr>

                <!-- Total -->
                <tr>
                  <!-- Number -->
                  <!-- Content -->
                  <td class="text-right" colspan="2">
                    <strong>Total</strong>
                  </td>

                  <!-- Production Salary Amount -->
                  <td class="text-right">
                    <strong>
                      {{ f.currency(mc.quotationTotalProductionSalary(m)) }}
                    </strong>
                  </td>

                  <!-- Quantity -->
                  <!-- Unit Price -->
                  <td class="text-center" colspan="2">
                    <template v-if="hasRole('manager') && mc.quotationPriceRatio(m) !== undefined">
                      x{{ mc.quotationPriceRatio(m) }}
                    </template>
                  </td>

                  <!-- Amount -->
                  <td class="text-right">
                    <strong>{{ f.currency(mc.quotationTotal(m)) }}</strong>
                  </td>

                  <!-- Production Salary Amount -->
                  <td class="text-right">
                    <strong>
                      {{ f.currency(pmc.projectTotalProductionSalary(pm)) }}
                    </strong>
                  </td>

                  <!-- Quantity -->
                  <!-- Unit Price -->
                  <td class="text-center" colspan="2">
                    <template v-if="hasRole('manager') && pmc.projectPriceRatio(pm) !== undefined">
                      x{{ pmc.projectPriceRatio(pm) }}
                    </template>
                  </td>

                  <!-- Amount -->
                  <td class="text-right">
                    <strong>{{ f.currency(pmc.projectTotal(pm)) }}</strong>
                  </td>

                  <!-- Status -->
                  <td></td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </FadeTransition>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>
