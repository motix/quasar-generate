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

const leftDrawerShow = computed(() => leftDrawerOpen.value && hasRole('finance'));

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
          <!-- <% if (config.hasModule('reports-projects')) { %>•+ reports-projects -->
          <q-item
            v-if="hasRole('manager')"
            v-ripple
            clickable
            to="/projects/monthly-profit-ratio-reports"
          >
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-briefcase" />
            </q-item-section>
            <q-item-section>Projects Production Ratio Reports</q-item-section>
          </q-item>

          <q-item v-ripple clickable to="/projects/monthly-reports">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-briefcase" />
            </q-item-section>
            <q-item-section>Projects Monthly Reports</q-item-section>
          </q-item>

          <q-item v-ripple clickable to="/projects/yearly-reports">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-briefcase" />
            </q-item-section>
            <q-item-section>Projects Yearly Reports</q-item-section>
          </q-item>

          <q-item v-ripple clickable to="/projects/all-years-report">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-briefcase" />
            </q-item-section>
            <q-item-section>Projects All Years Report</q-item-section>
          </q-item>
          <!-- •- /reports-projects<% } else { %>•! reports-projects absent<% } %> -->

          <!-- <% if (config.hasModule('reports-invoices')) { %>•+ reports-invoices -->
          <q-item v-ripple clickable to="/invoices">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-file-invoice-dollar" />
            </q-item-section>
            <q-item-section>Invoices Report</q-item-section>
          </q-item>
          <!-- •- /reports-invoices<% } else { %>•! reports-invoices absent<% } %> -->

          <!-- <% if (config.hasModule('reports-expenses')) { %>•+ reports-expenses -->
          <q-item v-ripple clickable to="/expenses">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-receipt" />
            </q-item-section>
            <q-item-section>Expenses Report</q-item-section>
          </q-item>
          <!-- •- /reports-expenses<% } else { %>•! reports-expenses absent<% } %> -->

          <!-- <% if (config.hasModule('reports-finance-details')) { %>•+ reports-finance-details -->
          <q-item v-ripple clickable to="/finance-details/monthly-reports">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-usd-circle" />
            </q-item-section>
            <q-item-section>Finance Details Monthly Reports</q-item-section>
          </q-item>

          <q-item v-ripple clickable to="/finance-details/yearly-reports">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-usd-circle" />
            </q-item-section>
            <q-item-section>Finance Details Yearly Reports</q-item-section>
          </q-item>

          <q-item v-ripple clickable to="/finance-details/all-years-report">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-usd-circle" />
            </q-item-section>
            <q-item-section>Finance Details All Years Report</q-item-section>
          </q-item>
          <!-- •- /reports-finance-details<% } else { %>•! reports-finance-details absent<% } %> -->

          <!-- <% if (config.hasModule('reports-receivable')) { %>•+ reports-receivable -->
          <q-item v-ripple clickable to="/receivable">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-usd-circle" />
            </q-item-section>
            <q-item-section>Receivable Report</q-item-section>
          </q-item>
          <!-- •- /reports-receivable<% } else { %>•! reports-receivable absent<% } %> -->

          <!-- <% if (config.hasModule('reports-payable')) { %>•+ reports-payable -->
          <q-item v-ripple clickable to="/payable">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-usd-circle" />
            </q-item-section>
            <q-item-section>Payable Report</q-item-section>
          </q-item>
          <!-- •- /reports-payable<% } else { %>•! reports-payable absent<% } %> -->

          <!-- <% if (config.hasModule('reports-sales-vat-invoices')) { %>•+ reports-sales-vat-invoices -->
          <q-item v-ripple clickable to="/sales-vat-invoices">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-file-invoice-dollar" />
            </q-item-section>
            <q-item-section>Sales VAT Invoices Reports</q-item-section>
          </q-item>
          <!-- •- /reports-sales-vat-invoices<% } else { %>•! reports-sales-vat-invoices absent<% } %> -->

          <!-- <% if (config.hasModule('reports-customers')) { %>•+ reports-customers -->
          <q-item v-ripple clickable to="/customers">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-user-crown" />
            </q-item-section>
            <q-item-section>Customers Reports</q-item-section>
          </q-item>
          <!-- •- /reports-customers<% } else { %>•! reports-customers absent<% } %> -->

          <!-- <% if (config.hasModule('reports-suppliers')) { %>•+ reports-suppliers -->
          <q-item v-ripple clickable to="/suppliers">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-building" />
            </q-item-section>
            <q-item-section>Suppliers Reports</q-item-section>
          </q-item>
          <!-- •- /reports-suppliers<% } else { %>•! reports-suppliers absent<% } %> -->

          <!-- <% if (config.hasModule('reports-finance-accounts')) { %>•+ reports-finance-accounts -->
          <q-item v-ripple clickable to="/finance-accounts">
            <q-item-section avatar>
              <q-icon color="primary" name="fal fa-piggy-bank" />
            </q-item-section>
            <q-item-section>Finance Accounts Reports</q-item-section>
          </q-item>
          <!-- •- /reports-finance-accounts<% } else { %>•! reports-finance-accounts absent<% } %> -->

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
