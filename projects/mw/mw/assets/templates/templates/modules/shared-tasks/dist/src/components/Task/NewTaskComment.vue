<script setup lang="ts">
import { markRaw, ref } from 'vue';

import { QEditor } from 'quasar';

import { object } from 'yup';

import type { TaskActionName } from 'utils/tasks/Task/TaskStatus.js';
import { stringRequired } from 'utils/validation.js';

import type { Task, TaskComment } from 'models/tasks/index.js';

import useTasksViewPage from 'composables/tasks/task/useTasksViewPage.js';
import useNotifications from 'composables/useNotifications.js';
import useRichEditor from 'composables/useRichEditor.js';

// Private

const validationSchema = markRaw(
  object({
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
  task: Task;
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

const content = ref('');

// Private Executions

const { validate, resetForm, errors } = $p.useValidationForm(
  validationSchema,
  {
    content: content.value,
  },
  'content',
);

// Methods

async function addTaskComment(task: Task, action: TaskComment['action']) {
  const isValid = (await validate()).valid;

  if (!isValid) {
    notifyValidationError();

    return;
  }

  $p.freezed.value = true;

  const contentValue = await uploadContentImages(
    content.value,
    `${$p.storagePath.value}/${task.key}`,
  );

  const comment: TaskComment = {
    createDate: new Date(),
    action,
    content: contentValue,
    member: {
      id: $p.authenticatedMember.value!.id,

      fullName: $p.authenticatedMember.value!.fullName,
    },
  };

  if (action === 'implement') {
    task.isImplemented = true;
    task.isTested = false;
  } else if (action === 'test') {
    task.isTested = true;
  } else if (action === 'reject') {
    task.isImplemented = false;
    task.isTested = false;
  } else if (action === 'close') {
    task.isClosed = true;
  } else if (action === 'reopen') {
    task.isClosed = false;
  }

  task.comments.push(comment);

  void $p.viewerSave(() => {
    content.value = '';

    resetForm();
  });
}

function buttonTooltip(action: TaskActionName) {
  switch (action) {
    case 'implement':
      return 'Add Comment and Set Implemented';
    case 'test':
      return 'Add Comment and Set Tested';
    case 'reject':
      return 'Add Comment and Reject Implementation';
    case 'close':
      return 'Add Comment and Close';
    case 'reopen':
      return 'Add Comment and Re-open';
    default: {
      const _exhaustiveCheck: never = action;
      return _exhaustiveCheck;
    }
  }
}
</script>

<template>
  <q-expansion-item
    expand-icon-class="text-white"
    header-class="text-white text-h6 bg-accent"
    icon="fal fa-comment"
    label="New Comment"
    popup
  >
    <q-card>
      <q-card-section>
        <div class="q-gutter-y-md">
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
          icon="fal fa-comment"
          :loading="freezed"
          outline
          padding="sm"
          @click="() => addTaskComment(task, 'comment')"
        >
          <TopTooltip>Add Comment</TopTooltip>
        </q-btn>
        <q-btn
          v-for="button in task.statusHelper.buttons"
          :key="button.label"
          :color="button.color"
          :disable="freezed"
          :icon="button.icon"
          :loading="freezed"
          outline
          padding="sm"
          @click="() => addTaskComment(task, button.action)"
        >
          <TopTooltip>{{ buttonTooltip(button.action) }}</TopTooltip>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-expansion-item>
</template>
