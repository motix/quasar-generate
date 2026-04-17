<script setup lang="ts">
import type DocumentStatusBase from 'utils/DocumentStatusBase.js';

const { freezed = false, revertColor = false } = defineProps<{
  status: DocumentStatusBase<unknown, string, string, string>;
  freezed?: boolean | undefined;
  revertColor?: boolean | undefined;
}>();

defineEmits<{
  changeStatus: [action: string];
}>();
</script>

<template>
  <q-btn-dropdown
    :color="revertColor ? status.textColor : status.backgroundColor"
    :disable="freezed"
    no-wrap
    padding="xs"
    size="sm"
    :text-color="revertColor ? status.backgroundColor : status.textColor"
  >
    <template #label>
      <q-spinner v-if="freezed" class="q-mr-xs" />
      <q-icon v-else class="q-mr-xs" name="fal fa-thermometer-half" />
      <span class="text-weight-bold">{{ status.text }}</span>
    </template>

    <q-list>
      <q-item
        v-for="button in status.buttons"
        :key="button.label"
        v-close-popup
        clickable
        @click="$emit('changeStatus', button.action)"
      >
        <q-item-section avatar>
          <q-avatar :color="button.color" :icon="button.icon" text-color="white" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ button.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>
