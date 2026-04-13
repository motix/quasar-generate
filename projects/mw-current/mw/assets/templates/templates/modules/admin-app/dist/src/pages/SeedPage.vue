<script setup lang="ts">
// sort-imports-ignore

// <% if (config.hasModule('admin-membership')) { %>•+ admin-membership
import { seedMembers } from 'services/seed/seedMembers.js';
// •- /admin-membership<% } else { %>•! admin-membership absent<% } %>
</script>

<template>
  <QPagePadding class="row items-center justify-evenly">
    <!-- <% if (config.hasModule('admin-membership')) { %>•+ admin-membership -->
    <q-btn color="primary" @click="seedMembers()">Seed Members</q-btn>
    <!-- •- /admin-membership<% } else { %>•! admin-membership absent<% } %> -->
  </QPagePadding>
</template>
