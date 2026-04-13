<script setup lang="ts">
import { Dark } from 'quasar';

import { useProjectViewPage } from 'composables/production/project/useProjectEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { cardWidth, listItemCardWidth } = requiredConfigEntries('cardWidth', 'listItemCardWidth');

const {
  // Auto sort
  f,
  hideContributions,
  m,
  mc,
} = useProjectViewPage(props.scopeName);
</script>

<template>
  <div class="q-gutter-y-md">
    <q-card
      class="q-mx-auto bg-accent"
      :class="Dark.isActive ? undefined : 'shadow-2'"
      dark
      style="width: 100%"
      :style="{ maxWidth: cardWidth + 'px' }"
    >
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-center">Items</div>
      </q-card-section>

      <q-card-section>
        <div class="row justify-between">
          <div>Total Quantity</div>
          <div class="text-warning">
            <strong>{{ mc.projectTotalQuantity(m) }}</strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Total Salary</div>
          <div class="text-warning">
            <strong>
              {{ f.currency(mc.projectTotalProductionSalary(m)) }}
            </strong>
          </div>
        </div>

        <div class="row justify-between">
          <div>Price Factor</div>
          <div class="text-warning">
            <strong>{{ f.percent(mc.projectProductionPriceFactor(m)) }}</strong>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Bottom padding to be consistent with editor -->
    <div class="row items-start justify-evenly q-gutter-md q-mt-none q-pb-xs">
      <ExpandableCard
        v-for="(item, index) in m.items"
        :key="index"
        avatar-icon="fal fa-play-circle"
        avatar-size=""
        avatar-top
        body-class="text-center"
        :caption="item.description"
        :header-background-color="Dark.isActive ? 'grey-8' : 'grey-4'"
        side-top
        :style="{ maxWidth: listItemCardWidth + 'px' }"
        :title="item.title"
      >
        <template #side>
          <q-item-label v-if="item.number" caption class="text-overline">
            #{{ item.number }}
            <TopTooltip>Number</TopTooltip>
          </q-item-label>
        </template>

        <template #body>
          <div class="text-subtitle1 text-uppercase">
            <span>
              {{ item.productType?.name }}
              <TopTooltip>Product Type</TopTooltip>
            </span>
            <q-badge align="top" color="green" text-color="white">
              {{ f.percent(mc.itemPriceFactor(item)) }}
              <TopTooltip>Price Factor</TopTooltip>
            </q-badge>
          </div>

          <q-chip color="purple" text-color="white">
            <q-avatar color="warning" text-color="dark">
              x{{ item.quantity }}
              <TopTooltip>Quantity</TopTooltip>
            </q-avatar>
            <span>
              = {{ f.currency(mc.itemProductionSalaryAmount(item)) }}
              <TopTooltip>Salary Amount</TopTooltip>
            </span>
          </q-chip>
        </template>

        <template #bezel-less>
          <q-slide-transition>
            <div v-if="!hideContributions" class="overflow-hidden">
              <template
                v-for="(contribution, contributionIndex) in item.contributions"
                :key="contributionIndex"
              >
                <div>
                  <q-separator />

                  <q-card-section horizontal>
                    <q-card-section class="col-4 col-sm-5 flex flex-center content-start">
                      <q-card class="bg-primary full-width" dark>
                        <q-card-section class="text-center">
                          {{ contribution.member.fullName }}
                        </q-card-section>
                      </q-card>
                    </q-card-section>

                    <q-separator vertical />

                    <q-card-section class="col-8 col-sm-7 flex flex-center content-start">
                      <div class="text-subtitle2 text-uppercase full-width text-center">
                        <span>
                          {{ contribution.productionRole.name }}
                          <TopTooltip>Production Role</TopTooltip>
                        </span>
                      </div>

                      <div>
                        <q-chip class="q-mx-none" color="purple" size="sm" text-color="white">
                          {{ f.currency(mc.itemContributionProductionSalaryBase(contribution)) }}
                          <TopTooltip>Salary Base</TopTooltip>
                        </q-chip>
                        x
                        <q-badge color="light-green" text-color="white">
                          {{ f.percent(contribution.involvement) }}
                          <TopTooltip>Involvement</TopTooltip>
                        </q-badge>
                        x
                        <q-badge color="green" text-color="white">
                          {{ f.percent(contribution.priceFactor) }}
                          <TopTooltip>Price Factor</TopTooltip>
                        </q-badge>
                      </div>

                      <q-chip color="purple" text-color="white">
                        <q-avatar color="warning" text-color="dark">
                          x{{ item.quantity }}
                          <TopTooltip>Quantity</TopTooltip>
                        </q-avatar>
                        <span>
                          =
                          {{
                            f.currency(
                              mc.itemContributionProductionSalaryAmount(
                                contribution,
                                item.quantity,
                              ),
                            )
                          }}
                          <TopTooltip>Salary Amount</TopTooltip>
                        </span>
                      </q-chip>
                    </q-card-section>
                  </q-card-section>
                </div>
              </template>
            </div>
          </q-slide-transition>
        </template>
      </ExpandableCard>
    </div>
  </div>
</template>
