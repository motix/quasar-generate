import { markRaw } from 'vue';

import { object } from 'yup';

import { asIsRequired, integerRequired, stringRequired } from 'utils/validation.js';

import type { ProductTypeLite } from 'models/production/index.js';

import useItemEditor from './useItemEditor.js';

type Props = {
  scopeName: string;
  itemIndex: number;
};

export default function useItemEditorMain(props: Readonly<Props>) {
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
      productType: asIsRequired<ProductTypeLite>('Product Type'),
    }),
  );

  // Composables

  const $p = useItemEditor(props);

  // Private Executions

  const { validate } = $p.useValidationForm(
    validationSchema,
    $p.item.value,
    'title',
    'quantity',
    'productType',
  );

  return {
    ...$p,
    validateItemEditorMain: async () => (await validate()).valid,
  };
}
