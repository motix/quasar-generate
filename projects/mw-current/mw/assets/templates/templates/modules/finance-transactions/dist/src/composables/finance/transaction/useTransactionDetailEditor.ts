import { computed, markRaw } from 'vue';

import { object } from 'yup';

import { integerRequired, stringRequired } from 'utils/validation.js';

import { useTransactionViewPage } from 'composables/finance/transaction/useTransactionEditPage.js';

type Props = {
  scopeName: string;
  detailIndex: number;
};

export default function useTransactionDetailEditor(props: Readonly<Props>) {
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

  const $p = useTransactionViewPage(props.scopeName);

  // Computed

  const detail = computed(
    () =>
      $p.vm.value.details[props.detailIndex] ||
      (() => {
        throw new Error('[finance-transactions] Index out of range');
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
    validateTransactionDetailEditor: async () => (await validate()).valid,
  };
}
