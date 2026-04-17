<script setup lang="ts">
import { Dark } from 'quasar';

import type { Project } from 'models/production/index.js';

import type { useTimesheetsStore } from 'stores/production/Timesheets.js';

import useProjectCalculator from 'composables/production/project/useProjectCalculator.js';
import useFormats from 'composables/useFormats.js';

// Props

withDefaults(
  defineProps<{
    timesheet: ReturnType<ReturnType<typeof useTimesheetsStore>['timesheet']>;
    singleMember: boolean;
    filteredProjects: Project[];
    totalProductionSalary: number;
    printerFriendly?: boolean;
  }>(),
  {
    printerFriendly: false,
  },
);

// Composables

const f = useFormats();

const mc = useProjectCalculator<Project>();
</script>

<template>
  <q-markup-table id="mainTable" bordered separator="cell" :wrap-cells="printerFriendly">
    <thead>
      <tr>
        <th class="q-table--col-auto-width">#</th>
        <th :style="{ width: printerFriendly ? '20%' : undefined }">Title / Description</th>
        <th>Full Name</th>
        <th>Product Type / Role</th>
        <th class="q-table--col-auto-width">
          {{ printerFriendly ? 'Inv.' : 'Involvement' }}
        </th>
        <th class="q-table--col-auto-width">Price Factor</th>
        <th class="q-table--col-auto-width">Quantity</th>
        <th class="q-table--col-auto-width">Salary Base</th>
        <th class="q-table--col-auto-width">Salary Amount</th>
      </tr>
    </thead>

    <tbody>
      <template v-for="(project, projectIndex) in filteredProjects" :key="project.id">
        <tr>
          <!-- Number -->
          <td :class="{ 'inset-shadow': !printerFriendly }">
            <strong>
              <ol :start="projectIndex + 1" type="I">
                <li></li>
              </ol>
            </strong>
          </td>

          <!-- Title / Description -->
          <td :class="{ 'inset-shadow': !printerFriendly }" style="white-space: normal">
            <strong>
              {{ project.name }}
              <sup v-if="project.isPrivate">
                <q-icon color="negative" name="fas fa-lock" />
              </sup>
            </strong>
            <div v-if="project.description">
              {{ project.description }}
            </div>
          </td>

          <!-- Full Name -->
          <td
            :class="{
              'inset-shadow': !printerFriendly,
              'text-center': !singleMember,
              'text-right': singleMember,
            }"
            :colspan="singleMember ? 7 : 1"
          >
            <template v-if="singleMember">
              {{ f.date(project.finishDate) }}
            </template>
            <strong v-else>
              {{ project.owner.fullName }}
            </strong>
          </td>

          <!-- Product Type / Role -->
          <!-- Involvement -->
          <!-- Price Factor -->
          <!-- Quantity -->
          <!-- Salary Base -->
          <!-- Salary Amount -->
          <td
            v-if="!singleMember"
            class="text-right"
            :class="{ 'inset-shadow': !printerFriendly }"
            colspan="6"
          >
            {{ f.date(project.finishDate) }}
          </td>
        </tr>

        <!-- Separator -->
        <tr>
          <!-- Number -->
          <!-- Title / Description -->
          <!-- Full Name -->
          <!-- Product Type / Role -->
          <!-- Involvement -->
          <!-- Price Factor -->
          <!-- Quantity -->
          <!-- Salary Base -->
          <!-- Salary Amount -->
          <td colspan="9" style="height: 4px; padding: 0 !important"></td>
        </tr>

        <template v-for="(item, itemIndex) in project.items" :key="project.id + '-' + itemIndex">
          <tr>
            <!-- Number -->
            <td class="text-right" :rowspan="item.contributions.length + 1">
              {{ item.number }}
            </td>

            <!-- Title / Description -->
            <td :rowspan="item.contributions.length + 1" style="white-space: initial">
              <div>
                {{ item.title }}
              </div>
              <div v-if="item.description">
                {{ item.description }}
              </div>
            </td>

            <!-- Full Name -->
            <td></td>

            <!-- Product Type / Role -->
            <td class="text-center">
              {{ item.productType.name }}
            </td>

            <!-- Involvement -->
            <td></td>

            <!-- Price Factor -->
            <td class="text-right">
              {{ f.percent(mc.itemPriceFactor(item)) }}
            </td>

            <!-- Quantity -->
            <td class="text-right">
              {{ item.quantity }}
            </td>

            <!-- Salary Base -->
            <td></td>

            <!-- Salary Amount -->
            <td class="text-right">
              {{ f.currency(mc.itemProductionSalaryAmount(item)) }}
            </td>
          </tr>

          <tr
            v-for="(contribution, contributionIndex) in item.contributions"
            :key="project.id + '-' + itemIndex + '-' + contributionIndex"
            :class="Dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
          >
            <!-- Full Name -->
            <td class="text-center">
              {{ contribution.member.fullName }}
            </td>

            <!-- Product Type / Role -->
            <td class="text-center">
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
                f.currency(mc.itemContributionProductionSalaryAmount(contribution, item.quantity))
              }}
            </td>
          </tr>
        </template>

        <!-- Project Total -->
        <tr>
          <!-- Number -->
          <!-- Title / Description -->
          <!-- Full Name -->
          <!-- Product Type / Role -->
          <!-- Involvement -->
          <td class="text-right" colspan="5">
            <strong>Project Total</strong>
          </td>

          <!-- Price Factor -->
          <td class="text-right">
            <strong v-if="!singleMember">
              {{ f.percent(mc.projectProductionPriceFactor(project)) }}
            </strong>
          </td>

          <!-- Quantity -->
          <td class="text-right">
            <strong>
              {{ mc.projectTotalQuantity(project) }}
            </strong>
          </td>

          <!-- Salary Base -->
          <td></td>

          <!-- Salary Amount -->
          <td class="text-right">
            <strong>
              {{ f.currency(mc.projectTotalProductionSalary(project)) }}
            </strong>
          </td>
        </tr>
      </template>

      <!-- Total -->
      <tr>
        <!-- Number -->
        <!-- Title / Description -->
        <!-- Full Name -->
        <!-- Product Type / Role -->
        <!-- Involvement -->
        <th class="text-right" :class="{ 'inset-shadow': !printerFriendly }" colspan="5">
          <strong>Total</strong>
        </th>

        <!-- Price Factor -->
        <th :class="{ 'inset-shadow': !printerFriendly }"></th>

        <!-- Quantity -->
        <th
          class="text-right"
          :class="{ 'inset-shadow': !printerFriendly }"
          style="white-space: nowrap"
        >
          <span class="text-caption text-muted">Projects: </span>
          <strong>{{ filteredProjects.length }}</strong>
        </th>

        <!-- Salary Base -->
        <th :class="{ 'inset-shadow': !printerFriendly }"></th>

        <!-- Salary Amount -->
        <th class="text-right" :class="{ 'inset-shadow': !printerFriendly }">
          <strong>{{ f.currency(totalProductionSalary) }}</strong>
        </th>
      </tr>
    </tbody>
  </q-markup-table>
</template>
