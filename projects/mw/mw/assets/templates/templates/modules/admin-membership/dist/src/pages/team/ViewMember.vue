<script setup lang="ts">
import { computed, onUnmounted } from 'vue';

import type { Member, MemberVm } from 'models/membership/index.js';

import { useMembersStore } from 'stores/membership/Members.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';

import MemberEditor from 'components/Member/MemberEditor.vue';
import MemberViewer from 'components/Member/MemberViewer.vue';

// Constants

const SCOPE_NAME = 'team-view-page';

// Private

const isActive = computed(() => $p.model.value?.isActive);
const inviteToFinanceChannels = computed(() => $p.model.value?.inviteToFinanceChannels);

// Composables

const store = useMembersStore();

const $p = useViewPage<Member, MemberVm>(SCOPE_NAME, true);

// Private Executions

// useReturnUrl
$p.backUrl.value = '../../team';

// usePageData
$p.modelGetter.value = (docKey) => store.doc(docKey);
$p.viewModelGetter.value = (docKey) => store.docVm(docKey);
$p.updateModel.value = (payload) => store.updateDoc(payload);
$p.deleteModel.value = (payload) => store.deleteDoc(payload);

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

$p.watchViewer(isActive, inviteToFinanceChannels);
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <MemberViewer :scope-name="SCOPE_NAME" />
      </template>
      <template #editor>
        <MemberEditor :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
