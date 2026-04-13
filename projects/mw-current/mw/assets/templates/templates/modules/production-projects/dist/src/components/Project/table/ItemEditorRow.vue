<script setup lang="ts">
import type { ComponentPublicInstance, ShallowRef } from 'vue';
import { useTemplateRef } from 'vue';

import { Dark } from 'quasar';

import useItemEditor from 'composables/production/project/useItemEditor.js';

import ItemContributionEditorRow from './ItemContributionEditorRow.vue';
import ItemEditorRowMain from './ItemEditorRowMain.vue';

// Private

async function validateDetailEditor() {
  !itemEditorMainRef.value &&
    (() => {
      throw new Error('itemEditorMainRef not specified');
    })();

  const results = await Promise.all([
    itemEditorMainRef.value.validate(),
    $p.validateItemContributionsEditor(props.itemIndex),
  ]);

  return !results.includes(false);
}

// Props

const props = defineProps<{
  scopeName: string;
  itemIndex: number;
}>();

// Composables

const $p = useItemEditor(props);
const {
  // Auto sort
  addItemContribution,
  item,
  setItemContributionEditorRef,
} = $p;

// Data

const itemEditorMainRef = useTemplateRef('itemEditorMain');

// Methods

function elConvert(el: Element | ComponentPublicInstance | null) {
  return el as ReturnType<
    typeof useTemplateRef<InstanceType<typeof ItemContributionEditorRow>>
  > extends Readonly<ShallowRef<infer Component>>
    ? Component
    : never;
}

// Watch

$p.watchItemContributionsLength(props.itemIndex);

// Expose

defineExpose({
  validate: validateDetailEditor,
});
</script>

<template>
  <!-- Item -->
  <ItemEditorRowMain ref="itemEditorMain" :item-index="itemIndex" :scope-name="scopeName" />

  <!-- No contribution -->
  <tr
    v-if="item.productType && item.contributions.length === 0"
    :class="Dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
  >
    <td colspan="8">
      <q-btn
        color="primary"
        label="Add Contribution"
        size="sm"
        style="margin: 7px 0"
        @click="addItemContribution(itemIndex)"
      />
    </td>
  </tr>

  <!-- Contributions -->
  <ItemContributionEditorRow
    v-for="(contribution, index) in item.contributions"
    :key="
      contribution.key ||
      (() => {
        throw new Error('[production-projects] ItemContributionVm key not set');
      })()
    "
    :ref="
      (el) => {
        setItemContributionEditorRef(elConvert(el), itemIndex, index);
      }
    "
    :item-contribution-index="index"
    :item-index="itemIndex"
    :scope-name="scopeName"
  />
</template>
