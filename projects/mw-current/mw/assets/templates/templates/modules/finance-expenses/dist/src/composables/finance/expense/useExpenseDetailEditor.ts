import { computed, markRaw } from 'vue';

import { object } from 'yup';

import { integerRequired, stringRequired } from 'utils/validation.js';

import { useExpenseViewPage } from 'composables/finance/expense/useExpenseEditPage.js';

type Props = {
  scopeName: string;
  detailIndex: number;
};

export default function useExpenseDetailEditor(props: Readonly<Props>) {
  // Private

  const validationSchema = markRaw(
    object({
      content: stringRequired('Content').test({
        message: 'Content must be unique',
        test: (value) =>
          !value ||
          $p.vm.value.details.filter(
            (detail) => detail.content.toLowerCase() === value.toLowerCase(),
          ).length === 1,
      }),
      quantity: integerRequired('Quantity').min(1),
      unitPrice: integerRequired('Unit Price').min(0),
    }),
  );

  // Composables

  const $p = useExpenseViewPage(props.scopeName);

  // Computed

  const detail = computed(
    () =>
      $p.vm.value.details[props.detailIndex] ||
      (() => {
        throw new Error('[finance-expense] Index out of range');
      })(),
  );

  // Private Executions

  const { validate } = $p.useValidationForm(
    validationSchema,
    detail.value,
    'content',
    'quantity',
    'unitPrice',
  );

  return {
    ...$p,
    detail,
    validateExpenseDetailEditor: async () => (await validate()).valid,
  };
}
