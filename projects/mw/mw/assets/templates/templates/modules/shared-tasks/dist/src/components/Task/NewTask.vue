<script setup lang="ts">
import { markRaw, ref } from 'vue';

import { QEditor, uid } from 'quasar';

import { object } from 'yup';

import TaskStatus from 'utils/tasks/Task/TaskStatus.js';
import { stringRequired } from 'utils/validation.js';

import type { Task, TaskFolder } from 'models/tasks/index.js';

import useTasksViewPage from 'composables/tasks/task/useTasksViewPage.js';
import useNotifications from 'composables/useNotifications.js';
import useRichEditor from 'composables/useRichEditor.js';

// Private

const validationSchema = markRaw(
  object({
    title: stringRequired('Title').test({
      message: 'Title is already taken',
      test: (value) =>
        !value ||
        (!props.folderList.find((folder) => folder.name.toLowerCase() === value.toLowerCase()) &&
          !props.taskList.find((task) => task.title.toLowerCase() === value.toLowerCase())),
    }),
    content: stringRequired('Content').test({
      message: 'Content is a required field',
      test: (value) =>
        !value ||
        value.includes('<img') ||
        !contentRef.value ||
        contentRef.value.$el.textContent.trim() !== '',
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

const {
  editortRef: contentRef,
  onEditorPaste: onContentPaste,
  uploadImages: uploadContentImages,
} = useRichEditor();

const $p = useTasksViewPage(props.scopeName);
const {
  // Auto sort
  freezed,
} = $p;

// Data

const title = ref('');
const content = ref('');

// Private Executions

const { validate, resetForm, errors } = $p.useValidationForm(
  validationSchema,
  {
    title: title.value,
    content: content.value,
  },
  'title',
  'content',
);

// Methods

async function addTask(list: Task[]) {
  const isValid = (await validate()).valid;

  if (!isValid) {
    notifyValidationError();

    return;
  }

  $p.freezed.value = true;

  const key = uid();

  const contentValue = await uploadContentImages(content.value, `${$p.storagePath.value}/${key}`);

  const task: Task = {
    key,
    createDate: new Date(),
    title: title.value,
    content: contentValue,
    isImplemented: false,
    isTested: false,
    isClosed: false,
    owner: {
      id: $p.authenticatedMember.value!.id,

      fullName: $p.authenticatedMember.value!.fullName,
    },
    assignedTo: [],
    comments: [],
    statusHelper: new TaskStatus({} as Task, []),
  };

  list.push(task);

  void $p.viewerSave(() => {
    title.value = '';
    content.value = '';

    resetForm();

    if ($p.findNode(task.key)?.parentFolder && $p.selectedNodeKey.value) {
      $p.expandedNodeKeys.value.push($p.selectedNodeKey.value);
    }

    $p.selectedNodeKey.value = task.key;
  });
}
</script>

<template>
  <q-expansion-item
    expand-icon-class="text-white"
    header-class="text-white text-h6 bg-accent"
    icon="fal fa-bars-progress"
    label="New Task"
    popup
  >
    <q-card>
      <q-card-section>
        <div class="q-gutter-y-md">
          <QInputVal v-model="title" dense hide-bottom-space label="Title" name="title" />

          <div :class="{ 'q-field--error': !!errors.content }">
            <QInputVal v-show="false" v-model="content" name="content" />

            <q-editor
              ref="contentRef"
              v-model="content"
              min-height="10rem"
              placeholder="Content"
              :toolbar="[
                ['left', 'center', 'right', 'justify'],
                ['bold', 'italic', 'underline', 'strike'],
                [
                  {
                    icon: $q.iconSet.editor.formatting,
                    list: 'no-icons',
                    options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'],
                  },
                ],
                ['undo', 'redo'],
              ]"
              @paste="onContentPaste"
            />
            <div v-if="errors.content" class="q-field__bottom q-pl-none">
              {{ errors.content }}
            </div>
          </div>
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
          @click="() => addTask(taskList)"
        >
          <TopTooltip>Add Task</TopTooltip>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-expansion-item>
</template>
