<script setup lang="ts">
import { ref } from 'vue';

import { runServerFunction } from 'services/admin/runServerFunction.js';

const freezed = ref(false);
const result = ref('');

async function run() {
  freezed.value = true;

  result.value = '';
  result.value = await runServerFunction();

  freezed.value = false;
}
</script>

<template>
  <QPagePadding class="row items-center justify-evenly">
    <q-btn color="primary" :disable="freezed" :loading="freezed" @click="run()"
      >Run Server Function</q-btn
    >

    <div class="flex-break"></div>

    <div>
      {{ result }}
    </div>
  </QPagePadding>
</template>
