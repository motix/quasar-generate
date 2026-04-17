import { computed, markRaw, watch } from 'vue';

import { object } from 'yup';

import { integerOptional, integerRequired, stringRequired } from 'utils/validation.js';

import useProjectViewPage from './useProjectViewPage.js';

type Props = {
  scopeName: string;
  itemIndex: number;
};

export default function useItemEditor(props: Readonly<Props>) {
  // Private

  const validationSchema = markRaw(
    object({
      title: stringRequired('Title').test({
        message: 'Title must be unique',
        test: (value) =>
          !value ||
          $p.vm.value.items.filter((item) => item.title.toLowerCase() === value.toLowerCase())
            .length === 1,
      }),
      quantity: integerRequired('Quantity').min(1),
      unitPrice: integerOptional('Unit Price').when({
        is: () => !item.value.isProductionOnly,
        then: () => integerRequired('Unit Price').min(0),
      }),
    }),
  );

  // Composables

  const $p = useProjectViewPage(props.scopeName);

  // Computed

  const item = computed(
    () =>
      $p.vm.value.items[props.itemIndex] ||
      (() => {
        throw new Error('[finance-projects] Index out of range');
      })(),
  );

  // Private Executions

  const { validate } = $p.useValidationForm(
    validationSchema,
    item.value,
    'title',
    'quantity',
    'unitPrice',
  );

  // Watch

  watch(
    computed(() => (item.value ? item.value.isProductionOnly : undefined)),
    (value) => {
      if (value) {
        item.value.unitPrice = '';
      }
    },
  );

  return {
    ...$p,
    item,
    validateDetailEditor: async () => (await validate()).valid,
  };
}
