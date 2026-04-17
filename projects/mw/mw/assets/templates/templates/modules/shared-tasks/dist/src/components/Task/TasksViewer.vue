<script setup lang="ts">
import { Dark, Platform, QTree } from 'quasar';

import useTasksViewPage from 'composables/tasks/task/useTasksViewPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import TasksContent from 'components/Task/TasksContent.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth } = requiredConfigEntries('cardWidth');

const $p = useTasksViewPage(props.scopeName);
const {
  // Auto sort
  expandedNodeKeys,
  isSingleView,
  isSplitView,
  m,
  mc,
  selectedNodeKey,
  splitterHeight,
  splitterModel,
  taskNodes,
  taskTree,
} = $p;
</script>

<template>
  <q-card
    class="q-mx-auto bg-accent"
    :class="Dark.isActive ? undefined : 'shadow-2'"
    dark
    style="width: 100%"
    :style="{ maxWidth: cardWidth + 'px' }"
  >
    <q-card-section class="row text-center">
      <div class="col">
        <q-icon name="fal fa-bars-progress" />
        {{ mc.totalNew(m.tasks) }}
        <TopTooltip>Total New</TopTooltip>
      </div>
      <div class="col">
        <q-icon name="fal fa-check-double" />
        {{ mc.totalImplemented(m.tasks) }}
        <TopTooltip>Total Implemented</TopTooltip>
      </div>
      <div class="col">
        <q-icon name="fal fa-thumbs-up" />
        {{ mc.totalTested(m.tasks) }}
        <TopTooltip>Total Tested</TopTooltip>
      </div>
      <div class="col">
        <q-icon name="fal fa-circle-xmark" />
        {{ mc.totalClosed(m.tasks) }}
        <TopTooltip>Closed</TopTooltip>
      </div>
    </q-card-section>
  </q-card>

  <FadeTransition>
    <q-splitter
      v-if="isSplitView"
      key="splitView"
      v-model="splitterModel"
      :horizontal="!Platform.is.desktop"
      :limits="[0, 75]"
      :style="{ height: `${splitterHeight}px` }"
    >
      <template #before>
        <div
          class="q-py-md q-gutter-y-lg"
          :class="{
            'q-pr-lg': Platform.is.desktop,
            'q-px-md': !Platform.is.desktop,
          }"
        >
          <FadeTransition>
            <q-tree
              v-if="taskNodes.length > 0"
              ref="taskTree"
              v-model:expanded="expandedNodeKeys"
              v-model:selected="selectedNodeKey"
              accordion
              node-key="key"
              :nodes="taskNodes"
              selected-color="primary"
            ></q-tree>
          </FadeTransition>
        </div>
      </template>

      <template #after>
        <TasksContent :scope-name="scopeName" />
      </template>

      <template #separator>
        <div>
          <div
            class="flex bg-muted rounded-borders"
            :class="{
              'q-py-sm': Platform.is.desktop,
              'q-px-sm': !Platform.is.desktop,
            }"
          >
            <q-icon
              color="white"
              :name="`fal fa-grip-dots${Platform.is.desktop ? '-vertical' : ''}`"
              @click="splitterModel = splitterModel > 0 ? 0 : 25"
            />
          </div>
        </div>
      </template>
    </q-splitter>

    <TasksContent v-if="isSingleView" key="singleView" :scope-name="scopeName" />
  </FadeTransition>
</template>
