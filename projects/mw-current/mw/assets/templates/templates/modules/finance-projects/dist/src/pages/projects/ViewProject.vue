<script setup lang="ts">
// sort-imports-ignore

import { computed, onUnmounted, watchEffect } from 'vue';

import { Dark, uid } from 'quasar';

import { useProjectsStore } from 'stores/finance/Projects.js';

import useProjectViewPage from 'composables/finance/project/useProjectViewPage.js';

import ProjectEditor from 'components/Project/ProjectEditor.vue';
import ProjectViewer from 'components/Project/ProjectViewer.vue';

// <% if (config.hasModule('finance-quotations')) { %>•+ finance-quotations
import GenerateQuotationToolbarButton from 'components/Project/GenerateQuotationToolbarButton.vue';
// •- /finance-quotations<% } else { %>•! finance-quotations absent<% } %>

// <% if (config.hasModule('finance-project-expenses')) { %>•+ finance-project-expenses
import AddExpenseToolbarButton from 'components/Project/AddExpenseToolbarButton.vue';
// •- /finance-project-expenses<% } else { %>•! finance-project-expenses absent<% } %>

// <% if (config.hasModule('finance-project-messages')) { %>•+ finance-project-messages
import ChatOnSlackToolbarButton from 'components/Project/ChatOnSlackToolbarButton.vue';
import PrepareSlackChannelToolbarButton from 'components/Project/PrepareSlackChannelToolbarButton.vue';
// •- /finance-project-messages<% } else { %>•! finance-project-messages absent<% } %>

// Constants

const SCOPE_NAME = 'projects-view-page';

// Private

const isArchived = computed(() => $p.model.value?.isArchived);
const isInvoiceRequired = computed(() => $p.model.value?.isInvoiceRequired);

// Composables

const store = useProjectsStore();

const $p = useProjectViewPage(SCOPE_NAME, true);
const {
  // Auto sort
  addItem,
  showAddItemButton,
} = $p;

// Private Executions

// useReturnUrl
$p.backUrl.value = '../projects';

// usePageFeatures
$p.hasDeleting.value = false;

// usePageData
$p.modelFindKeyField.value = 'urlFriendlyName';
$p.modelGetter.value = (docKey) => store.doc(docKey);
$p.viewModelGetter.value = (docKey) => {
  const viewModel = store.docVm(docKey);

  viewModel.items.forEach((item, itemIndex) => {
    item.key = $p.viewModel.value?.items[itemIndex]?.key || uid();
  });

  return viewModel;
};
$p.updateModel.value = (payload) => {
  if (payload.isViewModel) {
    $p.vm.value.items.sort((a, b) => {
      if (a.number) {
        if (b.number) {
          if (a.number === b.number) {
            return a.title > b.title ? 1 : -1;
          }

          return a.number > b.number ? 1 : -1;
        }

        return 1;
      }

      if (b.number) {
        return -1;
      }

      return a.title > b.title ? 1 : -1;
    });

    if (!$p.f.isNumber($p.vm.value.vatPercent)) {
      $p.vm.value.vatableAmount = '';
    }
  }

  return store.updateDoc(payload);
};
$p.deleteModel.value = (payload) => store.deleteDoc(payload);

// usePageTitle
$p.modelNameField.value = 'name';

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

watchEffect(() => {
  $p.hasEditor.value = !!$p.model.value && !$p.model.value.isArchived;

  $p.hasMultiViews.value = $p.anyCollectionHasItems.value;
});

watchEffect(() => {
  $p.readonlyMode.value = !!$p.model.value?.isArchived;
});

$p.watchViewer(isArchived, isInvoiceRequired);
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

        <!-- <% if (config.hasModule('finance-project-expenses')) { %>•+ finance-project-expenses -->
        <AddExpenseToolbarButton :scope-name="SCOPE_NAME" />
        <!-- •- /finance-project-expenses<% } else { %>•! finance-project-expenses absent<% } %> -->

        <!-- <% if (config.hasModule('finance-quotations')) { %>•+ finance-quotations -->
        <GenerateQuotationToolbarButton :scope-name="SCOPE_NAME" />
        <!-- •- /finance-quotations<% } else { %>•! finance-quotations absent<% } %> -->
      </template>

      <template #toolbar-second-row>
        <!-- <% if (config.hasModule('finance-project-messages')) { %>•+ finance-project-messages -->
        <ChatOnSlackToolbarButton :scope-name="SCOPE_NAME" />

        <PrepareSlackChannelToolbarButton :scope-name="SCOPE_NAME" />
        <!-- •- /finance-project-messages<% } else { %>•! finance-project-messages absent<% } %> -->
      </template>
    </ViewPage>
  </QPagePadding>
</template>
