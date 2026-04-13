import { computed, markRaw } from 'vue';

import { object } from 'yup';

import { asIsRequired, percentRequiredMin, percentRequiredMinOneMax } from 'utils/validation.js';

import type { MemberLite, ProductionRoleLite } from 'models/production/index.js';

import { useProjectViewPage } from './useProjectEditPage.js';

type Props = {
  scopeName: string;
  itemIndex: number;
  itemContributionIndex: number;
};

export default function useItemContributionEditor(props: Readonly<Props>) {
  // Private

  const validationSchema = markRaw(
    object({
      involvement: percentRequiredMinOneMax('Involvement').test({
        message: () =>
          `Total Involvement for ${itemContribution.value.productionRole?.name} Role must be 100%`,
        test: () => {
          if (!itemContribution.value.productionRole) {
            return true;
          }

          let totalInvolvement = 0;

          item.value.contributions.forEach((contribution) => {
            if (
              contribution.productionRole?.id === itemContribution.value.productionRole?.id &&
              typeof contribution.involvement === 'number' &&
              contribution.involvement > 0
            ) {
              totalInvolvement += contribution.involvement;
              totalInvolvement = Math.round(totalInvolvement * 10000) / 10000;
            }
          });

          return totalInvolvement === 1;
        },
      }),
      priceFactor: percentRequiredMin('Price Factor'),
      member: asIsRequired<MemberLite>('Member'),
      productionRole: asIsRequired<ProductionRoleLite>('Production Role'),
    }),
  );

  // Composables

  const $p = useProjectViewPage(props.scopeName);

  // Computed

  const item = computed(
    () =>
      $p.vm.value.items[props.itemIndex] ||
      (() => {
        throw new Error('[production-projects] Index out of range');
      })(),
  );

  const itemContribution = computed(
    () =>
      item.value.contributions[props.itemContributionIndex] ||
      (() => {
        throw new Error('[production-projects] Index out of range');
      })(),
  );

  const productionRoles = computed(() => {
    if (!item.value.productType) return [];

    const productTypeId = item.value.productType.id;

    return (
      $p.productTypes.value
        .find((value) => value.id === productTypeId)
        ?.productionSalaryDetails?.map(
          (value) =>
            ({
              id: value.productionRole.id,
              name: value.productionRole.name,
            }) as ProductionRoleLite,
        ) || []
    );
  });

  // Private Executions

  const { validate } = $p.useValidationForm(
    validationSchema,
    itemContribution.value,
    'involvement',
    'priceFactor',
    'member',
    'productionRole',
  );

  // Methods

  function onUpdateMember(value: MemberLite | undefined) {
    const defaultProductionRole = $p.members.value.find(
      (member) => member.id === value?.id,
    )?.defaultProductionRole;

    itemContribution.value.productionRole = productionRoles.value.find(
      (value) => value.id === defaultProductionRole?.id,
    ); // Allow undefined while editing
    onUpdateProductionRole();
  }

  function onUpdateProductionRole() {
    $p.updateItemContribution(props.itemIndex, props.itemContributionIndex);
  }

  return {
    ...$p,
    item,
    itemContribution,
    productionRoles,
    onUpdateMember,
    onUpdateProductionRole,
    validateSubDetailEditor: async () => (await validate()).valid,
  };
}
