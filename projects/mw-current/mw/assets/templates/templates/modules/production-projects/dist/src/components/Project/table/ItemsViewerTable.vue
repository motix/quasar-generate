<script setup lang="ts">
import { Dark } from 'quasar';

import { useProjectViewPage } from 'composables/production/project/useProjectEditPage.js';

import StickyHeaders from 'components/shared/StickyHeaders.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // Auto sort
  f,
  hideContributions,
  m,
  mc,
} = useProjectViewPage(props.scopeName);
</script>

<template>
  <q-list class="rounded-list">
    <q-expansion-item
      default-opened
      expand-icon-class="text-white"
      header-class="text-white text-h6 bg-accent"
      icon="fal fa-play-circle"
      label="Items"
      popup
    >
      <q-card>
        <StickyHeaders markup-table separated target="#viewerTable" />

        <q-markup-table id="viewerTable" bordered separator="cell" wrap-cells>
          <thead>
            <tr>
              <th class="q-table--col-auto-width">#</th>
              <th>Title / Description</th>
              <th v-if="!hideContributions">Full Name</th>
              <th>
                {{ hideContributions ? 'Product Type' : 'Product Type / Role' }}
              </th>
              <th v-if="!hideContributions">Involvement</th>
              <th>Price Factor</th>
              <th>Quantity</th>
              <th v-if="!hideContributions">Salary Base</th>
              <th>Salary Amount</th>
            </tr>
          </thead>

          <tbody>
            <template v-for="(item, itemIndex) in m.items" :key="itemIndex">
              <tr>
                <!-- Number -->
                <td :rowspan="hideContributions ? 1 : item.contributions.length + 1">
                  {{ item.number }}
                </td>

                <!-- Title / Description -->
                <td :rowspan="hideContributions ? 1 : item.contributions.length + 1">
                  <div>
                    {{ item.title }}
                  </div>
                  <div v-if="item.description" class="text-caption text-muted">
                    {{ item.description }}
                  </div>
                </td>

                <!-- Full Name -->
                <td v-if="!hideContributions" />

                <!-- Product Type / Role -->
                <td class="text-center text-no-wrap">
                  {{ item.productType?.name }}
                </td>

                <!-- Involvement -->
                <td v-if="!hideContributions" />

                <!-- Price Factor -->
                <td class="text-right">
                  {{ f.percent(mc.itemPriceFactor(item)) }}
                </td>

                <!-- Quantity -->
                <td class="text-right">
                  {{ item.quantity }}
                </td>

                <!-- Salary Base -->
                <td v-if="!hideContributions" />

                <!-- Salary Amount -->
                <td class="text-right">
                  {{ f.currency(mc.itemProductionSalaryAmount(item)) }}
                </td>
              </tr>
              <template v-if="!hideContributions">
                <tr
                  v-for="(contribution, contributionIndex) in item.contributions"
                  :key="contributionIndex"
                  :class="Dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
                >
                  <!-- Full Name -->
                  <td class="text-center text-no-wrap">
                    {{ contribution.member.fullName }}
                  </td>

                  <!-- Product Type / Role -->
                  <td class="text-center text-no-wrap">
                    {{ contribution.productionRole.name }}
                  </td>

                  <!-- Involvement -->
                  <td class="text-right">
                    {{ f.percent(contribution.involvement) }}
                  </td>

                  <!-- Price Factor -->
                  <td class="text-right">
                    {{ f.percent(contribution.priceFactor) }}
                  </td>

                  <!-- Quantity -->
                  <td class="text-right">
                    {{ item.quantity }}
                  </td>

                  <!-- Salary Base -->
                  <td class="text-right">
                    {{ f.currency(mc.itemContributionProductionSalaryBase(contribution)) }}
                  </td>

                  <!-- Salary Amount -->
                  <td class="text-right">
                    {{
                      f.currency(
                        mc.itemContributionProductionSalaryAmount(contribution, item.quantity),
                      )
                    }}
                  </td>
                </tr>
              </template>
            </template>

            <!-- Total -->
            <tr>
              <!-- Number -->
              <!-- Title / Description -->
              <!-- Full Name -->
              <!-- Product Type / Role -->
              <!-- Involvement -->
              <td class="text-right" :colspan="hideContributions ? 3 : 5">
                <strong>Total</strong>
              </td>

              <!-- Price Factor -->
              <td class="text-right">
                <strong>
                  {{ f.percent(mc.projectProductionPriceFactor(m)) }}
                </strong>
              </td>

              <!-- Quantity -->
              <td class="text-right">
                <strong>{{ mc.projectTotalQuantity(m) }}</strong>
              </td>

              <!-- Salary Base -->
              <td v-if="!hideContributions" />

              <!-- Salary Amount -->
              <td class="text-right">
                <strong>
                  {{ f.currency(mc.projectTotalProductionSalary(m)) }}
                </strong>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>
