<script setup lang="ts">
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

// Private Executions

useFirebaseAuth().setupRemoteSignIn();
</script>

<template>
  <q-page class="row items-center justify-evenly">
    <q-spinner-pie color="primary" size="6em" />
  </q-page>
</template>
