<script setup lang="ts">
import useFloatToolbar from 'composables/useFloatToolbar.js';
import usePageTitle from 'composables/usePageTitle.js';
import useStickyHeaders from 'composables/useStickyHeaders.js';

// Composables

const { appName, pageTitle } = usePageTitle();

const {
  headerElevated,
  onScroll: floatToolbarOnScroll,
  onReveal: floatToolbarOnReveal,
} = useFloatToolbar(50, 50);

const { onReveal: stickyHeadersOnReveal } = useStickyHeaders(50);
</script>

<template>
  <q-layout view="lHh Lpr lFf" @scroll="floatToolbarOnScroll">
    <q-header
      :elevated="headerElevated"
      reveal
      @reveal="
        (function () {
          floatToolbarOnReveal($event);
          stickyHeadersOnReveal($event);
        })()
      "
    >
      <q-toolbar>
        <q-btn aria-label="Menu" dense flat icon="menu" round />

        <q-toolbar-title> {{ pageTitle }} </q-toolbar-title>

        <div>{{ appName }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <RouterView />
    </q-page-container>
  </q-layout>
</template>
