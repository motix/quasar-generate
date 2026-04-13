<script setup lang="ts">
import { computed, onUnmounted, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import { Dark, uid } from 'quasar';

import { useProjectsStore } from 'stores/production/Projects.js';

import { useProjectViewPage } from 'composables/production/project/useProjectEditPage.js';
import useProjectVisibleToUser from 'composables/production/project/useProjectVisibleToUser.js';
import useCurrentMember from 'composables/production/shared/useCurrentMember.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import ProjectEditor from 'components/Project/ProjectEditor.vue';
import ProjectViewer from 'components/Project/ProjectViewer.vue';

// Constants

const SCOPE_NAME = 'projects-view-page';

// Private

const isArchived = computed(() => $p.model.value?.isArchived);

// Composables

const router = useRouter();
const store = useProjectsStore();

const { hasRole } = useFirebaseAuth();

const { authenticatedMemberReady, authenticatedMember } = useCurrentMember();
const { projectVisibleToUser } = useProjectVisibleToUser(authenticatedMember);

const $p = useProjectViewPage(SCOPE_NAME, true);
const {
  // Auto sort
  addItem,
  hideContributions,
  showAddItemButton,
  showToggleContributionsButton,
} = $p;

// Private Executions

// useReturnUrl
$p.backUrl.value = '../projects';

// usePageFeatures
$p.hasEditor.value = hasRole('project-leader');
$p.hasDeleting.value = hasRole('manager');

// usePageData
$p.modelFindKeyField.value = 'urlFriendlyName';
$p.modelGetter.value = (docKey) => store.doc(docKey);
$p.viewModelGetter.value = (docKey) => {
  const viewModel = store.docVm(docKey);

  viewModel.items.forEach((item, itemIndex) => {
    item.key = $p.viewModel.value?.items[itemIndex]?.key || uid();

    item.contributions.forEach((contribution, contributionIndex) => {
      contribution.key =
        $p.viewModel.value?.items[itemIndex]?.contributions[contributionIndex]?.key || uid();
    });
  });

  return viewModel;
};
$p.updateModel.value = (payload) => store.updateDoc(payload);
$p.deleteModel.value = (payload) => store.deleteDoc(payload);

// usePageTitle
$p.modelNameField.value = 'name';

// usePageData - loadModel
void $p
  .loadModel((payload) => store.loadRealtimeDoc(payload))
  .then(() => {
    if (authenticatedMemberReady.value && !projectVisibleToUser($p.m.value)) {
      void router.replace('/ErrorNotFound');
    } else {
      $p.ready.value = true;
    }
  });

// Lifecycle Hooks

onUnmounted(() => {
  $p.releaseModel.value && $p.releaseModel.value();
});

// Watch

watch(authenticatedMemberReady, (value) => {
  if (value && $p.ready.value && !projectVisibleToUser($p.m.value)) {
    void router.replace('/ErrorNotFound');
  }
});

watchEffect(() => {
  $p.hasEditor.value = !!$p.model.value && !$p.model.value.isArchived;

  $p.hasMultiViews.value = $p.hasItems.value;
});

watchEffect(() => {
  $p.readonlyMode.value = !!$p.model.value?.isArchived;
});

$p.watchViewer(isArchived);
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <ProjectViewer :scope-name="SCOPE_NAME" />
      </template>
      <template #editor>
        <ProjectEditor :scope-name="SCOPE_NAME" />
      </template>

      <template #toolbar-extra>
        <q-btn
          v-show="showToggleContributionsButton"
          key="toggleContributions"
          :color="Dark.isActive ? 'grey-9' : 'grey-3'"
          round
          text-color="primary"
          @click="hideContributions = !hideContributions"
        >
          <q-icon class="fa-stack" style="font-size: 0.875em">
            <i
              class="fal fa-poll-people fa-stack-2x"
              :class="{ 'text-grey': hideContributions }"
            ></i>
            <i v-if="!hideContributions" class="fal fa-slash fa-stack-2x"></i>
          </q-icon>

          <TopTooltip>
            {{ hideContributions ? 'Show Contributions' : 'Hide Contributions' }}
          </TopTooltip>
        </q-btn>

        <q-btn
          v-show="showAddItemButton"
          key="addItem"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          icon="fal fa-plus"
          outline
          padding="sm"
          text-color="primary"
          @click="addItem"
        >
          <TopTooltip>Add Item</TopTooltip>
        </q-btn>
      </template>
    </ViewPage>
  </QPagePadding>
</template>
