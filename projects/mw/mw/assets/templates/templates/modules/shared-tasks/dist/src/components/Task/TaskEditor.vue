<script setup lang="ts">
import { computed, markRaw, watch } from 'vue';

import { Dark, QEditor } from 'quasar';

import { object } from 'yup';

import { asIsRequired, stringRequired } from 'utils/validation.js';

import type { MemberLite } from 'models/tasks/index.js';

import useTasksViewPage from 'composables/tasks/task/useTasksViewPage.js';
import useRichEditor from 'composables/useRichEditor.js';

import TaskAssignedTo from 'components/Task/TaskAssignedTo.vue';

// Private

const validationSchema = markRaw(
  object({
    title: stringRequired('Title').test({
      message: 'Title is already taken',
      test: (value) => {
        return (
          !value ||
          folderList.value.filter((folder) => folder.name.toLowerCase() === value.toLowerCase())
            .length +
            taskList.value.filter((task) => task.title.toLowerCase() === value.toLowerCase())
              .length ===
            1
        );
      },
    }),
    content: stringRequired('Content').test({
      message: 'Content is a required field',
      test: (value) =>
        !value ||
        value.includes('<img') ||
        !contentRef.value ||
        contentRef.value.$el.textContent.trim() !== '',
    }),
    owner: asIsRequired<MemberLite>('Owner'),
  }),
);

const folderList = computed(() => {
  const selectedNodeValue = $p.selectedNode.value;

  if (selectedNodeValue === undefined) {
    return [];
  }

  if (selectedNodeValue.parentFolder === $p.m.value.tasks) {
    return $p.vm.value.tasks.folders;
  }

  const parentFolderKey = selectedNodeValue.parentFolder.key;

  return $p.findNode(parentFolderKey)?.folderVm?.folders || [];
});

const taskList = computed(() => {
  const selectedNodeValue = $p.selectedNode.value;

  if (selectedNodeValue === undefined) {
    return [];
  }

  if (selectedNodeValue.parentFolder === $p.m.value.tasks) {
    return $p.vm.value.tasks.tasks;
  }

  const parentFolderKey = selectedNodeValue.parentFolder.key;

  return $p.findNode(parentFolderKey)?.folderVm?.tasks || [];
});

// Props

const props = defineProps<{
  scopeName: string;
  childKey: string;
}>();

// Composables

const {
  editortRef: contentRef,
  onEditorPaste: onContentPaste,
  uploadImages: uploadContentImages,
} = useRichEditor();

const $p = useTasksViewPage(props.scopeName);
const {
  // Auto sort
  dirty,
  f,
  filterMemberOptions,
  memberOptions,
  members,
} = $p;

// Computed

const assignedToOptions = computed(() =>
  members.value.map((value) => ({ label: value.fullName, value: value })),
);

const taskVm = computed(() => $p.selectedNode.value!.taskVm!);

// Private Executions

const { validate, errors } = $p.useValidationForm(
  validationSchema,
  taskVm.value,
  'title',
  'content',
  'owner',
);

taskVm.value.assignedTo = $p.members.value.filter((member) =>
  taskVm.value.assignedTo.some((value) => value.id === member.id),
);

// Watch

watch(
  computed(() => taskVm.value.assignedTo.length),
  () => {
    // Sort assignedTo field
    taskVm.value.assignedTo = $p.members.value.filter((member) =>
      taskVm.value.assignedTo.some((value) => value.id === member.id),
    );
  },
);

// Expose

defineExpose({
  validate: async () => {
    taskVm.value.content = await uploadContentImages(
      taskVm.value.content,
      `${$p.storagePath.value}/${taskVm.value.key}`,
    );

    return (await validate()).valid;
  },
});
</script>

<template>
  <div class="q-gutter-y-lg">
    <ExpandableCard
      avatar-icon="fal fa-bars-progress"
      body-cell-gutter
      :caption="f.dateViewModel(taskVm.createDate) || undefined"
      class="q-mx-auto"
      :header-background-color="Dark.isActive ? 'grey-8' : 'grey-4'"
      :title="taskVm.title || '[Title]'"
    >
      <template #bezel-less-top>
        <q-card-section class="q-col-gutter-x-md row">
          <div class="col-12 row justify-between">
            <span>Owned by</span>
            <ObjectLink
              v-if="taskVm.owner"
              color="primary"
              icon="fal fa-user"
              :label="taskVm.owner.fullName"
              :to="`/team/member/${taskVm.owner.id}`"
            />
            <span v-else>[Owner]</span>
          </div>

          <div class="col-12 row justify-between">
            <span>Assigned to</span>

            <span v-if="taskVm.assignedTo.length === 0"> None </span>
            <span v-else>
              <TaskAssignedTo icon :members="taskVm.assignedTo" />
            </span>
          </div>
        </q-card-section>

        <q-separator />
      </template>

      <template #body>
        <QSelectVal
          v-model="taskVm.owner"
          class="col-6"
          fill-input
          hide-selected
          label="Owner"
          name="owner"
          option-label="fullName"
          option-value="id"
          :options="memberOptions"
          use-input
          @filter="filterMemberOptions"
          @update:model-value="dirty"
        />

        <QInputVal
          v-model="taskVm.title"
          class="col-12"
          label="Title"
          name="title"
          @update:model-value="dirty"
        />
      </template>

      <template #bezel-less>
        <q-separator />

        <q-card-section>
          <div class="text-overline text-weight-regular text-uppercase text-muted">Assigned to</div>

          <q-option-group
            v-model="taskVm.assignedTo"
            :options="assignedToOptions"
            type="toggle"
            @update:model-value="dirty"
          />
        </q-card-section>
      </template>
    </ExpandableCard>

    <div :class="{ 'q-field--error': !!errors.content }">
      <QInputVal v-show="false" v-model="taskVm.content" name="content" />

      <q-editor
        ref="contentRef"
        v-model="taskVm.content"
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
  </div>
</template>
