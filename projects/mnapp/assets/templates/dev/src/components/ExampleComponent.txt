<template>
  <div>
    <p>{{ title }}</p>
    <ul>
      <li v-for="todo in todos" :key="todo.id" @click="increment">
        {{ todo.id }} - {{ todo.content }}
      </li>
    </ul>
    <p>
      Font Awesome Pro
      <q-icon name="fal fa-copy" size="1.2em" />
      <i class="fa-graphite fa-thin fa-arrow-up-from-bracket"></i>
    </p>
    <p>
      <code class="bg-primary">formats</code>
      {{ f.date(new Date()) }}
    </p>
    <p>
      <code class="bg-primary">useSelectDateRange</code>
      Year options: {{ yearOptions }} - Month options: {{ monthOptions }}
    </p>
    <p>
      <code class="bg-primary">utils</code>
      Normalization: {{ urlFriendlyNormalizeString('Hôm nay là thứ mấy') }}
    </p>
    <p>
      <code class="bg-primary">page-title</code>
      App name: {{ appName }} - Page title: {{ pageTitle }}
    </p>
    <p>
      <code class="bg-primary">shared-components</code>
      <ObjectLink icon="fal fa-moon" label="Link to the Moon" />
    </p>
    <p>Count: {{ todoCount }} / {{ meta.totalCount }}</p>
    <p>Active: {{ active ? 'yes' : 'no' }}</p>
    <p>Clicks on todos: {{ clickCount }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { urlFriendlyNormalizeString } from 'utils/normalization.js';

import useFormats from 'composables/useFormats';
import usePageTitle from 'composables/usePageTitle';
import useSelectDateRange from 'composables/useSelectDateRange';

import ObjectLink from 'components/shared/ObjectLink.vue';

import type { Meta, Todo } from './models';

const f = useFormats();
const { yearOptions, monthOptions } = useSelectDateRange();
const { appName, pageTitle } = usePageTitle();

interface Props {
  title: string;
  todos?: Todo[];
  meta: Meta;
  active: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  todos: () => [],
});

const clickCount = ref(0);
function increment() {
  clickCount.value += 1;
  return clickCount.value;
}

const todoCount = computed(() => props.todos.length);
</script>
