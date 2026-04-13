<script setup lang="ts">
import { computed, onUnmounted } from 'vue';

import type { Member } from 'models/production/index.js';

import { useMembersStore } from 'stores/production/Members.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';

import MemberViewer from 'components/Member/MemberViewer.vue';

// Constants

const SCOPE_NAME = 'team-view-page';

// Private

const defaultProductionRoleId = computed(() =>
  $p.model.value ? $p.model.value.defaultProductionRole?.id || null : undefined,
);

// Composables

const store = useMembersStore();

const $p = useViewPage<Member, never>(SCOPE_NAME, true);

// Private Executions

// useReturnUrl
$p.backUrl.value = '../../team';

// usePageFeatures
$p.hasEditor.value = false;
$p.hasDeleting.value = false;

// usePageData
$p.modelGetter.value = (docKey) => store.doc(docKey);
$p.updateModel.value = (payload) => store.updateDoc(payload);

// usePageTitle
$p.modelNameField.value = 'fullName';

// usePageData - loadModel
void $p
  .loadModel((payload) => store.loadRealtimeDoc(payload))
  .then(() => {
    $p.ready.value = true;
  });

// Lifecycle Hooks

onUnmounted(() => {
  $p.releaseModel.value && $p.releaseModel.value();
});

// Watch

$p.watchViewer(defaultProductionRoleId);
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <MemberViewer :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
