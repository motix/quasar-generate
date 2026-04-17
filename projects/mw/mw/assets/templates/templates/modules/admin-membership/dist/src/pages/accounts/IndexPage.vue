<script lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUsersClass } from '@fortawesome/pro-light-svg-icons';
import { faSync } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

import { ref, watch } from 'vue';

import type { QDialogOptions } from 'quasar';
import { Dark, Dialog, Notify, QAjaxBar } from 'quasar';

import assignOptional from 'utils/assignOptional.js';

import type { UserAccount } from 'models/membership/index.js';

import {
  userAccountsStoreDefaultSort,
  useUserAccountsStore,
} from 'stores/membership/UserAccounts.js';

import { rebuildUserAccountsCollection as rebuildAccounts } from 'services/admin/accounts.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import useListPageStore from 'composables/crud-pages/useListPageStore.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import MemberComponent from 'components/Member/MemberComponent.vue';

// Constants

const SCOPE_NAME = 'accounts-list-page';

const useUserAccountListPage = () => useListPage<UserAccount, UserAccount>(SCOPE_NAME, true);
type ListPageType = ReturnType<typeof useUserAccountListPage>;

function useRebuildUserAccountsCollection(
  ready: ListPageType['ready'],
  loadFirstPage: ListPageType['loadFirstPage'],
  resetItems: ListPageType['resetItems'],
) {
  // Composables

  const store = useUserAccountsStore();

  // Data

  const rebuildingUserAccountsCollection = ref(false);
  const freezingBar = ref<QAjaxBar | null>(null);

  // Methods

  function rebuildUserAccountsCollection() {
    Dialog.create(
      assignOptional<QDialogOptions>(
        {
          title: 'Rebuild',
          message: 'Are you sure want to rebuild the whole User Accounts collection?',
          dark: !Dark.isActive,
          cancel: true,
          persistent: true,
          ok: {
            color: 'negative',
          },
        },
        {
          class: Dark.isActive ? 'text-dark' : undefined,
        },
      ),
    ).onOk(() => {
      rebuildingUserAccountsCollection.value = true;

      rebuildAccounts()
        .then(() => {
          Notify.create({
            message: 'User Accounts collection rebuilt successfully.',
            type: 'positive',
          });

          ready.value = false;
          store.releaseDocs({ immediately: true });
          setTimeout(() => {
            void loadFirstPage(
              (payload) => store.loadDocsPage(payload),
              // done
              () => {
                resetItems(store.docPage(0));
                ready.value = true;
              },
            );
          }, 1000);
        })
        .catch(() => {
          Notify.create({
            message:
              'Rebuild User Accounts collection error. Refresh the page to try again or contact support.',
            type: 'negative',
          });
        })
        .finally(() => {
          rebuildingUserAccountsCollection.value = false;
        });
    });
  }

  // Watch

  watch(rebuildingUserAccountsCollection, (value) => {
    if (value) {
      freezingBar.value?.start();
    } else {
      freezingBar.value?.stop();
    }
  });

  return {
    rebuildingUserAccountsCollection,
    freezingBar,
    rebuildUserAccountsCollection,
  };
}
</script>

<script setup lang="ts">
// Options

defineOptions({ name: 'AliveIndex' });

// Composables

const { hasRole } = useFirebaseAuth();

const $p = useUserAccountListPage();
const {
  // Auto sort
  listItemCardWidth,
  onItemClick,
  updateMainTableStickyHeaders,
} = $p;

const { onLoadNextPage } = useListPageStore<UserAccount>(
  useUserAccountsStore(),
  $p.loadPage,
  $p.appendItems,
  $p.updateItems,
  {
    ready: $p.ready,
    loadFirstPage: $p.loadFirstPage,
    resetItems: $p.resetItems,
  },
);

const { rebuildingUserAccountsCollection, freezingBar, rebuildUserAccountsCollection } =
  useRebuildUserAccountsCollection($p.ready, $p.loadFirstPage, $p.resetItems);

// Private Executions

library.add(faUsersClass, faSync);

// useTableView
$p.columns.value = [
  {
    name: 'photoUrl',
    label: 'Avatar',
    align: 'center',
    field: 'photoUrl',
  },
  {
    name: 'displayName',
    label: 'Display Name',
    align: 'left',
    field: 'displayName',
  },
  {
    name: 'member',
    label: 'Member',
    align: 'left',
    field: 'uid',
  },
  {
    name: 'email',
    label: 'Email',
    align: 'left',
    field: 'email',
  },
  {
    name: 'uid',
    label: 'UID',
    align: 'left',
    field: 'uid',
  },
  {
    name: 'claims',
    label: 'Claims',
    align: 'left',
    field: 'claims',
  },
];

// usePageData
$p.queryConstraints.value = [...userAccountsStoreDefaultSort];

// useNavigateToViewPage
$p.viewUrl.value = '/accounts/';

// useNavigateToNewPage
$p.newButton.value = false;
</script>

<template>
  <QPagePadding padding>
    <ListPage :composition="$p" :scope-name="SCOPE_NAME" @load-next-page="onLoadNextPage">
      <template #body-cell-photoUrl="{ props }">
        <q-td auto-width :props="props">
          <q-avatar size="md">
            <q-img v-if="props.value" :src="props.value" />
            <q-icon v-else color="dark" name="fas fa-user-alt" size="lg" />
          </q-avatar>
        </q-td>
      </template>
      <template #body-cell-member="{ props }">
        <q-td :props="props">
          <MemberComponent :uid="props.value" @loaded="updateMainTableStickyHeaders" />
        </q-td>
      </template>
      <template #body-cell-claims="{ props }">
        <q-td :props="props">
          <div v-for="claim in props.value" :key="claim">
            {{ claim }}
          </div>
        </q-td>
      </template>

      <template #item-card="{ model, link }">
        <ExpandableCard
          :avatar-icon="model.photoUrl ? undefined : 'fas fa-user-alt'"
          :avatar-image="model.photoUrl"
          :caption="model.email"
          clickable
          :external-link-url="link()"
          :header-separator="model.claims.length > 0"
          :style="{ maxWidth: listItemCardWidth + 'px' }"
          :subtitle="model.uid"
          :title="model.displayName"
          @click="onItemClick($event, model, true)"
        >
          <template #bezel-less-top>
            <q-card-section>
              <MemberComponent :uid="model.uid" />
            </q-card-section>

            <q-separator inset />
          </template>

          <template v-if="model.claims.length > 0" #body>
            <div class="text-overline text-weight-regular text-uppercase text-muted">Claims</div>

            <div class="q-gutter-x-md row">
              <div v-for="claim in model.claims" :key="claim" class="text-caption">
                {{ claim }}
              </div>
            </div>
          </template>
        </ExpandableCard>
      </template>

      <template #toolbar-extra>
        <q-btn
          v-if="hasRole('admin')"
          key="rebuildUserAccountsCollection"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          :disable="rebuildingUserAccountsCollection"
          :loading="rebuildingUserAccountsCollection"
          outline
          padding="sm"
          text-color="primary"
          @click="rebuildUserAccountsCollection"
        >
          <FontAwesomeLayers class="fa-lg" fixed-width style="margin-left: 1px; margin-right: 1px">
            <FontAwesomeIcon :icon="['fal', 'users-class']" size="lg" transform="left-2 down-3" />
            <FontAwesomeIcon :icon="['fas', 'sync']" size="lg" transform="shrink-10 up-8 left-9" />
          </FontAwesomeLayers>
          <TopTooltip>Rebuild User Accounts Collection</TopTooltip>
        </q-btn>
      </template>
    </ListPage>

    <q-ajax-bar ref="freezingBar" color="warning" position="bottom" size="3px" />
  </QPagePadding>
</template>
