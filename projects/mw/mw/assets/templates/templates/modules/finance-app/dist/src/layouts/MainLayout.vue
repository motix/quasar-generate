<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBarsProgress as falBarsProgress,
  faExchange as falExchange,
  faFileInvoice as falFileInvoice,
  faFileInvoiceDollar as falFileInvoiceDollar,
  faLayerGroup as falLayerGroup,
  faReceipt as falReceipt,
} from '@fortawesome/pro-light-svg-icons';
import {
  faBriefcase as fasBriefcase,
  faFileInvoiceDollar as fasFileInvoiceDollar,
  faReceipt as fasReceipt,
} from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

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

const leftDrawerShow = computed(() => leftDrawerOpen.value && hasRole('finance'));

// Private Executions

library.add(
  falLayerGroup,
  falFileInvoice,
  falFileInvoiceDollar,
  falReceipt,
  falExchange,
  falBarsProgress,
  fasBriefcase,
  fasFileInvoiceDollar,
  fasReceipt,
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
          :disable="!hasRole('finance')"
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
      :show-if-above="hasRole('finance')"
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
          <!-- <% if (config.hasModule('finance-projects')) { %>•+ finance-projects -->
          <q-item v-ripple clickable to="/projects">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-briefcase" />
            </q-item-section>
            <q-item-section>Projects</q-item-section>
          </q-item>
          <!-- •- /finance-projects<% } else { %>•! finance-projects absent<% } %> -->

          <!-- <% if (config.hasModule('finance-project-tasks')) { %>•+ finance-project-tasks -->
          <q-item v-ripple clickable to="/project-tasks">
            <q-item-section avatar>
              <FontAwesomeLayers
                class="fa-lg text-primary"
                fixed-width
                style="margin-left: 1px; margin-right: 1px"
              >
                <FontAwesomeIcon :icon="['fal', 'bars-progress']" size="lg" />
                <FontAwesomeIcon
                  :icon="['fas', 'briefcase']"
                  size="lg"
                  transform="shrink-10 down-8 right-9"
                />
              </FontAwesomeLayers>
            </q-item-section>
            <q-item-section>Project Tasks</q-item-section>
          </q-item>
          <!-- •- /finance-project-tasks<% } else { %>•! finance-project-tasks absent<% } %> -->

          <!-- <% if (config.hasModule('finance-quotations')) { %>•+ finance-quotations -->
          <q-item v-ripple clickable to="/quotations">
            <q-item-section avatar>
              <FontAwesomeLayers
                class="fa-lg text-primary"
                fixed-width
                style="margin-left: 1px; margin-right: 1px"
              >
                <FontAwesomeIcon :icon="['fal', 'file-invoice']" size="lg" />
                <FontAwesomeIcon
                  :icon="['fas', 'briefcase']"
                  size="lg"
                  transform="shrink-10 down-8 right-9"
                />
              </FontAwesomeLayers>
            </q-item-section>
            <q-item-section>Quotations</q-item-section>
          </q-item>
          <!-- •- /finance-quotations<% } else { %>•! finance-quotations absent<% } %> -->

          <!-- <% if (config.hasModule('finance-project-invoices')) { %>•+ finance-project-invoices -->
          <q-item v-ripple clickable to="/project-invoices">
            <q-item-section avatar>
              <FontAwesomeLayers
                class="fa-lg text-primary"
                fixed-width
                style="margin-left: 1px; margin-right: 1px"
              >
                <FontAwesomeIcon :icon="['fal', 'file-invoice-dollar']" size="lg" />
                <FontAwesomeIcon
                  :icon="['fas', 'briefcase']"
                  size="lg"
                  transform="shrink-10 down-8 right-9"
                />
              </FontAwesomeLayers>
            </q-item-section>
            <q-item-section>Project Invoices</q-item-section>
          </q-item>
          <!-- •- /finance-project-invoices<% } else { %>•! finance-project-invoices absent<% } %> -->

          <!-- <% if (config.hasModule('finance-project-expenses')) { %>•+ finance-project-expenses -->
          <q-item v-ripple clickable to="/project-expenses">
            <q-item-section avatar>
              <FontAwesomeLayers
                class="fa-lg text-primary"
                fixed-width
                style="margin-left: 1px; margin-right: 1px"
              >
                <FontAwesomeIcon :icon="['fal', 'receipt']" size="lg" />
                <FontAwesomeIcon
                  :icon="['fas', 'briefcase']"
                  size="lg"
                  transform="shrink-10 down-8 right-9"
                />
              </FontAwesomeLayers>
            </q-item-section>
            <q-item-section>Project Expenses</q-item-section>
          </q-item>
          <!-- •- /finance-project-expenses<% } else { %>•! finance-project-expenses absent<% } %> -->

          <!-- <% if (config.hasModule('finance-project-transactions')) { %>•+ finance-project-transactions -->
          <q-item v-ripple clickable to="/project-transactions">
            <q-item-section avatar>
              <FontAwesomeLayers
                class="fa-lg text-primary"
                fixed-width
                style="margin-left: 1px; margin-right: 1px"
              >
                <FontAwesomeIcon :icon="['fal', 'exchange']" size="lg" />
                <FontAwesomeIcon
                  :icon="['fas', 'briefcase']"
                  size="lg"
                  transform="shrink-10 down-8 right-9"
                />
              </FontAwesomeLayers>
            </q-item-section>
            <q-item-section>Project Transactions</q-item-section>
          </q-item>
          <!-- •- /finance-project-transactions<% } else { %>•! finance-project-transactions absent<% } %> -->

          <!-- <% if (config.hasModule('finance-invoices')) { %>•+ finance-invoices -->
          <q-item v-ripple clickable to="/general-invoices">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-file-invoice-dollar" />
            </q-item-section>
            <q-item-section>General Invoices</q-item-section>
          </q-item>

          <q-item v-ripple clickable to="/general-invoice-transactions">
            <q-item-section avatar>
              <FontAwesomeLayers
                class="fa-lg text-primary"
                fixed-width
                style="margin-left: 1px; margin-right: 1px"
              >
                <FontAwesomeIcon :icon="['fal', 'exchange']" size="lg" />
                <FontAwesomeIcon
                  :icon="['fas', 'file-invoice-dollar']"
                  size="lg"
                  transform="shrink-10 down-8 right-9"
                />
              </FontAwesomeLayers>
            </q-item-section>
            <q-item-section>General Invoice Transactions</q-item-section>
          </q-item>
          <!-- •- /finance-invoices<% } else { %>•! finance-invoices absent<% } %> -->

          <!-- <% if (config.hasModule('finance-invoice-groups')) { %>•+ finance-invoice-groups -->
          <q-item v-ripple clickable to="/invoice-groups">
            <q-item-section avatar>
              <FontAwesomeLayers
                class="fa-lg text-primary"
                fixed-width
                style="margin-left: 1px; margin-right: 1px"
              >
                <FontAwesomeIcon :icon="['fal', 'layer-group']" size="lg" />
                <FontAwesomeIcon
                  :icon="['fas', 'file-invoice-dollar']"
                  size="lg"
                  transform="shrink-10 down-8 right-9"
                />
              </FontAwesomeLayers>
            </q-item-section>
            <q-item-section>Invoice Groups</q-item-section>
          </q-item>
          <!-- •- /finance-invoice-groups<% } else { %>•! finance-invoice-groups absent<% } %> -->

          <!-- <% if (config.hasModule('finance-expenses')) { %>•+ finance-expenses -->
          <q-item v-ripple clickable to="/general-expenses">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-receipt" />
            </q-item-section>
            <q-item-section>General Expenses</q-item-section>
          </q-item>

          <q-item v-ripple clickable to="/general-expense-transactions">
            <q-item-section avatar>
              <FontAwesomeLayers
                class="fa-lg text-primary"
                fixed-width
                style="margin-left: 1px; margin-right: 1px"
              >
                <FontAwesomeIcon :icon="['fal', 'exchange']" size="lg" />
                <FontAwesomeIcon
                  :icon="['fas', 'receipt']"
                  size="lg"
                  transform="shrink-10 down-8 right-9"
                />
              </FontAwesomeLayers>
            </q-item-section>
            <q-item-section>General Expense Transactions</q-item-section>
          </q-item>
          <!-- •- /finance-expenses<% } else { %>•! finance-expenses absent<% } %> -->

          <!-- <% if (config.hasModule('finance-expense-groups')) { %>•+ finance-expense-groups -->
          <q-item v-ripple clickable to="/expense-groups">
            <q-item-section avatar>
              <FontAwesomeLayers
                class="fa-lg text-primary"
                fixed-width
                style="margin-left: 1px; margin-right: 1px"
              >
                <FontAwesomeIcon :icon="['fal', 'layer-group']" size="lg" />
                <FontAwesomeIcon
                  :icon="['fas', 'receipt']"
                  size="lg"
                  transform="shrink-10 down-8 right-9"
                />
              </FontAwesomeLayers>
            </q-item-section>
            <q-item-section>Expense Groups</q-item-section>
          </q-item>
          <!-- •- /finance-expense-groups<% } else { %>•! finance-expense-groups absent<% } %> -->

          <!-- <% if (config.hasModule('finance-transactions')) { %>•+ finance-transactions -->
          <q-item v-ripple clickable to="/general-transactions">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-exchange" />
            </q-item-section>
            <q-item-section>General Transactions</q-item-section>
          </q-item>
          <!-- •- /finance-transactions<% } else { %>•! finance-transactions absent<% } %> -->

          <!-- <% if (config.hasModule('finance-sales-contracts')) { %>•+ finance-sales-contracts -->
          <q-item v-ripple clickable to="/sales-contracts">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-file-signature" />
            </q-item-section>
            <q-item-section>Sales Contracts</q-item-section>
          </q-item>
          <!-- •- /finance-sales-contracts<% } else { %>•! finance-sales-contracts absent<% } %> -->

          <!-- <% if (config.hasModule('finance-todos')) { %>•+ finance-todos -->
          <q-item v-if="hasRole('finance')" v-ripple clickable to="/todos">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-list-check" />
            </q-item-section>
            <q-item-section>Todos</q-item-section>
          </q-item>
          <!-- •- /finance-todos<% } else { %>•! finance-todos absent<% } %> -->

          <!-- <% if (config.hasModule('finance-team')) { %>•+ finance-team -->
          <q-item v-ripple clickable to="/team">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-users" />
            </q-item-section>
            <q-item-section>Team</q-item-section>
          </q-item>
          <!-- •- /finance-team<% } else { %>•! finance-team absent<% } %> -->

          <!-- <% if (config.hasModule('finance-customers')) { %>•+ finance-customers -->
          <q-item v-ripple clickable to="/customers">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-user-crown" />
            </q-item-section>
            <q-item-section>Customers</q-item-section>
          </q-item>
          <!-- •- /finance-customers<% } else { %>•! finance-customers absent<% } %> -->

          <!-- <% if (config.hasModule('finance-suppliers')) { %>•+ finance-suppliers -->
          <q-item v-ripple clickable to="/suppliers">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-building" />
            </q-item-section>
            <q-item-section>Suppliers</q-item-section>
          </q-item>
          <!-- •- /finance-suppliers<% } else { %>•! finance-suppliers absent<% } %> -->

          <!-- <% if (config.hasModule('finance-finance-accounts')) { %>•+ finance-finance-accounts -->
          <q-item v-ripple clickable to="/finance-accounts">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-piggy-bank" />
            </q-item-section>
            <q-item-section>Finance Accounts</q-item-section>
          </q-item>
          <!-- •- /finance-finance-accounts<% } else { %>•! finance-finance-accounts absent<% } %> -->

          <q-separator />

          <q-item v-ripple clickable :href="portalUrl">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-solar-system" />
            </q-item-section>
            <q-item-section>Back to Portal</q-item-section>
          </q-item>

          <!-- <% if (config.hasModule('finance-help')) { %>•+ finance-help -->
          <q-item v-ripple clickable to="/help">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-question-circle" />
            </q-item-section>
            <q-item-section>Help</q-item-section>
          </q-item>
          <!-- •- /finance-help<% } else { %>•! finance-help absent<% } %> -->
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
