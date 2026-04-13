<script setup lang="ts">
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import usePageTitle from 'composables/usePageTitle.js';

// Composables

const { appName } = usePageTitle();

const { isAuthenticated, isSignInPage, signOut } = useFirebaseAuth();
</script>

<template>
  <q-layout view="hHh lpr fFf">
    <q-header class="bg-primary text-white" elevated height-hint="98" reveal>
      <q-toolbar class="top-toolbar">
        <q-toolbar-title>
          {{ appName }}
        </q-toolbar-title>

        <FadeTransition>
          <q-btn v-if="isAuthenticated" flat icon="fal fa-sign-out" round @click="signOut()">
            <q-tooltip>Sign Out</q-tooltip>
          </q-btn>

          <q-btn
            v-else-if="!isSignInPage"
            flat
            icon="fal fa-sign-in"
            round
            :to="{ name: 'SignIn' }"
          >
            <q-tooltip>Sign In</q-tooltip>
          </q-btn>
        </FadeTransition>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <RouterView v-slot="{ Component }">
        <FadeTransition>
          <component :is="Component" />
        </FadeTransition>
      </RouterView>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.top-toolbar {
  background-image: url('/overlay-bg.png');
  background-size: auto 90px;
  background-position: -250px 0;
}
</style>
