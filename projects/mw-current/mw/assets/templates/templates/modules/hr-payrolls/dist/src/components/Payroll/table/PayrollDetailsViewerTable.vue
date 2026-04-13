<script setup lang="ts">
import { computed } from 'vue';

import type { Payroll, PayrollVm } from 'models/hr/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFormats from 'composables/useFormats.js';

import StickyHeaders from 'components/shared/StickyHeaders.vue';

import PayrollDetailsViewerInnerTable from './PayrollDetailsViewerInnerTable.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const f = useFormats();

const $p = useViewPage<Payroll, PayrollVm>(props.scopeName);

// Computed

const payrollTitle = computed(() => `Payroll ${f.yearMonth($p.m.value.year, $p.m.value.month)}`);
</script>

<template>
  <q-list class="rounded-list">
    <q-expansion-item
      default-opened
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      icon="fal fa-list-ol"
      :label="payrollTitle"
      popup
    >
      <q-card>
        <StickyHeaders markup-table separated target="#viewerTable" />

        <PayrollDetailsViewerInnerTable :scope-name="scopeName" />
      </q-card>
    </q-expansion-item>
  </q-list>
</template>
