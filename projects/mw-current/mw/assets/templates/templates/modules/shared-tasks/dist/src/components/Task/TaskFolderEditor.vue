<script setup lang="ts">
import { computed, markRaw } from 'vue';

import { Dark } from 'quasar';

import { object } from 'yup';

import { stringRequired } from 'utils/validation.js';

import useTasksViewPage from 'composables/tasks/task/useTasksViewPage.js';

// Private

const validationSchema = markRaw(
  object({
    name: stringRequired('Name').test({
      message: 'Name is already taken',
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

const $p = useTasksViewPage(props.scopeName);
const {
  // Auto sort
  dirty,
} = $p;

// Computed

const folderVm = computed(() => $p.selectedNode.value!.folderVm!);

// Private Executions

const { validate } = $p.useValidationForm(validationSchema, folderVm.value, 'name');

// Expose

defineExpose({
  validate: async () => (await validate()).valid,
});
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-folder-grid"
    class="q-mx-auto"
    :header-background-color="Dark.isActive ? 'grey-8' : 'grey-4'"
    :title="folderVm.name"
  >
    <template #body>
      <QInputVal
        v-model="folderVm.name"
        dense
        hide-bottom-space
        label="Name"
        name="name"
        @update:model-value="dirty"
      />
    </template>
  </ExpandableCard>
</template>
