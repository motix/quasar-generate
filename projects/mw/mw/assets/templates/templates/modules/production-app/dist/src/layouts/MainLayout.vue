<script setup lang="ts">
import { computed, ref } from 'vue';

import { Dark } from 'quasar';

import { requiredConfigEntries } from 'composables/useConfig.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import useFloatToolbar from 'composables/useFloatToolbar.js';
import usePageTitle from 'composables/usePageTitle.js';
import useStickyHeaders from 'composables/useStickyHeaders.js';

// Composables

const { portalUrl } = requiredConfigEntries('portalUrl');

const { appName, pageTitle } = usePageTitle();

const {
  headerHeight,
  headerElevated,
  onScroll: floatToolbarOnScroll,
  onReveal: floatToolbarOnReveal,
} = useFloatToolbar(50, 50);

const { onReveal: stickyHeadersOnReveal } = useStickyHeaders(50);

const { isAuthenticated, authenticatedUser, isSignInPage, hasRole, signOut } = useFirebaseAuth();

// Data

const leftDrawerOpen = ref(false);

// Computed

const leftDrawerShow = computed(
  () => leftDrawerOpen.value && (hasRole('production') || hasRole('maintenance')),
);

// Methods

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<template>
  <q-layout view="lHh lpr fFf" @scroll="floatToolbarOnScroll">
    <q-header
      class="bg-primary text-white"
      :elevated="headerElevated"
      height-hint="98"
      reveal
      @reveal="
        floatToolbarOnReveal($event);
        stickyHeadersOnReveal($event);
      "
    >
      <q-toolbar class="top-toolbar">
        <q-btn
          aria-label="Menu"
          dense
          :disable="!hasRole('production') && !hasRole('maintenance')"
          flat
          icon="menu"
          round
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <RouterLink class="text-white" style="text-decoration: none" to="/">
            {{ appName }}
          </RouterLink>
        </q-toolbar-title>

        <FadeTransition>
          <div v-if="isAuthenticated">
            <FadeTransition>
              <q-avatar v-if="!leftDrawerOpen" size="sm">
                <q-img v-if="authenticatedUser.photoURL" :src="authenticatedUser.photoURL" />
                <q-icon v-else color="dark" name="fas fa-user-alt" size="lg" />
                <q-tooltip>
                  {{ authenticatedUser.displayName }}
                </q-tooltip>
              </q-avatar>
            </FadeTransition>
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

    <q-drawer
      class="bg-light"
      :model-value="leftDrawerShow"
      :show-if-above="hasRole('production') || hasRole('maintenance')"
      :width="250"
      @update:model-value="leftDrawerOpen = $event"
    >
      <q-scroll-area
        class="shadow-4 inset-shadow"
        :style="`height: calc(100% - ${headerHeight}px); margin-top: ${headerHeight}px; border-right: 1px solid #${
          Dark && Dark.isActive ? '666' : 'ddd'
        }`"
      >
        <q-list padding>
          <!-- <% if (config.hasModule('production-projects')) { %>•+ production-projects -->
          <q-item v-if="hasRole('production')" v-ripple clickable to="/projects">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-briefcase" />
            </q-item-section>
            <q-item-section>Projects</q-item-section>
          </q-item>
          <!-- •- /production-projects<% } else { %>•! production-projects absent<% } %> -->

          <!-- <% if (config.hasModule('production-project-tasks')) { %>•+ production-project-tasks -->
          <q-item v-if="hasRole('production')" v-ripple clickable to="/project-tasks">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-bars-progress" />
            </q-item-section>
            <q-item-section>Project Tasks</q-item-section>
          </q-item>
          <!-- •- /production-project-tasks<% } else { %>•! production-project-tasks absent<% } %> -->

          <!-- <% if (config.hasModule('production-timesheets')) { %>•+ production-timesheets -->
          <q-item v-if="hasRole('production')" v-ripple clickable to="/timesheets">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-list-timeline" />
            </q-item-section>
            <q-item-section>Timesheets</q-item-section>
          </q-item>
          <!-- •- /production-timesheets<% } else { %>•! production-timesheets absent<% } %> -->

          <!-- <% if (config.hasModule('production-todos')) { %>•+ production-todos -->
          <q-item v-if="hasRole('production')" v-ripple clickable to="/todos">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-list-check" />
            </q-item-section>
            <q-item-section>Todos</q-item-section>
          </q-item>
          <!-- •- /production-todos<% } else { %>•! production-todos absent<% } %> -->

          <!-- <% if (config.hasModule('production-team')) { %>•+ production-team -->
          <q-item v-if="hasRole('production')" v-ripple clickable to="/team">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-users" />
            </q-item-section>
            <q-item-section>Team</q-item-section>
          </q-item>
          <!-- •- /production-team<% } else { %>•! production-team absent<% } %> -->

          <!-- <% if (config.hasModule('production-customers')) { %>•+ production-customers -->
          <q-item v-if="hasRole('project-leader')" v-ripple clickable to="/customers">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-user-crown" />
            </q-item-section>
            <q-item-section>Customers</q-item-section>
          </q-item>
          <!-- •- /production-customers<% } else { %>•! production-customers absent<% } %> -->

          <!-- <% if (config.hasModule('production-production-roles')) { %>•+ production-production-roles -->
          <q-item
            v-if="hasRole('maintenance') || hasRole('project-leader')"
            v-ripple
            clickable
            to="/production-roles"
          >
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-diagram-subtask" />
            </q-item-section>
            <q-item-section>Production Roles</q-item-section>
          </q-item>
          <!-- •- /production-production-roles<% } else { %>•! production-production-roles absent<% } %> -->

          <!-- <% if (config.hasModule('production-product-types')) { %>•+ production-product-types -->
          <q-item
            v-if="hasRole('maintenance') || hasRole('project-leader')"
            v-ripple
            clickable
            to="/product-types"
          >
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-cards-blank" />
            </q-item-section>
            <q-item-section>Product Types</q-item-section>
          </q-item>

          <q-item v-if="hasRole('maintenance')" v-ripple clickable to="/production-salary">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-sack-dollar" />
            </q-item-section>
            <q-item-section>Production Salary</q-item-section>
          </q-item>
          <!-- •- /production-product-types<% } else { %>•! production-product-types absent<% } %> -->

          <q-separator />

          <q-item v-ripple clickable :href="portalUrl">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-solar-system" />
            </q-item-section>
            <q-item-section>Back to Portal</q-item-section>
          </q-item>

          <q-item v-ripple clickable>
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-question-circle" />
            </q-item-section>
            <q-item-section>Help</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <div class="absolute-top bg-primary" dark :style="`height: ${headerHeight}px`">
        <q-img
          class="absolute-top"
          :img-style="{
            backgroundSize: 'auto 90px',
            backgroundRepeat: 'repeat',
          }"
          no-default-spinner
          position="0 0"
          src="/overlay-bg.png"
          :style="`height: ${headerHeight}px`"
        >
          <div class="absolute-bottom bg-transparent">
            <q-item v-if="isAuthenticated" class="q-pa-none">
              <q-item-section avatar>
                <q-avatar size="56px">
                  <q-img v-if="authenticatedUser.photoURL" :src="authenticatedUser.photoURL" />
                  <q-icon v-else color="dark" name="fas fa-user-alt" size="lg" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-subtitle1">
                  {{ authenticatedUser.displayName }}
                </q-item-label>
                <q-item-label class="text-caption">
                  {{ authenticatedUser.email?.substring(0, authenticatedUser.email.indexOf('@')) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </q-img>
      </div>
    </q-drawer>

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

:deep() .menu-item .q-item__section--avatar .q-icon {
  color: $primary;
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
