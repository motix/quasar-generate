<script setup lang="ts">
import { nextTick, watch } from 'vue';

import { date } from 'quasar';

import type { TodoVm } from 'models/finance/index.js';

import { useTodosStore } from 'stores/finance/Todos.js';

import useNewPage from 'composables/crud-pages/useNewPage/index.js';
import useCurrentMember from 'composables/finance/shared/useCurrentMember.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

import TodoEditor from 'components/Todo/TodoEditor.vue';

// Constants

const SCOPE_NAME = 'todos-new-page';

// Private

function initialModel(): TodoVm {
  const createDate = date.formatDate(new Date(), editDateFormat);

  return {
    isPrivate: false,
    isArchived: false,
    name: '',
    urlFriendlyName: '',
    createDate,
    dueDate: createDate,
    tasks: {
      key: 'root',
      name: 'Root',
      folders: [],
      tasks: [],
    },
  };
}

// Composables

const store = useTodosStore();

const { authenticatedMemberReady, authenticatedMember } = useCurrentMember();

const { editDateFormat } = requiredConfigEntries('editDateFormat');

const $p = useNewPage<TodoVm>(SCOPE_NAME, true);

// Private Executions

// usePageStatus
void nextTick(() => {
  $p.ready.value = true;
});

// usePageData
$p.viewModel.value = initialModel();
$p.createModel.value = (payload) => store.createDoc(payload);

// useEditor
$p.viewUrl.value = './';
$p.modelFindKeyField.value = 'urlFriendlyName';

// useNavigateToListPage
$p.backUrl.value = '../todos';

// Watch

watch(authenticatedMemberReady, (value) => {
  if (value && authenticatedMember.value && $p.viewModel.value && !$p.viewModel.value.owner) {
    $p.viewModel.value.owner = {
      id: authenticatedMember.value.id,
      fullName: authenticatedMember.value.fullName,
    };
  }
});
</script>

<template>
  <QPagePadding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <TodoEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
