<script setup lang="ts">
import { Dialog } from 'quasar';

import type { FinanceAccount, FinanceAccountVm } from 'models/finance/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import useFormats from 'composables/useFormats.js';

import NewBalanceRecord from 'components/FinanceAccount/NewBalanceRecord.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const f = useFormats();

const { hasRole } = useFirebaseAuth();

const $p = useViewPage<FinanceAccount, FinanceAccountVm>(props.scopeName);
const {
  // Auto sort
  freezed,
  m,
} = $p;

// Methods

function deleteBalanceRecord(index: number) {
  Dialog.create({
    title: 'Delete',
    message: 'Are you sure want to delete the information?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    $p.m.value.balanceRecords.splice(index, 1);
    void $p.viewerSave();
  });
}
</script>

<template>
  <ExpandableCard
    avatar-icon="fal fa-piggy-bank"
    :caption="m.description"
    class="q-mx-auto"
    header-background-color="primary"
    header-dark
    :title="m.name"
  >
    <template #side>
      <q-toggle
        v-model="m.isActive"
        checked-icon="fal fa-power-off"
        class="right-toggle"
        color="white"
        :disable="freezed"
        icon-color="primary"
        label="Active"
        left-label
        unchecked-icon="clear"
      />
    </template>

    <template #bezel-less>
      <q-markup-table bordered separator="cell">
        <thead>
          <tr>
            <th>Date</th>
            <th>Balance (End Day)</th>
            <th class="q-table--col-auto-width"></th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(balanceRecord, index) in m.balanceRecords"
            :key="balanceRecord.date.valueOf()"
          >
            <!-- Date -->
            <td class="text-center">
              {{ f.date(balanceRecord.date) }}
            </td>

            <!-- Balance -->
            <td class="text-right">
              {{ f.currency(balanceRecord.balance) }}
            </td>

            <!-- Buttons -->
            <td>
              <q-btn
                v-if="hasRole('manager')"
                color="negative"
                :disable="freezed"
                icon="fal fa-trash-alt"
                :loading="freezed"
                outline
                padding="sm"
                @click="deleteBalanceRecord(index)"
              >
                <TopTooltip>Delete Balance Record</TopTooltip>
              </q-btn>
            </td>
          </tr>

          <NewBalanceRecord :scope-name="scopeName" />
        </tbody>
      </q-markup-table>
    </template>
  </ExpandableCard>
</template>
