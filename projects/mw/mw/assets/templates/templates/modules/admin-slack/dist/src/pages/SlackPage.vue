<script setup lang="ts">
import { onMounted } from 'vue';

import { Notify } from 'quasar';

import type { SlackUser } from 'models/slack/index.js';

import { loadUsers } from 'services/slack/index.js';

import useListPage from 'composables/crud-pages/useListPage/index.js';
import useNotifications from 'composables/useNotifications.js';

// Constants

const SCOPE_NAME = 'slack-list-page';

// Composables

const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

const $p = useListPage<SlackUser, SlackUser>(SCOPE_NAME, true);

// Private Executions

// useTableView
$p.columns.value = [
  {
    name: 'photoUrl',
    label: 'Avatar',
    align: 'center',
    field: 'photoUrl',
  },
  {
    name: 'id',
    label: 'ID',
    align: 'left',
    field: 'id',
  },
  {
    name: 'email',
    label: 'Email',
    align: 'left',
    field: 'email',
  },
  {
    name: 'fullName',
    label: 'Full Name',
    align: 'left',
    field: 'fullName',
  },
];

// useNavigateToNewPage
$p.newButton.value = false;

// Methods

async function onLoadNextPage(index: number, done: (stop: boolean) => void) {
  if ($p.items.value) {
    done(true);
    return;
  }

  try {
    $p.items.value = await loadUsers();
    done(true);
  } catch (error) {
    if ((error as Error).message === 'ratelimited') {
      Notify.create({
        message: "Slack 'ratelimited' error. Retrying in 10 seconds...",
        type: 'info',
        actions: [{ icon: 'close', color: 'white' }],
      });

      setTimeout(() => {
        void onLoadNextPage(index, done);
      }, 10000);
      return;
    }

    done(true);
    console.error(error);
    notifyLoadDataError();
    notifyErrorDebug(error);
  }
}

// Lifecycle Hooks

onMounted(() => {
  void onLoadNextPage(
    0,
    // done
    () => {
      $p.ready.value = true;
    },
  );
});
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
    </ListPage>
  </QPagePadding>
</template>
