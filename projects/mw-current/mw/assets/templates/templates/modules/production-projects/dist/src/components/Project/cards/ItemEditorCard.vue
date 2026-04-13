<script setup lang="ts">
import type { ComponentPublicInstance, ShallowRef } from 'vue';
import { useTemplateRef } from 'vue';

import { Dark } from 'quasar';

import useItemEditor from 'composables/production/project/useItemEditor.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import ItemContributionEditorCardSection from './ItemContributionEditorCardSection.vue';
import ItemEditorCardMain from './ItemEditorCardMain.vue';

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

const { listItemCardWidth } = requiredConfigEntries('listItemCardWidth');

const $p = useItemEditor(props);
const {
  // Auto sort
  addItemContribution,
  insertItem,
  item,
  removeItem,
  setItemContributionEditorRef,
} = $p;

// Data

const itemEditorMainRef = useTemplateRef('itemEditorMain');

// Methods

function elConvert(el: Element | ComponentPublicInstance | null) {
  return el as ReturnType<
    typeof useTemplateRef<InstanceType<typeof ItemContributionEditorCardSection>>
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
  <q-card
    :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
    style="width: 100%"
    :style="{ maxWidth: listItemCardWidth + 'px' }"
  >
    <q-card-actions align="around">
      <q-btn color="primary" icon="fal fa-plus" outline padding="sm" @click="insertItem(itemIndex)">
        <TopTooltip>Insert Item</TopTooltip>
      </q-btn>
      <q-btn
        color="negative"
        icon="fal fa-trash-alt"
        outline
        padding="sm"
        @click="removeItem(itemIndex)"
      >
        <TopTooltip>Remove Item</TopTooltip>
      </q-btn>
    </q-card-actions>

    <q-separator inset />

    <ItemEditorCardMain ref="itemEditorMain" :item-index="itemIndex" :scope-name="scopeName" />

    <ListTransition color-effect>
      <ItemContributionEditorCardSection
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
    </ListTransition>

    <q-separator v-if="item.productType" />

    <q-card-actions
      v-if="item.productType"
      align="around"
      :class="Dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <FadeTransition>
        <q-btn
          v-if="item.contributions.length === 0"
          key="elevatedButton"
          color="primary"
          label="Add Contribution"
          size="sm"
          style="margin: 7px 0"
          @click="addItemContribution(itemIndex)"
        />
        <q-btn
          v-else
          key="flatButton"
          color="primary"
          flat
          icon="fal fa-plus"
          padding="13px"
          size="xs"
          @click="addItemContribution(itemIndex)"
        >
          <TopTooltip>Add Contribution</TopTooltip>
        </q-btn>
      </FadeTransition>
    </q-card-actions>
  </q-card>
</template>
