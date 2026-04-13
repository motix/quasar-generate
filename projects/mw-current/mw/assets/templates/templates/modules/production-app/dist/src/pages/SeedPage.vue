<script setup lang="ts">
// sort-imports-ignore

// <% if (config.hasModule('production-production-roles')) { %>•+ production-production-roles
import { seedProductionRoles } from 'services/seed/seedProductionRoles.js';
// •- /production-production-roles<% } else { %>•! production-production-roles absent<% } %>

// <% if (config.hasModule('production-product-types')) { %>•+ production-product-types
import { seedProductTypes } from 'services/seed/seedProductTypes.js';
// •- /production-product-types<% } else { %>•! production-product-types absent<% } %>

// <% if (config.hasModule('production-projects')) { %>•+ production-projects
import { seedProjects } from 'services/seed/seedProjects.js';
// •- /production-projects<% } else { %>•! production-projects absent<% } %>
</script>

<template>
  <QPagePadding class="row items-center justify-evenly">
    <!-- <% if (config.hasModule('production-production-roles')) { %>•+ production-production-roles -->
    <q-btn color="primary" @click="seedProductionRoles(true)">
      Seed Production Roles Name as ID
    </q-btn>
    <q-btn color="primary" @click="seedProductionRoles(false)"> Seed Production Roles </q-btn>
    <br />
    <!-- •- /production-production-roles<% } else { %>•! production-production-roles absent<% } %> -->

    <!-- <% if (config.hasModule('production-product-types')) { %>•+ production-product-types -->
    <q-btn color="primary" @click="seedProductTypes(true)"> Seed Product Types Name as ID </q-btn>
    <q-btn color="primary" @click="seedProductTypes(false)"> Seed Product Types </q-btn>
    <br />
    <!-- •- /production-product-types<% } else { %>•! production-product-types absent<% } %> -->

    <!-- <% if (config.hasModule('production-projects')) { %>•+ production-projects -->
    <q-btn color="primary" @click="seedProjects()"> Seed Projects </q-btn>
    <!-- •- /production-projects<% } else { %>•! production-projects absent<% } %> -->
  </QPagePadding>
</template>
