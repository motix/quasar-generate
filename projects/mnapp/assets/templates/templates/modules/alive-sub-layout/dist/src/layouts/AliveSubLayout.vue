<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Data

// Transition 'out-in' mode, KeepAlive and an outer transition don't live well together.
// This hack unloads any cached component before the transition.
// The div is required as the transition element for the whole component.
const isAlive = ref(true);

// Lifecycle Hooks

onBeforeUnmount(() => {
  isAlive.value = false;
});
</script>

<template>
  <RouterView v-slot="{ Component }">
    <div>
      <FadeTransition>
        <KeepAlive :include="isAlive ? 'AliveIndex' : '_'">
          <component
            :is="Component"
            :key="
              route.meta.subTransitionKeyName
                ? route.params[route.meta.subTransitionKeyName]
                : undefined
            "
          />
        </KeepAlive>
      </FadeTransition>
    </div>
  </RouterView>
</template>
