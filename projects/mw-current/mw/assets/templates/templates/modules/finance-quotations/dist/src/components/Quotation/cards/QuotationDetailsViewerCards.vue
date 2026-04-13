<script setup lang="ts">
import { Dark } from 'quasar';

import useQuotationViewPage from 'composables/finance/quotation/useQuotationViewPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth, listItemCardWidth } = requiredConfigEntries('cardWidth', 'listItemCardWidth');

const { hasRole } = useFirebaseAuth();

const $p = useQuotationViewPage(props.scopeName);
const {
  // Auto sort
  displayDetails,
  f,
  m,
  mc,
  pm,
  pmc,
  projectAddedItems,
  showComparision,
} = $p;
</script>

<template>
  <div class="q-gutter-y-md">
    <q-card
      class="q-mx-auto bg-accent"
      :class="Dark.isActive ? undefined : 'shadow-2'"
      dark
      style="width: 100%"
      :style="{ maxWidth: cardWidth + 'px' }"
    >
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-center">Details</div>
      </q-card-section>

      <q-card-section>
        <q-slide-transition>
          <div v-if="showComparision" class="row q-col-gutter-x-md">
            <div class="col"></div>
            <div class="col text-right text-overline text-uppercase">Quotation</div>
            <div class="col text-right text-overline text-uppercase">Project</div>
          </div>
        </q-slide-transition>

        <div class="row q-col-gutter-x-md">
          <div class="col">Total Quantity</div>
          <div class="col text-right text-warning">
            <strong>
              {{ mc.quotationTotalQuantity(m) }}
            </strong>
          </div>
          <div v-if="showComparision" class="col text-right text-warning">
            <strong>
              {{ pmc.projectTotalQuantity(pm) }}
            </strong>
          </div>
        </div>

        <div class="row q-col-gutter-x-md">
          <div class="col">Subtotal</div>
          <div class="col text-right text-warning">
            <strong>
              {{ f.currency(mc.quotationSubtotal(m)) }}
            </strong>
          </div>
          <div v-if="showComparision" class="col text-right text-warning">
            <strong>
              {{ f.currency(pmc.projectSubtotal(pm)) }}
            </strong>
          </div>
        </div>

        <div
          v-if="m.discount !== undefined || (showComparision && pm.discount !== undefined)"
          class="row q-col-gutter-x-md"
        >
          <div class="col">Discount</div>
          <div class="col text-right text-warning">
            <span class="relative-position">
              <template v-if="m.discount === undefined">-</template>
              <template v-else>
                {{ f.currency(m.discount, true) }}
              </template>
              <q-badge
                v-if="showComparision && m.discount !== pm.discount"
                color="red"
                floating
                rounded
              />
            </span>
          </div>
          <div v-if="showComparision" class="col text-right text-warning">
            <span class="relative-position">
              <template v-if="pm.discount === undefined">-</template>
              <template v-else>
                {{ f.currency(pm.discount, true) }}
              </template>
              <q-badge
                v-if="showComparision && m.discount !== pm.discount"
                color="red"
                floating
                rounded
              />
            </span>
          </div>
        </div>

        <div
          v-if="m.discount !== undefined || (showComparision && pm.discount !== undefined)"
          class="row q-col-gutter-x-md"
        >
          <div class="col">After Discount</div>
          <div class="col text-right text-warning">
            <strong>
              <template v-if="m.discount === undefined">-</template>
              <template v-else>
                {{ f.currency(mc.quotationVatExcludedTotal(m)) }}
              </template>
            </strong>
          </div>
          <div v-if="showComparision" class="col text-right text-warning">
            <strong>
              <template v-if="pm.discount === undefined">-</template>
              <template v-else>
                {{ f.currency(pmc.projectVatExcludedTotal(pm)) }}
              </template>
            </strong>
          </div>
        </div>

        <q-slide-transition>
          <div
            v-if="
              showComparision && (m.vatableAmount !== undefined || pm.vatableAmount !== undefined)
            "
            class="row q-col-gutter-x-md text-caption"
          >
            <div class="col">VAT-able Amount</div>
            <div class="col text-right">
              <span class="relative-position">
                <template v-if="m.vatableAmount === undefined">-</template>
                <template v-else>
                  {{ f.currency(m.vatableAmount) }}
                </template>
                <q-badge v-if="m.vatableAmount !== pm.vatableAmount" color="red" floating rounded />
              </span>
            </div>
            <div class="col text-right">
              <span class="relative-position">
                <template v-if="pm.vatableAmount === undefined">-</template>
                <template v-else>
                  {{ f.currency(pm.vatableAmount) }}
                </template>
                <q-badge v-if="m.vatableAmount !== pm.vatableAmount" color="red" floating rounded />
              </span>
            </div>
          </div>
        </q-slide-transition>

        <div
          v-if="
            m.vatPercent !== undefined ||
            (!showComparision && m.vatableAmount !== undefined) ||
            (showComparision && pm.vatPercent !== undefined)
          "
          class="row q-col-gutter-x-md"
        >
          <div class="col">
            VAT
            {{
              !showComparision || m.vatPercent === pm.vatPercent
                ? `(${f.percent(m.vatPercent)})`
                : ''
            }}
          </div>
          <div
            v-if="!showComparision && m.vatableAmount !== undefined"
            class="col text-right text-warning"
          >
            {{ f.currency(m.vatableAmount) }}
          </div>
          <div class="col text-right text-warning">
            <span class="relative-position">
              <template v-if="m.vatPercent === undefined">-</template>
              <template v-else>
                <template v-if="showComparision && m.vatPercent !== pm.vatPercent">
                  ({{ f.percent(m.vatPercent) }})
                </template>
                {{ f.currency(mc.quotationVat(m)) }}
              </template>
              <q-badge
                v-if="showComparision && m.vatPercent !== pm.vatPercent"
                color="red"
                floating
                rounded
              />
            </span>
          </div>
          <div v-if="showComparision" class="col text-right text-warning">
            <span class="relative-position">
              <template v-if="pm.vatPercent === undefined">-</template>
              <template v-else>
                <template v-if="m.vatPercent !== pm.vatPercent">
                  ({{ f.percent(pm.vatPercent) }})
                </template>
                {{ f.currency(pmc.projectVat(pm)) }}
              </template>
              <q-badge v-if="m.vatPercent !== pm.vatPercent" color="red" floating rounded />
            </span>
          </div>
        </div>

        <div class="row q-col-gutter-x-md">
          <div class="col">Total</div>
          <div class="col text-right text-warning">
            <strong>
              {{ f.currency(mc.quotationTotal(m)) }}
            </strong>
          </div>
          <div v-if="showComparision" class="col text-right text-warning">
            <strong>
              {{ f.currency(pmc.projectTotal(pm)) }}
            </strong>
          </div>
        </div>
      </q-card-section>

      <q-slide-transition>
        <div v-if="showComparision">
          <q-separator dark inset />

          <q-card-section>
            <div class="row q-col-gutter-x-md">
              <div class="col">Total Prod. Salary</div>
              <div class="col text-right text-warning">
                <strong>
                  {{ f.currency(mc.quotationTotalProductionSalary(m)) }}
                </strong>
              </div>
              <div class="col text-right text-warning">
                <strong>
                  {{ f.currency(pmc.projectTotalProductionSalary(pm)) }}
                </strong>
              </div>
            </div>

            <div v-if="hasRole('manager')" class="row q-col-gutter-x-md">
              <div class="col">Price Ratio</div>
              <div class="col text-right text-warning">
                <template v-if="mc.quotationPriceRatio(m) !== undefined">
                  x{{ mc.quotationPriceRatio(m) }}
                </template>
              </div>
              <div class="col text-right text-warning">
                <template v-if="pmc.projectPriceRatio(pm) !== undefined">
                  x{{ pmc.projectPriceRatio(pm) }}
                </template>
              </div>
            </div>
          </q-card-section>
        </div>
      </q-slide-transition>
    </q-card>

    <!-- Bottom padding to be consistent with editor -->
    <FadeTransition>
      <div
        v-if="!showComparision"
        key="comparision-hidden"
        class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs"
      >
        <ExpandableCard
          v-for="(detail, index) in displayDetails"
          :key="index"
          avatar-icon="fal fa-list-ol"
          avatar-size=""
          avatar-top
          body-class="text-center"
          :header-background-color="Dark.isActive ? 'grey-8' : 'grey-4'"
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :title="detail.content"
        >
          <template #side>
            <q-item-label caption class="text-overline">
              #{{ index + 1 }}
              <TopTooltip>Number</TopTooltip>
            </q-item-label>

            <div class="q-mt-xs">
              <q-avatar v-if="detail.isQuotationOnly" color="accent" size="sm">
                <q-icon class="q-my-xs" color="white" name="fal fa-file-invoice" />
                <TopTooltip>Quotation Only</TopTooltip>
              </q-avatar>
            </div>
          </template>

          <template #body>
            <q-chip class="q-mx-none" color="purple" size="sm" text-color="white">
              {{ f.currency(detail.unitPrice) }}
              <TopTooltip>Unit Price</TopTooltip>
            </q-chip>

            <q-chip color="purple" text-color="white">
              <q-avatar color="warning" text-color="dark">
                x{{ detail.quantity }}
                <TopTooltip>Quantity</TopTooltip>
              </q-avatar>
              <span>
                = {{ f.currency(mc.quotationDetailAmount(detail)) }}
                <TopTooltip>Amount</TopTooltip>
              </span>
            </q-chip>
          </template>
        </ExpandableCard>
      </div>

      <div
        v-else
        key="comparision-showing"
        class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs"
      >
        <ExpandableCard
          v-for="(detail, index) in displayDetails"
          :key="index"
          avatar-icon="fal fa-list-ol"
          avatar-size=""
          avatar-top
          :header-background-color="Dark.isActive ? 'grey-8' : 'grey-4'"
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :title="detail.content"
          title-top
        >
          <template #main>
            <q-btn
              class="q-mt-sm shadow-2 cursor-inherit"
              :color="mc.quotationDetailChangeStatus(detail, pm).color"
              no-wrap
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
          </template>

          <template #side>
            <q-item-label caption class="text-overline">
              #{{ index + 1 }}
              <TopTooltip>Number</TopTooltip>
            </q-item-label>

            <div class="q-mt-xs">
              <!-- Production Only changed -->
              <template v-if="mc.quotationDetailIsProductionOnlyChanged(detail, pm)">
                <q-avatar :color="detail.isProductionOnly ? 'accent' : 'muted'" size="sm">
                  <q-icon class="q-my-xs" color="white" name="fal fa-thunderstorm" />
                  <TopTooltip>Quotation Production Only</TopTooltip>
                  <q-badge color="red" floating rounded />
                </q-avatar>

                <q-icon name="fal fa-angle-right" />

                <q-avatar :color="detail.isProductionOnly ? 'muted' : 'accent'" size="sm">
                  <q-icon class="q-my-xs" color="white" name="fal fa-thunderstorm" />
                  <TopTooltip>Project Production Only</TopTooltip>
                  <q-badge color="red" floating rounded />
                </q-avatar>
              </template>

              <!-- Production Only not changed -->
              <q-avatar v-else-if="detail.isProductionOnly" color="accent" size="sm">
                <q-icon class="q-my-xs" color="white" name="fal fa-thunderstorm" />
                <TopTooltip>Production Only</TopTooltip>
              </q-avatar>

              <!-- Finance Only / Quotation Only changed -->
              <template v-if="mc.quotationDetailIsQuotationOnlyChanged(detail, pm)">
                <!-- Change from Quotation Only to Finance Only -->
                <template v-if="detail.isQuotationOnly">
                  <q-avatar color="accent" size="sm">
                    <q-icon class="q-my-xs" color="white" name="fal fa-file-invoice" />
                    <TopTooltip>Quotation Quotation Only</TopTooltip>
                    <q-badge color="red" floating rounded />
                  </q-avatar>

                  <q-icon name="fal fa-angle-right" />

                  <q-avatar color="accent" size="sm">
                    <q-icon class="q-my-xs" color="white" name="fal fa-usd-circle" />
                    <TopTooltip>Project Finance Only</TopTooltip>
                    <q-badge color="red" floating rounded />
                  </q-avatar>
                </template>

                <!-- Change from Finance Only to Quotation Only -->
                <template v-else>
                  <q-avatar color="accent" size="sm">
                    <q-icon class="q-my-xs" color="white" name="fal fa-usd-circle" />
                    <TopTooltip>Quotation Finance Only</TopTooltip>
                  </q-avatar>
                  <q-icon name="fal fa-angle-right" />
                  <q-avatar color="accent" size="sm">
                    <q-icon class="q-my-xs" color="white" name="fal fa-file-invoice" />
                    <TopTooltip>Project Quotation Only</TopTooltip>
                  </q-avatar>
                </template>
              </template>

              <!-- Finance Only / Quotation Only not changed -->
              <q-avatar v-else-if="detail.isQuotationOnly" color="accent" size="sm">
                <q-icon class="q-my-xs" color="white" name="fal fa-file-invoice" />
                <TopTooltip>Quotation Only</TopTooltip>
              </q-avatar>
              <q-avatar
                v-else-if="detail.productionSalaryUnitPrice === undefined"
                color="accent"
                size="sm"
              >
                <q-icon class="q-my-xs" color="white" name="fal fa-usd-circle" />
                <TopTooltip>Finance Only</TopTooltip>
              </q-avatar>
            </div>
          </template>

          <template #bezel-less>
            <q-card-section class="text-center" horizontal>
              <q-card-section
                class="flex flex-center content-start"
                :class="{
                  'col-6': mc.quotationDetailHasItem(detail, pm),
                  'col-12': !mc.quotationDetailHasItem(detail, pm),
                }"
              >
                <div class="text-overline text-uppercase">Quotation</div>

                <div class="flex-break"></div>

                <q-badge
                  v-if="detail.productionSalaryUnitPrice !== undefined"
                  class="relative-position q-mb-sm"
                  color="green"
                  text-color="white"
                >
                  {{ f.currency(mc.quotationDetailProductionSalaryAmount(detail)) }}
                  <TopTooltip>Production Salary Amount</TopTooltip>
                  <q-badge
                    v-if="mc.quotationDetailProductionSalaryUnitPriceChanged(detail, pm)"
                    color="red"
                    floating
                    rounded
                  />
                </q-badge>

                <div class="flex-break"></div>

                <q-avatar v-if="detail.isProductionOnly" color="accent" size="sm">
                  <q-icon class="q-my-xs" color="white" name="fal fa-thunderstorm" />
                  <TopTooltip>Production Only</TopTooltip>
                </q-avatar>

                <template v-else>
                  <q-chip class="q-mx-none" color="purple" size="sm" text-color="white">
                    {{ f.currency(detail.unitPrice) }}
                    <TopTooltip>Unit Price</TopTooltip>
                    <q-badge
                      v-if="mc.quotationDetailUnitPriceChanged(detail, pm)"
                      color="red"
                      floating
                      rounded
                    />
                  </q-chip>

                  <q-chip color="purple" text-color="white">
                    <q-avatar color="warning" text-color="dark">
                      x{{ detail.quantity }}
                      <TopTooltip>Quantity</TopTooltip>
                      <q-badge
                        v-if="mc.quotationDetailQuantityChanged(detail, pm)"
                        color="red"
                        floating
                        rounded
                      />
                    </q-avatar>
                    <span>
                      = {{ f.currency(mc.quotationDetailAmount(detail)) }}
                      <TopTooltip>Amount</TopTooltip>
                      <q-badge
                        v-if="mc.quotationDetailAmountChanged(detail, pm)"
                        color="red"
                        floating
                        rounded
                      />
                    </span>
                  </q-chip>
                </template>
              </q-card-section>

              <template v-if="mc.quotationDetailHasItem(detail, pm)">
                <q-separator vertical />

                <q-card-section class="col-6 flex flex-center content-start">
                  <div class="text-overline text-uppercase">Project</div>

                  <div class="flex-break"></div>

                  <q-badge
                    v-if="!mc.quotationDetailSafeItem(detail, pm).isFinanceOnly"
                    class="relative-position q-mb-sm"
                    color="green"
                    text-color="white"
                  >
                    {{
                      f.currency(
                        pmc.itemProductionSalaryAmount(mc.quotationDetailSafeItem(detail, pm)),
                      )
                    }}
                    <TopTooltip>Production Salary Amount</TopTooltip>
                    <q-badge
                      v-if="mc.quotationDetailProductionSalaryUnitPriceChanged(detail, pm)"
                      color="red"
                      floating
                      rounded
                    />
                  </q-badge>

                  <div class="flex-break"></div>

                  <q-avatar
                    v-if="mc.quotationDetailSafeItem(detail, pm).isProductionOnly"
                    color="accent"
                    size="sm"
                  >
                    <q-icon class="q-my-xs" color="white" name="fal fa-thunderstorm" />
                    <TopTooltip>Production Only</TopTooltip>
                  </q-avatar>

                  <template v-else>
                    <q-chip class="q-mx-none" color="purple" size="sm" text-color="white">
                      {{ f.currency(mc.quotationDetailSafeItem(detail, pm).unitPrice) }}
                      <TopTooltip>Unit Price</TopTooltip>
                      <q-badge
                        v-if="mc.quotationDetailUnitPriceChanged(detail, pm)"
                        color="red"
                        floating
                        rounded
                      />
                    </q-chip>

                    <q-chip color="purple" text-color="white">
                      <q-avatar color="warning" text-color="dark">
                        x{{ mc.quotationDetailSafeItem(detail, pm).quantity }}
                        <TopTooltip>Quantity</TopTooltip>
                        <q-badge
                          v-if="mc.quotationDetailQuantityChanged(detail, pm)"
                          color="red"
                          floating
                          rounded
                        />
                      </q-avatar>
                      <span>
                        =
                        {{ f.currency(pmc.itemAmount(mc.quotationDetailSafeItem(detail, pm))) }}
                        <TopTooltip>Amount</TopTooltip>
                        <q-badge
                          v-if="mc.quotationDetailAmountChanged(detail, pm)"
                          color="red"
                          floating
                          rounded
                        />
                      </span>
                    </q-chip>
                  </template>
                </q-card-section>
              </template>
            </q-card-section>
          </template>
        </ExpandableCard>

        <ExpandableCard
          v-for="(item, itemIndex) in projectAddedItems"
          :key="itemIndex"
          avatar-icon="fal fa-list-ol"
          avatar-size=""
          avatar-top
          body-class="text-center"
          :header-background-color="Dark.isActive ? 'grey-8' : 'grey-4'"
          side-top
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :title="item.title"
          title-top
        >
          <template #main>
            <q-btn
              class="q-mt-sm shadow-2 cursor-inherit"
              color="positive"
              no-wrap
              padding="xs"
              :ripple="false"
              size="sm"
              text-color="white"
              unelevated
            >
              <span class="text-weight-regular q-mx-xs">Added</span>
            </q-btn>
          </template>

          <template #side>
            <q-item-label caption class="text-overline">
              #{{ itemIndex + (m.details.length || 0) + 1 }}
              <TopTooltip>Number</TopTooltip>
            </q-item-label>

            <div class="q-mt-xs">
              <!-- Production Only -->
              <q-avatar v-if="item.isProductionOnly" color="accent" size="sm">
                <q-icon class="q-my-xs" color="white" name="fal fa-thunderstorm" />
                <TopTooltip>Production Only</TopTooltip>
              </q-avatar>

              <!-- Finance Only / Quotation Only -->
              <q-avatar v-if="item.isFinanceOnly && !item.isQuotationOnly" color="accent" size="sm">
                <q-icon class="q-my-xs" color="white" name="fal fa-usd-circle" />
                <TopTooltip>Finance Only</TopTooltip>
              </q-avatar>
              <q-avatar v-if="item.isQuotationOnly" color="accent" size="sm">
                <q-icon class="q-my-xs" color="white" name="fal fa-file-invoice" />
                <TopTooltip>Quotation Only</TopTooltip>
              </q-avatar>
            </div>
          </template>

          <template #body>
            <div class="text-overline text-uppercase">Project</div>

            <q-badge v-if="!item.isFinanceOnly" class="q-mb-sm" color="green" text-color="white">
              {{ f.currency(pmc.itemProductionSalaryAmount(item)) }}
              <TopTooltip>Production Salary Amount</TopTooltip>
            </q-badge>

            <q-avatar v-if="item.isProductionOnly" color="accent" size="sm">
              <q-icon class="q-my-xs" color="white" name="fal fa-thunderstorm" />
              <TopTooltip>Production Only</TopTooltip>
            </q-avatar>

            <template v-else>
              <q-chip class="q-mx-none" color="purple" size="sm" text-color="white">
                {{ f.currency(item.unitPrice) }}
                <TopTooltip>Unit Price</TopTooltip>
              </q-chip>

              <q-chip color="purple" text-color="white">
                <q-avatar color="warning" text-color="dark">
                  x{{ item.quantity }}
                  <TopTooltip>Quantity</TopTooltip>
                </q-avatar>
                <span>
                  =
                  {{ f.currency(pmc.itemAmount(item)) }}
                  <TopTooltip>Amount</TopTooltip>
                </span>
              </q-chip>
            </template>
          </template>
        </ExpandableCard>
      </div>
    </FadeTransition>
  </div>
</template>
