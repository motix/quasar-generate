import { markRaw } from 'vue';

import { object } from 'yup';

import { integerOptional, percentOptionalMinZeroMax } from 'utils/validation.js';

import useProjectViewPage from './useProjectViewPage.js';

type Props = { scopeName: string };

export default function useProjectAdditionEditor(props: Readonly<Props>) {
  // Private

  const validationSchema = markRaw(
    object({
      discount: integerOptional('Discount').min(1),
      vatPercent: percentOptionalMinZeroMax('VAT'),
      vatableAmount: integerOptional('VAT-able Amount')
        .min(1)
        .transform((value) => (!$p.f.isNumber($p.vm.value.vatPercent) ? null : value)),
    }),
  );

  // Composables

  const $p = useProjectViewPage(props.scopeName);

  // Private Executions

  const { validate } = $p.useValidationForm(
    validationSchema,
    $p.vm.value,
    'discount',
    'vatPercent',
    'vatableAmount',
  );

  $p.validateProjectAdditionEditor.value = async () => (await validate()).valid;

  return $p;
}
