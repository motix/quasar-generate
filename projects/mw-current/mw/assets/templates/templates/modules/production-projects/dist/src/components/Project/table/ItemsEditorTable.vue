<script setup lang="ts">
import type { ComponentPublicInstance, ShallowRef, useTemplateRef } from 'vue';

import { useProjectViewPage } from 'composables/production/project/useProjectEditPage.js';

import StickyHeaders from 'components/shared/StickyHeaders.vue';

import ItemEditorRow from './ItemEditorRow.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useProjectViewPage(props.scopeName);
const {
  // Auto sort
  addItem,
  editorReady,
  f,
  setItemEditorRef,
  vm,
  vmc,
} = $p;

// Methods

function elConvert(el: Element | ComponentPublicInstance | null) {
  return el as ReturnType<
    typeof useTemplateRef<InstanceType<typeof ItemEditorRow>>
  > extends Readonly<ShallowRef<infer Component>>
    ? Component
    : never;
}
</script>

<template>
  <q-list class="rounded-list">
    <q-expansion-item
      default-opened
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      icon="fal fa-play-circle"
      label="Items"
      popup
    >
      <q-card>
        <q-linear-progress v-if="!editorReady" color="warning" indeterminate />

        <StickyHeaders markup-table separated target="#editorTable" />

        <q-slide-transition>
          <q-markup-table
            v-if="editorReady"
            id="editorTable"
            bordered
            separator="vertical"
            wrap-cells
          >
            <thead>
              <tr>
                <th class="q-table--col-auto-width">#</th>
                <th>Title / Description</th>
                <th>Full Name</th>
                <th>Product Type / Role</th>
                <th>Involvement</th>
                <th>Price Factor</th>
                <th>Quantity</th>
                <th>Salary Base</th>
                <th>Salary Amount</th>
                <th class="q-table--col-auto-width"></th>
              </tr>
            </thead>

            <tbody>
              <ItemEditorRow
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

              <!-- Total -->
              <tr>
                <!-- Number -->
                <!-- Title / Description -->
                <!-- Full Name -->
                <!-- Product Type / Role -->
                <!-- Involvement -->
                <td class="text-right" colspan="5">
                  <strong>Total</strong>
                </td>

                <!-- Price Factor -->
                <td class="text-right">
                  <strong>
                    {{ f.percent(vmc.projectProductionPriceFactor(vm)) }}
                  </strong>
                </td>

                <!-- Quantity -->
                <td class="text-right">
                  <strong>{{ vmc.projectTotalQuantity(vm) }}</strong>
                </td>

                <!-- Salary Base -->
                <td></td>

                <!-- Salary Amount -->
                <td class="text-right">
                  <strong>
                    {{ f.currency(vmc.projectTotalProductionSalary(vm)) }}
                  </strong>
                </td>

                <!-- Buttons -->
                <td>
                  <q-btn color="primary" icon="fal fa-plus" outline padding="sm" @click="addItem()">
                    <TopTooltip>Add Item</TopTooltip>
                  </q-btn>
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-slide-transition>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>
