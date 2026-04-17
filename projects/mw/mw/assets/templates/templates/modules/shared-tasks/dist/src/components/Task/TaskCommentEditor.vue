<script setup lang="ts">
import { markRaw, ref } from 'vue';

import { useDialogPluginComponent } from 'quasar';

import { object } from 'yup';

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
  taskComment: TaskComment;
}>();

// Emit

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
]);

// Composables

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

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

const isDirty = ref(false);

const content = ref(props.taskComment.content);

// Private Executions

const { validate, errors } = $p.useValidationForm(validationSchema, props.taskComment, 'content');

// Methods

function dirty() {
  isDirty.value = true;
}

async function onSave() {
  const isValid = (await validate()).valid;

  if (!isValid) {
    notifyValidationError();

    return;
  }

  $p.freezed.value = true;

  const contentValue = await uploadContentImages(
    content.value,
    `${$p.storagePath.value}/${props.task.key}`,
  );

  const taskComment = props.taskComment;
  taskComment.content = contentValue;

  await $p.viewerSave(() => {
    onDialogOK();
  });
}
</script>

<template>
  <q-dialog ref="dialogRef" full-width persistent @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Edit Comment</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
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
            @update:model-value="dirty"
          />
          <div v-if="errors.content" class="q-field__bottom q-pl-none">
            {{ errors.content }}
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn
          v-close-popup
          color="negative"
          :disable="freezed"
          flat
          label="Cancel"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="freezed || !isDirty"
          flat
          label="Save"
          :loading="freezed"
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
