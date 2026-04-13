<script setup lang="ts">
import { useTemplateRef } from 'vue';

import useTasksViewPage from 'composables/tasks/task/useTasksViewPage.js';

import TaskEditor from './TaskEditor.vue';
import TaskFolderEditor from './TaskFolderEditor.vue';

// Private

async function validateTasksEditor() {
  const validations = [
    ...(taskFolderEditorRefs.value?.map((value) => value.validate()) || []),
    ...(taskEditorRefs.value?.map((value) => value.validate()) || []),
  ];

  const results = await Promise.all(validations);

  return !results.includes(false);
}

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const $p = useTasksViewPage(props.scopeName);
const { flattenedTaskNodes, selectedNodeKey } = $p;

// Data

const taskFolderEditorRefs =
  useTemplateRef<InstanceType<typeof TaskFolderEditor>[]>('taskFolderEditors');
const taskEditorRefs = useTemplateRef<InstanceType<typeof TaskEditor>[]>('taskEditors');

// Private Executions

$p.useCustomValidation(validateTasksEditor);
</script>

<template>
  <q-tab-panels v-model="selectedNodeKey">
    <q-tab-panel v-for="node in flattenedTaskNodes" :key="node.key" :name="node.key">
      <TaskFolderEditor
        v-if="node.folder"
        ref="taskFolderEditors"
        :child-key="node.key"
        :scope-name="scopeName"
      />

      <TaskEditor
        v-if="node.task"
        ref="taskEditors"
        :child-key="node.key"
        :scope-name="scopeName"
      />
    </q-tab-panel>
  </q-tab-panels>
</template>
