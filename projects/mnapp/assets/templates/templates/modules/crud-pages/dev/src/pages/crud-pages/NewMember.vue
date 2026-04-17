<script setup lang="ts">
import { nextTick } from 'vue';

import type { MemberVm } from 'models/crud-pages/index.js';

import { useMembersStore } from 'stores/crud-pages/Members.js';

import useNewPage from 'composables/crud-pages/useNewPage/index.js';

import MemberEditor from 'components/crud-pages/MemberEditor.vue';

// Constants

const SCOPE_NAME = 'team-new-page';

// Private

function initialModel(): MemberVm {
  return {
    uid: '0000000000000000000000000000',
    isActive: true,
    email: 'xxx@motiteam.com',
    fullName: '',
    photoUrl:
      'https://lh3.googleusercontent.com/a-/AOh14GgtXlNBjgr5K_ACqE6_YzAqeleT0TPKR92uJohb=s96-c',
    slackId: '',
    inviteToFinanceChannels: false,
  };
}

// Composables

const store = useMembersStore();

const $p = useNewPage<MemberVm>(SCOPE_NAME, true);

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

// useNavigateToListPage
$p.backUrl.value = '../crud-pages';
</script>

<template>
  <q-page-padding padding>
    <NewPage :scope-name="SCOPE_NAME">
      <MemberEditor :scope-name="SCOPE_NAME" />
    </NewPage>
  </q-page-padding>
</template>
