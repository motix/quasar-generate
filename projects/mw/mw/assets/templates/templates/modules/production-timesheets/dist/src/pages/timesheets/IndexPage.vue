<script lang="ts">
import type { Ref } from 'vue';
import { computed, onUnmounted, ref, watchEffect } from 'vue';

import type { QSelectProps } from 'quasar';
import { Dark } from 'quasar';

import { remove, sortBy, sumBy, uniqBy } from 'lodash-es';

import type { MemberLite, Project } from 'models/production/index.js';

import { useTimesheetsStore } from 'stores/production/Timesheets.js';

import useProjectCalculator from 'composables/production/project/useProjectCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';
import useNotifications from 'composables/useNotifications.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

import FloatToolbar from 'components/shared/FloatToolbar.vue';
import StickyHeaders from 'components/shared/StickyHeaders.vue';
import SwitchViewButton from 'components/shared/SwitchViewButton.vue';
import TimesheetViewerInnerTable from 'components/Timesheet/table/TimesheetViewerInnerTable.vue';

function usePageStatus() {
  // Data

  const freezed = ref(false);

  return {
    freezed,
  };
}

function usePageData(freezed: ReturnType<typeof usePageStatus>['freezed']) {
  // Private

  function generateMemberOptions() {
    let members =
      timesheet.value?.projects.flatMap((project) =>
        project.items.flatMap((item) =>
          item.contributions.flatMap((contribution) => contribution.member),
        ),
      ) || [];

    members = uniqBy(members, (value) => value.id);
    members = sortBy(members, (value) => value.fullName);

    return members;
  }

  // Composables

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  const store = useTimesheetsStore();

  // Data

  const year = ref(new Date().getFullYear());
  const month = ref(new Date().getMonth() + 1);
  const includePrivateProjects = ref(false);
  const timesheet = ref(null) as Ref<ReturnType<(typeof store)['timesheet']> | null>;
  const member = ref(null) as Ref<MemberLite | null>;
  const memberOptions: Ref<MemberLite[]> = ref([]);

  // Computed

  const filteredProjects = computed(() => {
    const memberValue = member.value;

    if (!memberValue) {
      return timesheet.value?.projects || [];
    }

    const result = (timesheet.value?.projects || []).map((project) => {
      project = Object.assign({}, project);
      project.items = project.items.map((item) => {
        item = Object.assign({}, item);
        item.contributions = item.contributions.map((contribution) => {
          contribution = Object.assign({}, contribution);

          return contribution;
        });
        remove(item.contributions, (contribution) => contribution.member.id !== memberValue.id);

        return item;
      });
      remove(project.items, (item) => item.contributions.length === 0);

      return project;
    });

    remove(result, (project) => project.items.length === 0);

    return result;
  });

  // Methods

  function loadTimesheet() {
    freezed.value = true;
    timesheet.value = null;
    member.value = null;

    store
      .loadTimesheet(year.value, month.value, includePrivateProjects.value)
      .then(() => {
        timesheet.value = store.timesheet(year.value, month.value, includePrivateProjects.value);
        freezed.value = false;
      })
      .catch((error) => {
        console.error(error);
        notifyLoadDataError();
        notifyErrorDebug(error);
        freezed.value = false;
      });
  }

  function loadPreviousTimesheet() {
    if (month.value === 1) {
      month.value = 12;
      year.value--;
    } else {
      month.value--;
    }

    loadTimesheet();
  }

  function loadNextTimesheet() {
    if (month.value === 12) {
      month.value = 1;
      year.value++;
    } else {
      month.value++;
    }

    loadTimesheet();
  }

  function filterMemberOptions(
    ...[inputValue, doneFn]: Parameters<Required<QSelectProps>['onFilter']>
  ) {
    const options = generateMemberOptions();

    if (inputValue === '') {
      doneFn(() => {
        memberOptions.value = options;
      });

      return;
    }

    doneFn(() => {
      const search = inputValue.toLowerCase();
      memberOptions.value = options.filter((value) =>
        value.fullName.toLowerCase().includes(search),
      );
    });
  }

  // Lifecycle Hooks

  onUnmounted(() => {
    store.releaseTimesheets({ immediately: false });
  });

  // Watch

  watchEffect(() => {
    memberOptions.value = generateMemberOptions();
  });

  return {
    year,
    month,
    includePrivateProjects,
    timesheet,
    member,
    memberOptions,
    filteredProjects,
    loadTimesheet,
    loadPreviousTimesheet,
    loadNextTimesheet,
    filterMemberOptions,
  };
}

function useSummary(
  timesheet: ReturnType<typeof usePageData>['timesheet'],
  member: ReturnType<typeof usePageData>['member'],
  filteredProjects: ReturnType<typeof usePageData>['filteredProjects'],
) {
  // Composables

  const f = useFormats();
  const mc = useProjectCalculator<Project>();

  // Computed

  const timesheetTitle = computed(
    () =>
      `Timesheet ${member.value?.fullName || ''} ${
        timesheet.value ? f.yearMonth(timesheet.value.year, timesheet.value.month) : ''
      }`,
  );

  const totalProductionSalary = computed(() =>
    sumBy(filteredProjects.value, (project) => mc.projectTotalProductionSalary(project)),
  );

  return {
    timesheetTitle,
    totalProductionSalary,
  };
}
</script>

<script setup lang="ts">
// Composables

const { cardWidth, listItemCardWidth } = requiredConfigEntries('cardWidth', 'listItemCardWidth');

const { hasRole } = useFirebaseAuth();

const f = useFormats();

const { isTableView, isCardsView } = useMultiViews();

const { yearOptions, monthOptions } = useSelectDateRange();

const mc = useProjectCalculator<Project>();

const { freezed } = usePageStatus();

const {
  year,
  month,
  includePrivateProjects,
  timesheet,
  member,
  memberOptions,
  filteredProjects,
  loadTimesheet,
  loadPreviousTimesheet,
  loadNextTimesheet,
  filterMemberOptions,
} = usePageData(freezed);

const { timesheetTitle, totalProductionSalary } = useSummary(timesheet, member, filteredProjects);
</script>

<template>
  <QPagePadding padding>
    <div class="q-gutter-y-lg">
      <q-card
        class="q-mx-auto"
        :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
        style="width: 100%"
        :style="{ maxWidth: cardWidth + 'px' }"
      >
        <q-card-section>
          <div class="q-col-gutter-md row">
            <q-select
              v-model="year"
              class="col"
              :disable="freezed"
              label="Year"
              :options="yearOptions"
            />

            <q-select
              v-model="month"
              class="col"
              :disable="freezed"
              label="Month"
              :options="monthOptions"
            />

            <q-toggle
              v-if="hasRole('project-leader') || hasRole('finance')"
              v-model="includePrivateProjects"
              checked-icon="fal fa-lock"
              class="col"
              :disable="freezed"
              label="Private"
              unchecked-icon="clear"
            >
            </q-toggle>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="around">
          <q-btn
            color="primary"
            :disable="freezed"
            flat
            icon="fal fa-chevron-left"
            @click="loadPreviousTimesheet"
          >
            <TopTooltip>Generate Previous Month Timesheet</TopTooltip>
          </q-btn>
          <q-btn
            color="primary"
            :disable="freezed"
            flat
            label="Generate Timesheet"
            @click="loadTimesheet"
          />
          <q-btn
            v-if="hasRole('finance')"
            color="primary"
            :disable="freezed"
            flat
            label="Print"
            target="_blank"
            :to="`/timesheets/${year}/${month}/print-timesheet`"
          />
          <q-btn
            color="primary"
            :disable="freezed"
            flat
            icon="fal fa-chevron-right"
            @click="loadNextTimesheet"
          >
            <TopTooltip>Generate Next Month Timesheet</TopTooltip>
          </q-btn>
        </q-card-actions>

        <q-linear-progress v-if="freezed" color="warning" indeterminate />

        <q-slide-transition>
          <div v-if="(timesheet?.projects.length || 0) > 0">
            <q-separator />

            <q-card-section>
              <q-select
                v-model="member"
                clearable
                fill-input
                hide-selected
                label="Filter by Member"
                map-options
                option-label="fullName"
                option-value="id"
                :options="memberOptions"
                use-input
                @filter="filterMemberOptions"
              />
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>

      <FadeTransition>
        <template v-if="timesheet">
          <FadeTransition>
            <q-list v-if="isTableView" key="tableView" class="rounded-list">
              <q-expansion-item
                default-opened
                expand-icon-class="text-white"
                header-class="text-white text-h6 bg-accent"
                :label="timesheetTitle"
                popup
              >
                <q-card>
                  <q-card-section v-if="timesheet.projects.length === 0">
                    There is no project in the selected month.
                  </q-card-section>

                  <template v-else>
                    <StickyHeaders markup-table separated target="#mainTable" />

                    <TimesheetViewerInnerTable
                      :filtered-projects="filteredProjects"
                      :single-member="!!member"
                      :timesheet="timesheet"
                      :total-production-salary="totalProductionSalary"
                    />
                  </template>
                </q-card>
              </q-expansion-item>
            </q-list>

            <div
              v-else-if="isCardsView"
              key="cardsView"
              class="row items-start justify-evenly q-gutter-md"
            >
              <q-card
                class="bg-accent"
                dark
                style="width: 100%"
                :style="{ maxWidth: cardWidth + 'px' }"
              >
                <q-card-section class="q-pb-none">
                  <div class="text-h6 text-center">
                    {{ timesheetTitle }}
                  </div>
                </q-card-section>

                <q-card-section class="text-center">
                  <div>
                    <strong class="text-warning">
                      {{ filteredProjects.length }}
                    </strong>
                    {{ filteredProjects.length > 1 ? 'projects' : 'project' }}
                  </div>
                  <div>
                    Total
                    <strong class="text-warning">
                      {{ f.currency(totalProductionSalary) }}
                    </strong>
                    salary
                  </div>
                </q-card-section>
              </q-card>

              <div class="flex-break q-mt-none"></div>

              <ExpandableCard
                v-for="project in filteredProjects"
                :key="project.id"
                avatar-icon="fal fa-briefcase"
                avatar-top
                :caption="
                  member === null
                    ? f.percent(mc.projectProductionPriceFactor(project)) || undefined
                    : undefined
                "
                caption-tooltip="Price Factor"
                header-background-color="primary"
                header-dark
                side-top
                :style="{ maxWidth: listItemCardWidth + 'px' }"
                :subtitle="member === null ? project.owner.fullName : undefined"
                subtitle-tooltip="Owner"
                :title="project.name"
                :title-end-icon="project.isPrivate ? 'fas fa-lock' : undefined"
                title-end-icon-color="red-13"
                title-end-icon-superscript
                title-full-width
                :title-top="member === null"
              >
                <template #side>
                  <q-item-label caption>
                    x{{ mc.projectTotalQuantity(project) }}
                    <TopTooltip>Total Quantity</TopTooltip>
                  </q-item-label>
                  <q-item-label caption class="text-weight-regular">
                    {{ f.currency(mc.projectTotalProductionSalary(project)) }}
                    <TopTooltip>Total Salary</TopTooltip>
                  </q-item-label>
                </template>

                <template #bezel-less>
                  <ExpandableCard
                    v-for="(item, itemIndex) in project.items"
                    :key="project.id + '-' + itemIndex"
                    avatar-color="primary"
                    avatar-icon="fal fa-play-circle"
                    avatar-size=""
                    avatar-top
                    :caption="f.percent(mc.itemPriceFactor(item)) || undefined"
                    caption-tooltip="Price Factor"
                    side-top
                    :subtitle="item.productType.name"
                    subtitle-tooltip="Product Type"
                    :title="item.title"
                    title-color="primary"
                    title-top
                  >
                    <template #side>
                      <q-item-label v-if="item.number" caption>
                        #{{ item.number }}
                        <TopTooltip>Number</TopTooltip>
                      </q-item-label>
                      <q-item-label caption>
                        x<span>{{ item.quantity }}</span>
                        <TopTooltip>Quantity</TopTooltip>
                      </q-item-label>
                      <q-item-label caption class="text-weight-regular text-accent">
                        {{ f.currency(mc.itemProductionSalaryAmount(item)) }}
                        <TopTooltip>Salary Amount</TopTooltip>
                      </q-item-label>
                    </template>

                    <template #bezel-less>
                      <template
                        v-for="(contribution, contributionIndex) in item.contributions"
                        :key="project.id + '-' + itemIndex + '-' + contributionIndex + '_separator'"
                      >
                        <q-separator inset />

                        <q-card-section>
                          <div class="row justify-between text-subtitle2">
                            <div>
                              {{ contribution.member.fullName }}
                            </div>
                            <div>
                              {{ contribution.productionRole.name }}
                              <TopTooltip>Production Role</TopTooltip>
                            </div>
                          </div>
                          <div class="row justify-between text-caption">
                            <div>
                              <span>
                                {{
                                  f.currency(mc.itemContributionProductionSalaryBase(contribution))
                                }}
                                <TopTooltip>Salary Base</TopTooltip>
                              </span>
                              x
                              <span>
                                {{ f.percent(contribution.involvement) }}
                                <TopTooltip>Involvement</TopTooltip>
                              </span>
                              x
                              <span>
                                {{ f.percent(contribution.priceFactor) }}
                                <TopTooltip>Price Factor</TopTooltip>
                              </span>
                              x
                              <span>
                                {{ item.quantity }}
                                <TopTooltip>Quantity</TopTooltip>
                              </span>
                            </div>
                            <div class="text-accent">
                              {{
                                f.currency(
                                  mc.itemContributionProductionSalaryAmount(
                                    contribution,
                                    item.quantity,
                                  ),
                                )
                              }}
                              <TopTooltip>Salary Amount</TopTooltip>
                            </div>
                          </div>
                        </q-card-section>
                      </template>

                      <q-separator v-if="itemIndex < project.items.length - 1" />
                    </template>
                  </ExpandableCard>
                </template>
              </ExpandableCard>
            </div>
          </FadeTransition>
        </template>
      </FadeTransition>
    </div>

    <FloatToolbar v-if="timesheet">
      <template #fixed-buttons>
        <SwitchViewButton key="switchView" />

        <q-btn
          v-if="hasRole('finance')"
          key="print"
          class="shadow-2"
          :class="Dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          icon="fal fa-print"
          outline
          padding="sm"
          target="_blank"
          text-color="primary"
          :to="`/timesheets/${timesheet.year}/${timesheet.month}/print-timesheet`"
        >
          <TopTooltip>Print</TopTooltip>
        </q-btn>
      </template>
    </FloatToolbar>
  </QPagePadding>
</template>
