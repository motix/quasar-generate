<script setup lang="ts">
// Props

const { gravatarId = undefined, dark = false } = defineProps<{
  gravatarId?: string | undefined;
  dark?: boolean | undefined;
}>();
</script>

<template>
  <q-avatar size="56px">
    <q-img v-if="gravatarId" :src="`https://secure.gravatar.com/avatar/${gravatarId}?s=128`" />
    <q-icon v-else :color="dark ? 'white' : 'dark'" name="fas fa-user-alt" size="lg" />
  </q-avatar>
</template>

<style scoped>
.q-icon {
  opacity: 0.33;
}

.q-avatar :deep() img {
  width: 100%;
  height: 100%;
}
</style>
