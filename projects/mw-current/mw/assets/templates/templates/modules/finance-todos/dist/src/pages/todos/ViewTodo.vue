<script setup lang="ts">
import { onUnmounted, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import { Dark } from 'quasar';

import type { Todo, TodoVm } from 'models/finance/index.js';
import type { TaskFolder } from 'models/tasks/index.js';

import { useTodosStore } from 'stores/finance/Todos.js';

import useCurrentMember from 'composables/finance/shared/useCurrentMember.js';
import useTodoVisibleToUser from 'composables/finance/todo/useTodoVisibleToUser.js';
import useTasksViewPage from 'composables/tasks/task/useTasksViewPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import TasksEditor from 'components/Task/TasksEditor.vue';
import TasksViewer from 'components/Task/TasksViewer.vue';
import TodoEditor from 'components/Todo/TodoEditor.vue';
import TodoViewer from 'components/Todo/TodoViewer.vue';

// Constants

const SCOPE_NAME = 'todos-view-page';

// Composables

const router = useRouter();
const store = useTodosStore();

const { hasRole, roles } = useFirebaseAuth();

const { authenticatedMemberReady, authenticatedMember } = useCurrentMember();
const { todoVisibleToUser } = useTodoVisibleToUser(authenticatedMember);

const $p = useTasksViewPage<Todo, TodoVm>(SCOPE_NAME, true);
const {
  // Auto sort
  copyButtonEnabled,
  copySelectedNode,
  cutButtonEnabled,
  cutSelectedNode,
  deleteSelectedNode,
  deleting,
  filterMyTasks,
  freezed,
  isSplitView,
  paste,
  pasteButtonEnabled,
  selectedNodeKey,
  showDeleteSelectedNodeButton,
  switchViewAndScroll,
  toolbarExtraButtonVisibility,
} = $p;

// Computed

// Private Executions

// useReturnUrl
$p.backUrl.value = '/todos';

// usePageFeatures
$p.hasDeleting.value = hasRole('manager');

// usePageData
$p.modelFindKeyField.value = 'urlFriendlyName';
$p.modelGetter.value = (docKey) => {
  function setUserRoles(folder: TaskFolder) {
    folder.folders.forEach((value) => setUserRoles(value));
    folder.tasks.forEach((value) => value.statusHelper.setUserRoles(roles.value));
  }

  const model = store.doc(docKey);
  setUserRoles(model.tasks);
  return model;
};
$p.viewModelGetter.value = (docKey) => store.docVm(docKey);
$p.updateModel.value = (payload) => store.updateDoc(payload);
$p.deleteModel.value = (payload) => store.deleteDoc(payload);

// usePageTitle
$p.modelNameField.value = 'name';

// useToolbar
$p.toolbarPersistent.value = true;
$p.toolbarExtraButtonVisibility.value.switchTasksView =
  ($p.model.value?.tasks.folders.length || 0) + ($p.model.value?.tasks.tasks.length || 0) > 0;
$p.toolbarExtraButtonVisibility.value.filterMyTasks = true;
$p.toolbarExtraButtonVisibility.value.copy = true;
$p.toolbarExtraButtonVisibility.value.cut = true;
$p.toolbarExtraButtonVisibility.value.paste = true;

// useTasksViewPage
$p.routePathRoot.value = '/todos';
$p.storagePathRoot.value = 'finance/todos';

// usePageData - loadModel
void $p
  .loadModel((payload) => store.loadRealtimeDoc(payload))
  .then(() => {
    if (authenticatedMemberReady.value && !todoVisibleToUser($p.m.value)) {
      void router.replace('/ErrorNotFound');
    } else {
      $p.ready.value = true;

      $p.selectNodeByRouteParams();
    }
  });

// Lifecycle Hooks

onUnmounted(() => {
  $p.releaseModel.value && $p.releaseModel.value();
});

// Watch

watch(authenticatedMemberReady, (value) => {
  if (value && $p.ready.value && !todoVisibleToUser($p.m.value)) {
    void router.replace('/ErrorNotFound');
  }
});

watch($p.selectedNodeKey, (value) => {
  $p.hasDeleting.value = !value && hasRole('manager');
});

watchEffect(() => {
  $p.toolbarExtraButtonVisibility.value.switchTasksView =
    ($p.model.value?.tasks.folders.length || 0) + ($p.model.value?.tasks.tasks.length || 0) > 0 &&
    !$p.editMode.value;
  $p.toolbarExtraButtonVisibility.value.filterMyTasks = !$p.editMode.value;
  $p.toolbarExtraButtonVisibility.value.copy = !$p.filtersApplied.value && !$p.editMode.value;
  $p.toolbarExtraButtonVisibility.value.cut = !$p.filtersApplied.value && !$p.editMode.value;
  $p.toolbarExtraButtonVisibility.value.paste = !$p.filtersApplied.value && !$p.editMode.value;
});
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <div class="q-gutter-y-lg">
          <TodoViewer :scope-name="SCOPE_NAME" />
          <TasksViewer :scope-name="SCOPE_NAME" />
        </div>
      </template>
      <template #editor>
        <div class="q-gutter-y-lg">
          <TodoEditor v-if="!selectedNodeKey" :scope-name="SCOPE_NAME" />
          <template v-else>
            <TodoViewer :scope-name="SCOPE_NAME" />
            <TasksEditor :scope-name="SCOPE_NAME" />
          </template>
        </div>
      </template>

      <template #toolbar-main>
        <q-btn
          v-show="showDeleteSelectedNodeButton"
          key="deleteSelectedNode"
          :color="Dark.isActive ? 'grey-9' : 'grey-3'"
          :disable="freezed"
          icon="fal fa-trash-alt"
          :loading="deleting"
          round
          text-color="negative"
          @click="deleteSelectedNode"
        >
          <TopTooltip>Delete</TopTooltip>
        </q-btn>
      </template>

      <template #toolbar-extra>
        <q-btn
          v-if="toolbarExtraButtonVisibility.switchTasksView"
          key="switchTasksView"
          :color="Dark.isActive ? 'grey-9' : 'grey-3'"
          :icon="`fal fa-${isSplitView ? 'list' : 'table-columns'}`"
          round
          text-color="primary"
          @click="switchViewAndScroll"
        >
          <TopTooltip>
            {{ isSplitView ? 'Switch to Single View' : 'Switch to Split View' }}
          </TopTooltip>
        </q-btn>
        <q-btn
          v-if="toolbarExtraButtonVisibility.filterMyTasks"
          key="filterMyTasks"
          :color="Dark.isActive ? 'grey-9' : 'grey-3'"
          :icon="`fal fa-filter${filterMyTasks ? '-slash' : ''}`"
          round
          text-color="primary"
          @click="filterMyTasks = !filterMyTasks"
        >
          <TopTooltip>
            {{ filterMyTasks ? 'Show All Tasks' : 'Show My Tasks Only' }}
          </TopTooltip>
        </q-btn>
      </template>

      <template #toolbar-second-row>
        <q-btn
          v-if="toolbarExtraButtonVisibility.paste"
          key="paste"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          :disable="freezed || !pasteButtonEnabled"
          icon="fal fa-paste"
          outline
          padding="sm"
          text-color="primary"
          @click="paste"
        >
          <TopTooltip>Paste</TopTooltip>
        </q-btn>

        <q-btn
          v-if="toolbarExtraButtonVisibility.cut"
          key="cut"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          :disable="freezed || !cutButtonEnabled"
          icon="fal fa-cut"
          outline
          padding="sm"
          text-color="primary"
          @click="cutSelectedNode"
        >
          <TopTooltip>Cut</TopTooltip>
        </q-btn>

        <q-btn
          v-if="toolbarExtraButtonVisibility.copy"
          key="copy"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          :disable="freezed || !copyButtonEnabled"
          icon="fal fa-copy"
          outline
          padding="sm"
          text-color="primary"
          @click="copySelectedNode"
        >
          <TopTooltip>Copy</TopTooltip>
        </q-btn>
      </template>
    </ViewPage>
  </QPagePadding>
</template>
