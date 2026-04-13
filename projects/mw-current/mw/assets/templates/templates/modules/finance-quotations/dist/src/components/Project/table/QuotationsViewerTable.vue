<script setup lang="ts">
import useProjectViewPage_Quotations from 'composables/finance/project/useProjectViewPage_Quotations.js';

import StatusIcon from 'components/shared/document-status/StatusIcon.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  f,
  m,
  qmc,
} = useProjectViewPage_Quotations(props.scopeName);
</script>

<template>
  <q-expansion-item
    expand-icon-class="text-white"
    header-class="text-white text-h6 bg-accent"
    icon="fal fa-file-invoice"
    label="Quotations"
    popup
  >
    <q-card>
      <StickyHeaders dense markup-table separated target="#quotationsViewerTable" />

      <q-markup-table id="quotationsViewerTable" bordered dense>
        <thead>
          <tr>
            <th class="text-left">Code</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="quotation in m.quotations" :key="quotation.code">
            <!-- Code -->
            <td>
              <ObjectLink
                color="primary"
                :label="quotation.code"
                :to="`/quotations/${m.urlFriendlyName}/${quotation.code.replaceAll('.', '_')}`"
              >
                <template #icon>
                  <StatusIcon
                    class="q-mr-sm"
                    icon="fal fa-file-invoice"
                    :status="quotation.statusHelper"
                  />
                </template>
              </ObjectLink>
            </td>

            <!-- Total -->
            <td class="text-right">
              {{ f.currency(qmc.quotationTotal(quotation)) }}
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card>
  </q-expansion-item>
</template>
