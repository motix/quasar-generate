<script setup lang="ts">
import { ref } from 'vue';

import { useForm } from 'vee-validate';
import { array, object } from 'yup';

import { integerOptional } from 'utils/validation.js';

import type {
  ProductionRoleSortableLite,
  ProductionSalaryDetailVm,
  ProductType,
} from 'models/production/index.js';

import type {
  QTableColumn,
  QTablePagination,
} from 'composables/crud-pages/useListPage/useTableView.js';
import useFormats from 'composables/useFormats.js';

// Private

const validationSchema = object({
  viewModels: array(
    object({
      productionSalaryDetails: array(
        object({
          productionSalary: integerOptional('Salary').min(0),
        }),
      ),
    }),
  ),
});

// Props

const props = defineProps<{
  viewModels: Required<ProductType<ProductionSalaryDetailVm>>[];
  productionRoles: ProductionRoleSortableLite[];
  columns: QTableColumn<Required<ProductType<ProductionSalaryDetailVm>>>[];
}>();

// Emit

defineEmits<{
  (e: 'dirty'): void;
}>();

// Composables

const f = useFormats();

type ValidationType = {
  viewModels: {
    productionSalaryDetails: {
      productionSalary: ProductionSalaryDetailVm['productionSalary'];
    }[];
  }[];
};

const { validate } = useForm<ValidationType>({
  validationSchema,
  initialValues: {
    viewModels: props.viewModels.map((viewModel) => ({
      productionSalaryDetails: viewModel.productionSalaryDetails.map((productionSalaryDetail) => ({
        productionSalary: productionSalaryDetail.productionSalary,
      })),
    })),
  },
});

// Data

const pagination = ref<QTablePagination>({ rowsPerPage: 0 });

// Expose

defineExpose({
  validate: async () => (await validate()).valid,
});
</script>

<template>
  <q-table
    v-model:pagination="pagination"
    :columns="columns"
    dense
    hide-bottom
    :rows="viewModels"
    wrap-cells
  >
    <template #body="slotProps">
      <q-tr :props="slotProps">
        <q-td key="name" :props="slotProps">
          {{ slotProps.row.name }}
        </q-td>
        <q-td
          v-for="(role, index) in productionRoles"
          :key="role.id"
          :props="slotProps"
          style="min-width: 120px"
        >
          <ThousandInputVal
            v-model="slotProps.row.productionSalaryDetails[index].productionSalary"
            clearable
            dense
            :hint="
              f.currency(slotProps.row.productionSalaryDetails[index].productionSalary) || undefined
            "
            input-class="text-right"
            :name="`viewModels[${slotProps.rowIndex}].productionSalaryDetails[${index}].productionSalary`"
            @update:model-value="$emit('dirty')"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
