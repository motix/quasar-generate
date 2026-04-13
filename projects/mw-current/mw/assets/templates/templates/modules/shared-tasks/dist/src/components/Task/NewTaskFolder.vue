<script setup lang="ts">
import { markRaw, ref } from 'vue';

import { uid } from 'quasar';

import { object } from 'yup';

import { stringRequired } from 'utils/validation.js';

import type { Task, TaskFolder } from 'models/tasks/index.js';

import useTasksViewPage from 'composables/tasks/task/useTasksViewPage.js';
import useNotifications from 'composables/useNotifications.js';

// Private

const validationSchema = markRaw(
  object({
    name: stringRequired('Name').test({
      message: 'Name is already taken',
      test: (value) =>
        !value ||
        (!props.folderList.find((folder) => folder.name.toLowerCase() === value.toLowerCase()) &&
          !props.taskList.find((task) => task.title.toLowerCase() === value.toLowerCase())),
    }),
  }),
);

// Props

const props = defineProps<{
  scopeName: string;
  folderList: TaskFolder[];
  taskList: Task[];
}>();

// Composables

const { notifyValidationError } = useNotifications();

const $p = useTasksViewPage(props.scopeName);
const {
  // Auto sort
  freezed,
} = $p;

// Data

const name = ref('');

// Private Executions

const { validate, resetForm } = $p.useValidationForm(
  validationSchema,
  {
    name: name.value,
  },
  'name',
);

// Methods

async function addTaskFolder(list: TaskFolder[]) {
  const isValid = (await validate()).valid;

  if (!isValid) {
    notifyValidationError();

    return;
  }

  const folder: TaskFolder = {
    key: uid(),
    name: name.value,
    folders: [],
    tasks: [],
  };

  list.push(folder);

  void $p.viewerSave(() => {
    name.value = '';

    resetForm();

    if ($p.findNode(folder.key)?.parentFolder && $p.selectedNodeKey.value) {
      $p.expandedNodeKeys.value.push($p.selectedNodeKey.value);
    }

    $p.selectedNodeKey.value = folder.key;
  });
}
</script>

<template>
  <q-expansion-item
    expand-icon-class="text-white"
    header-class="text-white text-h6 bg-accent"
    icon="fal fa-folder-grid"
    label="New Folder"
    popup
  >
    <q-card>
      <q-card-section>
        <div class="q-gutter-y-md">
          <QInputVal v-model="name" dense hide-bottom-space label="Name" name="name" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="around">
        <q-btn
          color="primary"
          :disable="freezed"
          icon="fal fa-plus"
          :loading="freezed"
          outline
          padding="sm"
          @click="() => addTaskFolder(folderList)"
        >
          <TopTooltip>Add Task Folder</TopTooltip>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-expansion-item>
</template>
