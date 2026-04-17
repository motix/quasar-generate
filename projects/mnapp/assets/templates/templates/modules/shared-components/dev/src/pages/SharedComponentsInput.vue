<script setup lang="ts">
import type { Ref } from 'vue';
import { markRaw, ref } from 'vue';

import type { QSelectProps } from 'quasar';

import { useForm } from 'vee-validate';
import type { Schema } from 'yup';
import { array, object } from 'yup';

import {
  asIsRequired,
  dateRequired,
  numberRequired,
  percentRequiredMinZeroMax,
  stringRequired,
} from 'utils/validation.js';

import currency from 'composables/formats/currency.js';

import { toTypedSchema } from '@vee-validate/yup';

// Private

interface Customer {
  id: string;
  name: string;
}

const customers: Customer[] = [
  {
    id: 'comp1',
    name: 'Comp 1',
  },
  {
    id: 'comp2',
    name: 'Comp 2',
  },
];

const validationSchema = markRaw(
  toTypedSchema<Schema<ProjectVm>>(
    object({
      name: stringRequired('Name').test({
        message: 'Name is already taken',
        test: (value) => !value || value.toLowerCase() != 'the preserved name',
      }),
      customerContact: stringRequired('Customer Contact'),
      startDate: dateRequired('Start Date'),
      finishDate: dateRequired('Finish Date'),
      satisfactionRate: percentRequiredMinZeroMax('Satisfaction Rate'),
      cost: numberRequired('Cost'),
      milestones: array().of(stringRequired('Milestone')).required().label('Milestones'),
      customer: asIsRequired<Customer>('Customer'),
    }),
  ),
);

// Data

interface ProjectVm {
  name: string;
  customerContact: string;
  startDate: string;
  finishDate: string;
  satisfactionRate: number;
  cost?: number;
  milestones: string[];
  customer?: Customer;
}

const tiValue = ref(5000);
const vm = ref<ProjectVm>({
  name: 'The name',
  customerContact: '',
  startDate: '',
  finishDate: '',
  satisfactionRate: 1,
  milestones: [],
});

const customerOptions: Ref<Customer[]> = ref([]);

// Private Executions

useForm<ProjectVm>({ validationSchema, initialValues: vm.value });

// Methods

function filterCustomerOptions(
  ...[inputValue, doneFn]: Parameters<Required<QSelectProps>['onFilter']>
) {
  function buildOptions(filteredCustomers: Customer[]) {
    return filteredCustomers.map<Customer>((value) => ({
      id: value.id,
      name: value.name,
    }));
  }

  if (inputValue === '') {
    doneFn(() => {
      customerOptions.value = buildOptions(customers);
    });

    return;
  }

  doneFn(() => {
    const search = inputValue.toLowerCase();
    customerOptions.value = buildOptions(
      customers.filter((value) => value.name.toLowerCase().includes(search)),
    );
  });
}
</script>

<template>
  <q-page padding>
    <div class="text-h3">Shared Components Inputs</div>

    <h5>View Model</h5>
    <div>
      {{ vm }}
    </div>
    <div>
      <q-btn
        @click="
          (function () {
            vm.name = `New name ${new Date().valueOf()}`;
          })()
        "
        >Change props</q-btn
      >
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-2">
        <h5>QInputVal</h5>
        <div>
          <QInputVal v-model="vm.name" label="Name" name="name" />
        </div>
      </div>

      <div class="col-2">
        <h5>QInputVal</h5>
        <div>
          <QInputVal v-model="vm.customerContact" label="Customer Contact" name="customerContact" />
        </div>
      </div>

      <div class="col-2">
        <h5>QSelectVal</h5>
        <div>
          <QSelectVal
            v-model="vm.customer"
            clearable
            fill-input
            hide-selected
            label="Customer"
            name="customer"
            option-label="name"
            option-value="id"
            :options="customerOptions"
            use-input
            @filter="filterCustomerOptions"
          />
        </div>
      </div>

      <div class="col-2">
        <h5>QDateInputVal</h5>
        <div>
          <QDateInputVal v-model="vm.startDate" label="Start Date" name="startDate" />
        </div>
      </div>

      <div class="col-2">
        <h5>ThousandInputVal</h5>
        <div>
          <ThousandInputVal
            v-model="vm.cost"
            :hint="currency(vm.cost) || undefined"
            input-class="text-right"
            label="Cost"
            name="cost"
          />
        </div>
      </div>

      <div class="col-2">
        <h5>PercentInputVal</h5>
        <div>
          <PercentInputVal
            v-model="vm.satisfactionRate"
            input-class="text-right"
            label="Satisfaction Rate"
            name="satisfactionRate"
          />
        </div>
      </div>

      <div class="col-4">
        <h5>QDateVal</h5>
        <div>
          <QDateVal v-model="vm.startDate" label="Start Date" name="startDate" />
        </div>
      </div>

      <div class="col-4">
        <h5>DateArrayFieldVal</h5>
        <div>
          <DateArrayFieldVal v-model="vm.milestones" label="Milestones" name="milestones" />
        </div>
      </div>

      <div class="col-2">
        <h5>ThousandInput</h5>
        <div>
          <ThousandInput
            v-model="tiValue"
            :hint="currency(tiValue) || undefined"
            input-class="text-right"
          />
        </div>
      </div>

      <div class="col-2">
        <h5>PercentInput</h5>
        <div>
          <PercentInput
            v-model="vm.satisfactionRate"
            input-class="text-right"
            label="Satisfaction Rate"
            suffix="%"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>
