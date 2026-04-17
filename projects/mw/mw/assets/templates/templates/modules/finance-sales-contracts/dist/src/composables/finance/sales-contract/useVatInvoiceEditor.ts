import { computed, markRaw } from 'vue';

import { object } from 'yup';

import {
  dateRequired,
  integerOptional,
  integerRequired,
  percentOptionalMinZeroMax,
  stringRequired,
} from 'utils/validation.js';

import { useSalesContractViewPage } from 'composables/finance/sales-contract/useSalesContractEditPage.js';

type Props = {
  scopeName: string;
  vatInvoiceIndex: number;
};

export default function useVatInvoiceEditor(props: Readonly<Props>) {
  // Private

  const validationSchema = markRaw(
    object({
      code: stringRequired('Code').test({
        message: 'Code must be unique',
        test: (value) =>
          !value ||
          $p.vm.value.vatInvoices.filter(
            (vatInvoice) => vatInvoice.code.toLowerCase() === value.toLowerCase(),
          ).length === 1,
      }),
      issueDate: dateRequired('Issue Date'),
      content: stringRequired('Content').test({
        message: 'Content must be unique',
        test: (value) =>
          !value ||
          $p.vm.value.vatInvoices.filter(
            (vatInvoice) => vatInvoice.content.toLowerCase() === value.toLowerCase(),
          ).length === 1,
      }),
      subTotal: integerRequired('Subtotal'),
      vatPercent: percentOptionalMinZeroMax('VAT'),
      vatAdjustment: integerOptional('VAT Adjustment')
        .test({
          message: 'VAT Adjustment cannot be zero',
          test: (value) => value === null || value !== 0,
        })
        .transform((value) => (!$p.f.isNumber(vatInvoice.value.vatPercent) ? null : value)),
    }),
  );

  // Composables

  const $p = useSalesContractViewPage(props.scopeName);

  // Computed

  const vatInvoice = computed(
    () =>
      $p.vm.value.vatInvoices[props.vatInvoiceIndex] ||
      (() => {
        throw new Error('[finance-sales-contracts] Index out of range');
      })(),
  );

  // Private Executions

  const { validate } = $p.useValidationForm(
    validationSchema,
    vatInvoice.value,
    'code',
    'issueDate',
    'content',
    'subTotal',
    'vatPercent',
    'vatAdjustment',
  );

  return {
    ...$p,
    vatInvoice,
    validateVatInvoiceEditor: async () => (await validate()).valid,
  };
}
