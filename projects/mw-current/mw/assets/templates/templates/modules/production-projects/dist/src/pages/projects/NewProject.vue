<script setup lang="ts">
import { nextTick, watch } from 'vue';

import { projectVmDefaultExtendedFields } from 'utils/production/Project/ProjectDefaultExtendedFields.js';

import type { ProjectVm } from 'models/production/index.js';

import { useProjectsStore } from 'stores/production/Projects.js';

import { useProjectNewPage } from 'composables/production/project/useProjectEditPage.js';
import useCurrentMember from 'composables/production/shared/useCurrentMember.js';

import ProjectEditor from 'components/Project/ProjectEditor.vue';

// Constants

const SCOPE_NAME = 'projects-new-page';

// Private

function initialModel(): ProjectVm {
  return {
    isPrivate: false,
    isArchived: false,
    name: '',
    urlFriendlyName: '',
    customerContact: '',
    startDate: '',
    finishDate: '',
    description: '',
    items: [],
    ...projectVmDefaultExtendedFields(),
  };
}

// Composables

const store = useProjectsStore();

const { authenticatedMemberReady, authenticatedMember } = useCurrentMember();

const $p = useProjectNewPage(SCOPE_NAME, true);

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
$p.backUrl.value = '../projects';

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
      <ProjectEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </QPagePadding>
</template>
