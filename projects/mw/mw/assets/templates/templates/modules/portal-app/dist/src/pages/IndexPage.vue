<script setup lang="ts">
import { reactive, useTemplateRef } from 'vue';

import useConfig from 'composables/useConfig.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import TopTooltip from 'components/shared/TopTooltip.vue';

// Composables

const config = useConfig();

const { isAuthenticated, authenticatedUser, hasRole, setupRemoteSignInResponse, remoteNavigate } =
  useFirebaseAuth();

// Data

const loading = reactive({
  production: false,
  finance: false,
  hr: false,
  inventory: false,
  reports: false,
  admin: false,
});

const productionTooltipRef = useTemplateRef('productionTooltip');
const financeTooltipRef = useTemplateRef('financeTooltip');
const hrTooltipRef = useTemplateRef('hrTooltip');
const inventoryTooltipRef = useTemplateRef('inventoryTooltip');
const reportsTooltipRef = useTemplateRef('reportsTooltip');
const adminTooltipRef = useTemplateRef('adminTooltip');

// Private Executions

setupRemoteSignInResponse();

// Methods

async function navigate(site: keyof typeof loading) {
  loading[site] = true;
  await remoteNavigate(config[`${site}Url`] as string);
  loading[site] = false;
}
</script>

<template>
  <q-page class="row items-center justify-evenly">
    <div class="text-center">
      <div class="text-h2">Welcome to MotiWiki!</div>

      <FadeTransition>
        <div v-if="!isAuthenticated" class="q-mt-xl text-primary">
          Please
          <RouterLink :to="{ name: 'SignIn' }"> sign-in </RouterLink>
          to continue.
        </div>

        <div v-else class="q-mt-lg">
          <q-avatar size="56px">
            <q-img v-if="authenticatedUser.photoURL" :src="authenticatedUser.photoURL" />
            <q-icon v-else color="dark" name="fas fa-user-alt" size="lg" />
          </q-avatar>
          <div class="q-mt-md">
            {{ authenticatedUser.displayName }}
          </div>
          <div class="text-caption">
            {{ authenticatedUser.email }}
          </div>

          <div v-if="!hasRole('user')" class="q-mt-md">
            You have been successfully signed up to MotiWiki.<br />
            Please wait for an administrator to approve your profile.
          </div>

          <div v-else class="q-mt-md row justify-center q-gutter-lg">
            <q-btn
              v-if="hasRole('production') || hasRole('maintenance')"
              color="primary"
              :icon="loading.production ? undefined : 'fal fa-thunderstorm'"
              outline
              round
              size="28px"
              @click="
                (function () {
                  productionTooltipRef?.hide();
                  navigate('production');
                })()
              "
            >
              <q-spinner v-if="loading.production" color="primary" :thickness="3" />
              <TopTooltip ref="productionTooltip">Production</TopTooltip>
            </q-btn>
            <q-btn
              v-if="hasRole('finance')"
              color="primary"
              :icon="loading.finance ? undefined : 'fal fa-usd-circle'"
              outline
              round
              size="28px"
              @click="
                (function () {
                  financeTooltipRef?.hide();
                  navigate('finance');
                })()
              "
            >
              <q-spinner v-if="loading.finance" color="primary" :thickness="3" />
              <TopTooltip ref="financeTooltip">Finance</TopTooltip>
            </q-btn>
            <q-btn
              v-if="hasRole('hr')"
              color="primary"
              :icon="loading.hr ? undefined : 'fal fa-user-chart'"
              outline
              round
              size="28px"
              @click="
                (function () {
                  hrTooltipRef?.hide();
                  navigate('hr');
                })()
              "
            >
              <q-spinner v-if="loading.hr" color="primary" :thickness="3" />
              <TopTooltip ref="hrTooltip">HR</TopTooltip>
            </q-btn>
            <q-btn
              v-if="hasRole('inventory')"
              color="primary"
              :icon="loading.inventory ? undefined : 'fal fa-inventory'"
              outline
              round
              size="28px"
              @click="
                (function () {
                  inventoryTooltipRef?.hide();
                  navigate('inventory');
                })()
              "
            >
              <q-spinner v-if="loading.inventory" color="primary" :thickness="3" />
              <TopTooltip ref="inventoryTooltip">Inventory</TopTooltip>
            </q-btn>
            <q-btn
              v-if="hasRole('finance')"
              color="primary"
              :icon="loading.reports ? undefined : 'fal fa-chart-line'"
              outline
              round
              size="28px"
              @click="
                (function () {
                  reportsTooltipRef?.hide();
                  navigate('reports');
                })()
              "
            >
              <q-spinner v-if="loading.reports" color="primary" :thickness="3" />
              <TopTooltip ref="reportsTooltip">Reports</TopTooltip>
            </q-btn>
            <q-btn
              v-if="hasRole('maintenance')"
              color="primary"
              :icon="loading.admin ? undefined : 'fal fa-cog'"
              outline
              round
              size="28px"
              @click="
                (function () {
                  adminTooltipRef?.hide();
                  navigate('admin');
                })()
              "
            >
              <q-spinner v-if="loading.admin" color="primary" :thickness="3" />
              <TopTooltip ref="adminTooltip">Admin</TopTooltip>
            </q-btn>
          </div>
        </div>
      </FadeTransition>
    </div>
  </q-page>
</template>
