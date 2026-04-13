import { markRaw } from 'vue';

import { object } from 'yup';

import { integerOptional, percentOptionalMinZeroMax } from 'utils/validation.js';

import { useExpenseViewPage } from 'composables/finance/expense/useExpenseEditPage.js';

type Props = { scopeName: string };

export default function useExpenseAdditionEditor(props: Readonly<Props>) {
  // Private

  const validationSchema = markRaw(
    object({
      discount: integerOptional('Discount').min(1),
      vatPercent: percentOptionalMinZeroMax('VAT'),
      vatableAmount: integerOptional('VAT-able Amount')
        .min(1)
        .transform((value) => (!$p.f.isNumber($p.vm.value.vatPercent) ? null : value)),
      secondVatPercent: percentOptionalMinZeroMax('Second VAT').transform((value) =>
        !$p.f.isNumber($p.vm.value.vatPercent) ? null : value,
      ),
      secondVatableAmount: integerOptional('Second VAT-able Amount')
        .min(1)
        .transform((value) => (!$p.f.isNumber($p.vm.value.vatPercent) ? null : value)),
      vatAdjustment: integerOptional('VAT Adjustment')
        .test({
          message: 'VAT Adjustment cannot be zero',
          test: (value) => value === null || value !== 0,
        })
        .transform((value) => (!$p.f.isNumber($p.vm.value.vatPercent) ? null : value)),
    }),
  );

  // Composables

  const $p = useExpenseViewPage(props.scopeName);

  // Private Executions

  const { validate } = $p.useValidationForm(
    validationSchema,
    $p.vm.value,
    'discount',
    'vatPercent',
    'vatableAmount',
    'secondVatPercent',
    'secondVatableAmount',
  );

  $p.validateExpenseAdditionEditor.value = async () => (await validate()).valid;

  return $p;
}
