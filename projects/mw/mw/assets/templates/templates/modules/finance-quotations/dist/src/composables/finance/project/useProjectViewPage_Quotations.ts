import { computed, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import { date, Dialog, uid } from 'quasar';

import assignOptional from 'utils/assignOptional.js';
import QuotationStatus from 'utils/finance/Quotation/QuotationStatus.js';

import type { Quotation, QuotationDetail } from 'models/finance/index.js';

import { generateCode } from 'services/global/index.js';

import useProjectViewPage from 'composables/finance/project/useProjectViewPage.js';
import useQuotationCalculator from 'composables/finance/quotation/useQuotationCalculator.js';
import useNotifications from 'composables/useNotifications.js';

type TViewPage = ReturnType<typeof useProjectViewPage>;

function useQuotationsExtra($p: TViewPage) {
  // Private

  const router = useRouter();

  const { notifyErrorDebug, notifyCreateDataError } = useNotifications();

  // Composables

  const qmc = useQuotationCalculator<Quotation>();

  // Data

  const generatingQuotation = ref(false);
  const firstQuotationGenerating = ref(false);

  // Method Refs

  const processGeneratedQuotation = ref<((quotation: Quotation) => void) | null>(null);

  // Computed

  const hasGenerateQuotation = computed(
    () =>
      !!$p.model.value &&
      $p.model.value.items.length > 0 &&
      !$p.model.value.items.find(
        (value) => !value.isProductionOnly && value.unitPrice === undefined,
      ),
  );

  const showGenerateQuotationButton = computed(
    () => !$p.readonlyMode.value && !$p.editMode.value && hasGenerateQuotation.value,
  );

  // Methods

  async function generateQuotation() {
    async function doGenerateQuotation() {
      $p.freezed.value = true;
      generatingQuotation.value = true;

      const createDate = new Date();
      let code: string;
      try {
        code = await generateCode(
          'QT',
          date.formatDate(createDate, '.YY.MM.DD'),
          $p.m.value.customer.code.toUpperCase(),
        );
      } catch (error) {
        console.error(error);
        notifyCreateDataError();
        notifyErrorDebug(error);

        generatingQuotation.value = false;
        $p.freezed.value = false;
        return;
      }

      class StatusClass extends QuotationStatus<Quotation> {}

      const quotation = StatusClass.newContainer(
        StatusClass,
        assignOptional<Omit<Quotation, 'statusHelper'>>(
          {
            code,
            createDate,
            isApproved: false,
            isSentToCustomer: false,
            isConfirmed: false,
            isCancelled: false,
            isRevised: false,
            details: $p.m.value.items.map((item) => {
              const detail = assignOptional<QuotationDetail>(
                {
                  isProductionOnly: item.isProductionOnly,
                  isQuotationOnly: item.isQuotationOnly,
                  content: item.title,
                  quantity: item.quantity,
                },
                {
                  productionSalaryUnitPrice: item.productionSalaryUnitPrice,
                  unitPrice: item.unitPrice,
                },
              );

              return detail;
            }),
            listKey: uid(),
          },
          {
            discount: $p.m.value.discount,
            vatPercent: $p.m.value.vatPercent,
            vatableAmount: $p.m.value.vatableAmount,
          },
        ),
        [],
      );

      $p.m.value.quotations.forEach((value) => {
        value.isCancelled = true;
      });

      processGeneratedQuotation.value && processGeneratedQuotation.value(quotation);

      generatingQuotation.value = false;
      $p.freezed.value = false;

      if ($p.m.value.quotations.length === 0) {
        firstQuotationGenerating.value = true;
      }
      $p.m.value.quotations.push(quotation);
    }

    if ($p.m.value.quotations.find((value) => !value.isCancelled)) {
      return new Promise<void>((resolve, reject) => {
        Dialog.create({
          title: 'Regenerate Quotation',
          message: 'Current quotation will be canceled. Are you sure want to continue?',
          cancel: true,
          persistent: true,
        })
          .onOk(() => {
            doGenerateQuotation()
              .then(() => resolve())
              .catch((reason) => reject(new Error(reason)));
          })
          .onCancel(() => {
            resolve();
          });
      });
    } else {
      await doGenerateQuotation();
    }
  }

  function onQuotationClick(quotation: Quotation) {
    // Wait for the ripple
    setTimeout(() => {
      void router.push(
        `/quotations/${$p.m.value.urlFriendlyName}/${quotation.code.replaceAll('.', '_')}`,
      );
    }, 300);
  }

  // Watch

  watchEffect(() => {
    $p.collectionsHaveItems.value.quotations =
      !$p.editMode.value && ($p.model.value?.quotations.length || 0) > 0;
  });

  $p.watchViewerAndRun(
    () => {
      if ($p.m.value.quotations.length > 0) {
        void router.push(
          `/quotations/${$p.m.value.urlFriendlyName}/${$p.m.value.quotations[
            $p.m.value.quotations.length - 1
          ]!.code.replaceAll('.', '_')}`,
        );
      }
    },
    computed(() => $p.model.value?.quotations.length),
  );

  return {
    qmc,
    generatingQuotation,
    firstQuotationGenerating,
    processGeneratedQuotation,
    hasGenerateQuotation,
    showGenerateQuotationButton,
    generateQuotation,
    onQuotationClick,
  };
}

export function extendProjectViewPage_Quotations($p: TViewPage) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useProjectViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useQuotationsExtra>;

  Object.assign(extension, useQuotationsExtra($p));
  Object.assign($p, extension);

  return extension;
}

export default function useProjectViewPage_Quotations(scopeName: string) {
  const $p = useProjectViewPage(scopeName);

  return $p as typeof $p & ReturnType<typeof extendProjectViewPage_Quotations>;
}
