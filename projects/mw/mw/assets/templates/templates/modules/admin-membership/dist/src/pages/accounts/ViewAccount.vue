<script setup lang="ts">
import { computed, onUnmounted } from 'vue';

import { sortBy } from 'lodash-es';

import type { UserAccount } from 'models/membership/index.js';

import { useUserAccountsStore } from 'stores/membership/UserAccounts.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';

import UserAccountViewer from 'components/UserAccount/UserAccountViewer.vue';

// Constants

const SCOPE_NAME = 'accounts-view-page';

// Private

const claims = computed(() =>
  !$p.model.value ? undefined : sortBy($p.model.value.claims, (claim) => claim).join('\n'),
);

// Composables

const store = useUserAccountsStore();

const $p = useViewPage<UserAccount, never>(SCOPE_NAME, true);

// Private Executions

// useReturnUrl
$p.backUrl.value = '../accounts';

// usePageFeatures
$p.hasEditor.value = false;
$p.hasDeleting.value = false;

// usePageData
$p.modelGetter.value = (docKey) => store.doc(docKey);
$p.updateModel.value = (payload) => store.updateDoc(payload);

// usePageTitle
$p.modelNameField.value = 'displayName';

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

$p.watchViewer(claims);
</script>

<template>
  <QPagePadding padding>
    <ViewPage :scope-name="SCOPE_NAME">
      <template #viewer>
        <UserAccountViewer :scope-name="SCOPE_NAME" />
      </template>
    </ViewPage>
  </QPagePadding>
</template>
