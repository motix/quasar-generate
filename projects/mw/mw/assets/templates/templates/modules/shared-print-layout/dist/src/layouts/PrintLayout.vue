<script setup lang="ts">
import { Dark } from 'quasar';

import usePageTitle from 'composables/usePageTitle.js';

// Composables

const { pageTitle } = usePageTitle();

// Private Executions

Dark.set(false);
</script>

<template>
  <div class="q-pa-md container">
    <div class="row justify-between items-center">
      <div style="width: 200px">
        <q-img src="/motix-logo-negative.png" style="max-width: 200px; height: 46px"> </q-img>
      </div>
      <h3 class="q-ma-none text-weight-light">
        {{ pageTitle }}
      </h3>
    </div>

    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.meta.mainTransitionKey" />
    </RouterView>
  </div>
</template>

<style lang="scss">
.container {
  width: 100%;
  margin-right: auto;
  margin-left: auto;
}

@media (min-width: 960px) {
  .container {
    max-width: 992px;
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: 1232px;
  }
}

// Hover effect on rows makes text disappeared when printing
.q-table {
  pointer-events: none;
}

.q-markup-table,
.q-btn {
  box-shadow: none !important;
}

@media print {
  body {
    font-size: 0.65rem;
    line-height: 1.2;
  }

  .q-btn {
    border: solid 1px $table-border-color;
    font-size: 6px !important;
    padding: 2px !important;
  }

  .q-banner {
    border: solid 1px $table-border-color;
  }

  .text-caption {
    font-size: 0.48rem;
  }

  .text-tiny {
    font-size: 8px !important;
  }

  .q-list {
    max-width: 300px;
  }

  .q-item {
    min-height: 23px;
  }

  .q-table thead tr,
  .q-table tbody td {
    height: 23px;
  }

  .q-table th,
  .q-table td {
    padding: 2px 4px;
  }

  tr,
  th,
  td,
  .no-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .page-break {
    break-before: always;
    page-break-before: always;
  }
}
</style>
