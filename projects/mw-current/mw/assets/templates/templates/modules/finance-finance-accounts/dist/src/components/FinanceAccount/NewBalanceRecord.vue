<script setup lang="ts">
import { markRaw, ref } from 'vue';

import { date as qdate } from 'quasar';

import { sortBy } from 'lodash-es';
import { object } from 'yup';

import { dateRequired, numberRequired } from 'utils/validation.js';

import type { BalanceRecord, FinanceAccount, FinanceAccountVm } from 'models/finance/index.js';

import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';
import useNotifications from 'composables/useNotifications.js';

// Private

const validationSchema = markRaw(
  object({
    date: dateRequired('Date').test({
      message: 'Date must be unique',
      test: (value) =>
        !value ||
        !$p.m.value.balanceRecords.some(
          (balanceRecord) => qdate.formatDate(balanceRecord.date, editDateFormat) === value,
        ),
    }),
    balance: numberRequired('Balance'),
  }),
);

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { editDateFormat } = requiredConfigEntries('editDateFormat');

const f = useFormats();

const { notifyValidationError } = useNotifications();

const $p = useViewPage<FinanceAccount, FinanceAccountVm>(props.scopeName);
const {
  // Auto sort
  freezed,
} = $p;

// Data

const date = ref(qdate.formatDate(new Date(), editDateFormat));
const balance = ref(0);

// Private Executions

const { validate, resetForm } = $p.useValidationForm(
  validationSchema,
  {
    date: date.value,
    balance: balance.value,
  },
  'date',
  'balance',
);

// Methods

async function addBalanceRecord() {
  const isValid = (await validate()).valid;

  if (!isValid) {
    notifyValidationError();

    return;
  }

  $p.freezed.value = true;

  const balanceRecord: BalanceRecord = {
    date: qdate.extractDate(date.value, editDateFormat),
    balance: balance.value,
  };

  $p.m.value.balanceRecords = sortBy([...$p.m.value.balanceRecords, balanceRecord], (value) =>
    value.date.valueOf(),
  );

  void $p.viewerSave(() => {
    balance.value = 0;

    resetForm({
      values: { date: date.value, balance: 0 },
    });
  });
}
</script>

<template>
  <tr>
    <!-- Date -->
    <td class="vertical-top">
      <QDateInputVal v-model="date" dense hide-bottom-space name="date" placeholder="Date" />
    </td>

    <!-- Balance -->
    <td class="vertical-top">
      <QInputVal
        v-model.number="balance"
        dense
        hide-bottom-space
        :hint="f.currency(balance) || undefined"
        input-class="text-right"
        name="balance"
        placeholder="Balance"
      />
    </td>

    <!-- Buttons -->
    <td class="vertical-top">
      <q-btn
        color="primary"
        :disable="freezed"
        icon="fal fa-plus"
        :loading="freezed"
        outline
        padding="sm"
        @click="() => addBalanceRecord()"
      >
        <TopTooltip>Add Balance Record</TopTooltip>
      </q-btn>
    </td>
  </tr>
</template>
