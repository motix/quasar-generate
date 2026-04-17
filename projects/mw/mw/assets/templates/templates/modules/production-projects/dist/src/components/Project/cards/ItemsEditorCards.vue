<script setup lang="ts">
import type { ComponentPublicInstance, ShallowRef, useTemplateRef } from 'vue';

import { Dark } from 'quasar';

import { useProjectViewPage } from 'composables/production/project/useProjectEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import ItemEditorCard from './ItemEditorCard.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth } = requiredConfigEntries('cardWidth');

const $p = useProjectViewPage(props.scopeName);
const {
  // Auto sort
  editorReady,
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
    <q-card
      class="q-mx-auto bg-accent"
      :class="Dark.isActive ? undefined : 'shadow-2'"
      dark
      style="width: 100%"
      :style="{ maxWidth: cardWidth + 'px' }"
    >
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-center">Items</div>
      </q-card-section>

      <q-card-section>
        <div class="row justify-between">
          <div>Total Quantity</div>
          <div class="text-warning">
            <strong>{{ vmc.projectTotalQuantity(vm) }}</strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Total Salary</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(vmc.projectTotalProductionSalary(vm)) }}
            </strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Price Factor</div>
          <div class="text-warning">
            <strong>
              {{ f.percent(vmc.projectProductionPriceFactor(vm)) }}
            </strong>
          </div>
        </div>
      </q-card-section>

      <q-linear-progress v-if="!editorReady" color="warning" indeterminate />
    </q-card>

    <q-slide-transition>
      <ListTransition
        v-if="editorReady"
        class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs"
        color-effect
        :gutter="16"
      >
        <ItemEditorCard
          v-for="(item, index) in vm.items"
          :key="
            item.key ||
            (() => {
              throw new Error('[production-projects] ItemVm key not set');
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
    </q-slide-transition>
  </div>
</template>
