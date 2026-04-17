<script setup lang="ts">
import { ref } from 'vue';

import useFloatToolbar from 'composables/useFloatToolbar.js';

// Composables

const { headerElevated, onScroll, onReveal } = useFloatToolbar(50, 50);

const leftDrawerOpen = ref(false);

// Methods

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<template>
  <q-layout view="lHh Lpr lFf" @scroll="onScroll">
    <q-header :elevated="headerElevated" reveal @reveal="onReveal">
      <q-toolbar>
        <q-btn aria-label="Menu" dense flat icon="menu" round @click="toggleLeftDrawer" />

        <q-toolbar-title> mnapp Dev - elevated: {{ headerElevated }} </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <RouterView />
    </q-page-container>
  </q-layout>
</template>
