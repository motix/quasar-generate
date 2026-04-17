<script setup lang="ts">
import type { ComponentPublicInstance, ShallowRef, useTemplateRef } from 'vue';

import useProjectViewPage from 'composables/finance/project/useProjectViewPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import ItemEditorRow from 'components/Project/table/ItemEditorRow.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

import ProjectAdditionEditorRows from './ProjectAdditionEditorRows.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { hasRole } = useFirebaseAuth();

const $p = useProjectViewPage(props.scopeName);
const {
  // Auto sort
  addItem,
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
      icon="fal fa-list-ol"
      label="Items"
      popup
    >
      <q-card>
        <StickyHeaders markup-table separated target="#itemsEditorTable" />

        <q-markup-table id="itemsEditorTable" bordered separator="cell" wrap-cells>
          <thead>
            <tr>
              <th class="q-table--col-auto-width">#</th>
              <th class="q-table--col-auto-width">Togglers</th>
              <th>Title / Description</th>
              <th>Product Type</th>
              <th>Production Salary Amount</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
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

            <!-- Subtotal -->
            <tr>
              <!-- Number -->
              <!-- Togglers -->
              <!-- Title / Description -->
              <!-- Product Type -->
              <td class="text-right" colspan="4">
                <strong>Subtotal</strong>
              </td>

              <!-- Production Salary Amount -->
              <td></td>

              <!-- Quantity -->
              <td>
                <TextField dense field-class="text-right">
                  <strong>{{ vmc.projectTotalQuantity(vm) }}</strong>
                </TextField>
              </td>

              <!-- Unit Price -->
              <td></td>

              <!-- Amount -->
              <td>
                <TextField dense field-class="text-right">
                  <strong>
                    {{ f.currency(vmc.projectSubtotal(vm)) }}
                  </strong>
                </TextField>
              </td>

              <!-- Buttons -->
              <td>
                <q-btn color="primary" icon="fal fa-plus" outline padding="sm" @click="addItem()">
                  <TopTooltip>Add Item</TopTooltip>
                </q-btn>
              </td>
            </tr>

            <ProjectAdditionEditorRows :scope-name="scopeName" />

            <!-- Total -->
            <tr>
              <!-- Number -->
              <!-- Togglers -->
              <!-- Title / Description -->
              <!-- Product Type -->
              <td class="text-right" colspan="4">
                <strong>Total</strong>
              </td>

              <!-- Production Salary Amount -->
              <td class="text-right">
                <strong>
                  {{ f.currency(vmc.projectTotalProductionSalary(vm)) }}
                </strong>
              </td>

              <!-- Quantity -->
              <!-- Unit Price -->
              <td class="text-center" colspan="2">
                <template v-if="hasRole('manager') && vmc.projectPriceRatio(vm) !== undefined">
                  x{{ vmc.projectPriceRatio(vm) }}
                </template>
              </td>

              <!-- Amount -->
              <td class="text-right">
                <strong>{{ f.currency(vmc.projectTotal(vm)) }}</strong>
              </td>

              <!-- Buttons -->
              <td></td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>
