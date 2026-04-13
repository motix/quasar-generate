<script setup lang="ts">
// sort-imports-ignore

// <% if (config.hasModule('hr-payrolls')) { %>•+ hr-payrolls
import { seedPayrolls } from 'services/seed/seedPayrolls.js';
// •- /hr-payrolls<% } else { %>•! hr-payrolls absent<% } %>
</script>

<template>
  <QPagePadding class="row items-center justify-evenly">
    <!-- <% if (config.hasModule('hr-payrolls')) { %>•+ hr-payrolls -->
    <q-btn color="primary" @click="seedPayrolls()">Seed Payrolls</q-btn>
    <!-- •- /hr-payrolls<% } else { %>•! hr-payrolls absent<% } %> -->
  </QPagePadding>
</template>
