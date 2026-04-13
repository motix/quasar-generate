<script setup lang="ts">
import type { ComponentPublicInstance, ShallowRef, useTemplateRef } from 'vue';

import { useInvoiceViewPage } from 'composables/finance/invoice/useInvoiceEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import InvoiceAdditionEditorSection from './InvoiceAdditionEditorSection.vue';
import InvoiceDetailEditorCard from './InvoiceDetailEditorCard.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth } = requiredConfigEntries('cardWidth');

const {
  // Auto sort
  f,
  setDetailEditorRef,
  vm,
  vmc,
} = useInvoiceViewPage(props.scopeName);

// Methods

function elConvert(el: Element | ComponentPublicInstance | null) {
  return el as ReturnType<
    typeof useTemplateRef<InstanceType<typeof InvoiceDetailEditorCard>>
  > extends Readonly<ShallowRef<infer Component>>
    ? Component
    : never;
}
</script>

<template>
  <div class="q-gutter-y-md">
    <q-card class="q-mx-auto" style="width: 100%" :style="{ maxWidth: cardWidth + 'px' }">
      <div class="bg-accent text-white">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-center">Details</div>
        </q-card-section>

        <q-card-section>
          <div class="row justify-between">
            <div>Total Quantity</div>
            <div class="text-warning">
              <strong>
                {{ vmc.invoiceTotalQuantity(vm) }}
              </strong>
            </div>
          </div>

          <div class="row justify-between">
            <div>Subtotal</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(vmc.invoiceSubtotal(vm)) }}
              </strong>
            </div>
          </div>

          <q-slide-transition>
            <div v-if="f.isNumber(vm.discount)">
              <div class="row justify-between">
                <div>Discount</div>
                <div class="text-warning">
                  {{ f.currency(vm.discount, true) }}
                </div>
              </div>

              <div class="row justify-between">
                <div>After Discount</div>
                <div class="text-warning">
                  <strong>
                    {{ f.currency(vmc.invoiceAfterDiscountSubtotal(vm)) }}
                  </strong>
                </div>
              </div>
            </div>
          </q-slide-transition>

          <q-slide-transition>
            <div v-if="f.isNumber(vm.contractSubtotal)" class="row justify-between">
              <div>Contract Subtotal</div>
              <div class="text-warning">
                {{ f.currency(vm.contractSubtotal) }}
              </div>
            </div>
          </q-slide-transition>

          <q-slide-transition>
            <div
              v-if="
                f.isNumber(vm.vatPercent) &&
                (!f.isNumber(vm.secondVatPercent) || !f.isNumber(vm.secondVatableAmount))
              "
              class="row"
            >
              <div class="col-4">VAT ({{ f.percent(vm.vatPercent) }})</div>
              <div class="col-4 text-warning text-right">
                {{ f.isNumber(vm.vatableAmount) ? f.currency(vm.vatableAmount) : '' }}
              </div>
              <div class="col-4 text-warning text-right">
                {{ f.currency(vmc.invoiceVat(vm)) }}
              </div>
            </div>
          </q-slide-transition>

          <q-slide-transition>
            <div
              v-if="
                f.isNumber(vm.vatPercent) &&
                f.isNumber(vm.secondVatPercent) &&
                f.isNumber(vm.secondVatableAmount)
              "
              class="row"
            >
              <div class="col-4">
                <div>VAT 1 ({{ f.percent(vm.vatPercent) }})</div>
                <div>VAT 2 ({{ f.percent(vm.secondVatPercent) }})</div>
              </div>
              <div class="col-4 text-warning text-right">
                <div>
                  {{
                    f.currency(
                      (!f.isNumber(vm.vatableAmount)
                        ? vmc.invoiceAfterDiscountSubtotal(vm)
                        : vm.vatableAmount) - vm.secondVatableAmount,
                    )
                  }}
                </div>
                <div>
                  {{ f.currency(vm.secondVatableAmount) }}
                </div>
              </div>
              <div class="col-4 text-warning text-right">
                {{ f.currency(vmc.invoiceVat(vm)) }}
              </div>
            </div>
          </q-slide-transition>

          <q-slide-transition>
            <div v-if="f.isNumber(vm.vatPercent) && f.isNumber(vm.vatAdjustment)" class="row">
              <div class="col-4">VAT Adjustment</div>
              <div class="col-4 text-warning text-right">
                {{ vm.vatAdjustment > 0 ? '+' : '' }}{{ f.currency(vm.vatAdjustment) }}
              </div>
            </div>
          </q-slide-transition>

          <q-slide-transition>
            <div v-if="f.isNumber(vm.relocatedSubtotal)" class="row justify-between">
              <div>Relocated Subtotal</div>
              <div class="text-warning">
                {{ f.currency(vm.relocatedSubtotal, true) }}
              </div>
            </div>
          </q-slide-transition>

          <q-slide-transition>
            <div v-if="f.isNumber(vm.relocatedVat)" class="row justify-between">
              <div>Relocated VAT</div>
              <div class="text-warning">
                {{ f.currency(vm.relocatedVat, true) }}
              </div>
            </div>
          </q-slide-transition>

          <div class="row justify-between">
            <div>Total</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(vmc.invoiceTotal(vm)) }}
              </strong>
            </div>
          </div>
        </q-card-section>
      </div>

      <InvoiceAdditionEditorSection :scope-name="scopeName" />
    </q-card>

    <ListTransition
      class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs"
      color-effect
      :gutter="16"
    >
      <InvoiceDetailEditorCard
        v-for="(detail, index) in vm.details"
        :key="
          detail.key ||
          (() => {
            throw new Error('[finance-invoice] TransactionDetailVm key not set');
          })()
        "
        :ref="
          (el) => {
            setDetailEditorRef(elConvert(el), index);
          }
        "
        :detail-index="index"
        :scope-name="scopeName"
      />
    </ListTransition>
  </div>
</template>
