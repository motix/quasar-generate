import type { Ref } from 'vue';
import { markRaw, ref } from 'vue';

import { acceptHMRUpdate, defineStore } from 'pinia';

import type { ScopeRecord } from 'models/single-scope-composable/index.js';

export const useSingleScopeComposableStore = defineStore('SingleScopeComposable', () => {
  // Private

  const scopes: Ref<Record<string, ScopeRecord<unknown>>> = ref({});

  // Actions

  function hasScope(name: string) {
    return Object.keys(scopes.value).includes(name);
  }

  function setScope<T extends object>(name: string, scope: T) {
    hasScope(name) &&
      (() => {
        throw new Error(`[mnapp-single-scope-composable] Scope ${name} already exists`);
      })();

    const record: ScopeRecord<T> = {
      scope: markRaw(scope),
      useCount: 0,
    };

    scopes.value[name] = record;
  }

  function increaseScopeUseCount(name: string) {
    !hasScope(name) &&
      (() => {
        throw new Error(`[mnapp-single-scope-composable] Scope ${name} unavailable`);
      })();
    scopes.value[name]!.useCount++;
  }

  function decreaseScopeUseCount(name: string) {
    !hasScope(name) &&
      (() => {
        throw new Error(`[mnapp-single-scope-composable] Scope ${name} unavailable`);
      })();
    scopes.value[name]!.useCount--;
    scopes.value[name]!.useCount === 0 && delete scopes.value[name];
  }

  function retrieveScope<T>(name: string) {
    !hasScope(name) &&
      (() => {
        throw new Error(`[mnapp-single-scope-composable] Scope ${name} unavailable`);
      })();
    return (scopes.value[name] as ScopeRecord<T>).scope;
  }

  return {
    scopes,
    hasScope,
    setScope,
    increaseScopeUseCount,
    decreaseScopeUseCount,
    retrieveScope,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSingleScopeComposableStore, import.meta.hot));
}
