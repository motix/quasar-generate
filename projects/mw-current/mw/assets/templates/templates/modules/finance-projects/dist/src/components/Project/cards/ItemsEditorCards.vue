<script setup lang="ts">
import type { ComponentPublicInstance, ShallowRef, useTemplateRef } from 'vue';

import useProjectViewPage from 'composables/finance/project/useProjectViewPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import ItemEditorCard from 'components/Project/cards/ItemEditorCard.vue';

import ProjectAdditionEditorSection from './ProjectAdditionEditorSection.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth } = requiredConfigEntries('cardWidth');

const { hasRole } = useFirebaseAuth();

const $p = useProjectViewPage(props.scopeName);
const {
  // Auto sort
  f,
  setItemEditorRef,
  vm,
  vmc,
} = $p;

// Methods

function elConvert(el: Element | ComponentPublicInstance | null) {
  return el as ReturnType<
    typeof useTemplateRef<InstanceType<typeof ItemEditorCard>>
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
          <div class="text-h6 text-center">Items</div>
        </q-card-section>

        <q-card-section>
          <div class="row justify-between">
            <div>Total Quantity</div>
            <div class="text-warning">
              <strong>
                {{ vmc.projectTotalQuantity(vm) }}
              </strong>
            </div>
          </div>

          <div class="row justify-between">
            <div>Subtotal</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(vmc.projectSubtotal(vm)) }}
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
                    {{ f.currency(vmc.projectVatExcludedTotal(vm)) }}
                  </strong>
                </div>
              </div>
            </div>
          </q-slide-transition>

          <q-slide-transition>
            <div v-if="f.isNumber(vm.vatPercent)" class="row">
              <div class="col-4">VAT ({{ f.percent(vm.vatPercent) }})</div>
              <div class="col-4 text-warning text-right">
                {{ f.isNumber(vm.vatableAmount) ? f.currency(vm.vatableAmount) : '' }}
              </div>
              <div class="col-4 text-warning text-right">
                {{ f.currency(vmc.projectVat(vm)) }}
              </div>
            </div>
          </q-slide-transition>

          <div class="row justify-between">
            <div>Total</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(vmc.projectTotal(vm)) }}
              </strong>
            </div>
          </div>
        </q-card-section>

        <q-separator dark inset />

        <q-card-section>
          <div class="row justify-between">
            <div>Total Production Salary</div>
            <div class="text-warning">
              <strong>
                {{ f.currency(vmc.projectTotalProductionSalary(vm)) }}
              </strong>
            </div>
          </div>

          <div
            v-if="hasRole('manager') && vmc.projectPriceRatio(vm) !== undefined"
            class="row justify-between"
          >
            <div>Price Ratio</div>
            <div class="text-warning">x{{ vmc.projectPriceRatio(vm) }}</div>
          </div>
        </q-card-section>
      </div>

      <ProjectAdditionEditorSection :scope-name="scopeName" />
    </q-card>

    <ListTransition
      class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs"
      color-effect
      :gutter="16"
    >
      <ItemEditorCard
        v-for="(item, index) in vm.items"
        :key="
          item.key ||
          (() => {
            throw new Error('[finance-projects] ItemVm key not set');
          })()
        "
        :ref="
          (el) => {
            setItemEditorRef(elConvert(el), index);
          }
        "
        :item-index="index"
        :scope-name="scopeName"
      />
    </ListTransition>
  </div>
</template>
