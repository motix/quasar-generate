<script setup lang="ts">
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import usePageTitle from 'composables/usePageTitle.js';

// Composables

const { appName, pageTitle } = usePageTitle();

const { isAuthenticated, authenticatedUser, isSignInPage, hasRole, signOut } = useFirebaseAuth();
</script>

<template>
  <q-layout view="hHh lpr fFf">
    <q-header class="bg-primary text-white" height-hint="98" reveal>
      <q-toolbar class="top-toolbar">
        <q-toolbar-title>
          <RouterLink class="text-white" style="text-decoration: none" to="/">
            {{ appName }}
          </RouterLink>
        </q-toolbar-title>

        <FadeTransition>
          <div v-if="isAuthenticated">
            <q-avatar size="sm">
              <q-img v-if="authenticatedUser.photoURL" :src="authenticatedUser.photoURL" />
              <q-icon v-else color="dark" name="fas fa-user-alt" size="lg" />
              <q-tooltip>
                {{ authenticatedUser.displayName }}
              </q-tooltip>
            </q-avatar>
            <q-btn flat icon="fal fa-sign-out" round @click="signOut()">
              <q-tooltip>Sign Out</q-tooltip>
            </q-btn>
          </div>

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
      <q-page>
        <Transition name="scale">
          <q-toolbar v-show="pageTitle" class="page-title text-white shadow-4">
            <q-toolbar-title>
              <FadeTransition>
                <span :key="pageTitle || ''">{{ pageTitle }}</span>
              </FadeTransition>
            </q-toolbar-title>
          </q-toolbar>
        </Transition>

        <RouterView v-slot="{ Component, route }">
          <FadeTransition>
            <component :is="Component" :key="route.meta.mainTransitionKey" />
          </FadeTransition>
        </RouterView>
      </q-page>
    </q-page-container>

    <q-footer class="transparent">
      <FadeTransition>
        <q-tabs v-if="hasRole('user')" class="bg-grey-8 text-white shadow-up-5" dense>
          <q-route-tab label="Home" name="home" to="/" />
        </q-tabs>
        <q-tabs v-else dense>
          <div style="height: 36px"></div>
        </q-tabs>
      </FadeTransition>
    </q-footer>
  </q-layout>
</template>

<style scoped lang="scss">
.top-toolbar {
  background-image: url('/overlay-bg.png');
  background-size: auto 90px;
  background-position: -250px 0;
}

.page-title {
  background-image: url('/overlay-bg.png');
  background-size: auto 90px;
  background-position: -250px -50px;
  background-color: $primary;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.25s ease-out;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  margin-top: -50px;
}
</style>
