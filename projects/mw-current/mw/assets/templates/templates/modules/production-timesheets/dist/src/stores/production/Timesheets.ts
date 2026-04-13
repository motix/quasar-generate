import type { Ref } from 'vue';
import { ref } from 'vue';

import { defineStore } from 'pinia';

import { date } from 'quasar';

import type { CollectionReference } from 'firebase/firestore';
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';

import type { Project, ProjectAm } from 'models/production/index.js';
import productionMapper from 'models/production/mapper/productionMapper.js';

import type { ReleaseDocsActionPayload } from 'stores/firebase-firestore/index.js';
import { projectsStoreDefaultSort } from 'stores/production/Projects.js';

import { getFirestore } from 'services/firebase.js';

import useProjectVisibleToUser from 'composables/production/project/useProjectVisibleToUser.js';
import useCurrentMember from 'composables/production/shared/useCurrentMember.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

type Timesheet = {
  year: number;
  month: number;
  includePrivateProjects: boolean;
  projects: Project[];
};

export const useTimesheetsStore = defineStore('Timesheets', () => {
  // Private

  const { releaseDocsTimeout } = requiredConfigEntries('releaseDocsTimeout');

  let releaseTimesheetsTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const { authenticatedMember } = useCurrentMember();
  const { projectVisibleToUser } = useProjectVisibleToUser(authenticatedMember);

  // State

  const timesheets = ref([]) as Ref<Timesheet[]>;

  // Getters

  function timesheet(year: number, month: number, includePrivateProjects: boolean) {
    return (
      timesheets.value.find(
        (value) =>
          value.year === year &&
          value.month === month &&
          value.includePrivateProjects === includePrivateProjects,
      ) ||
      (() => {
        throw new Error(`Timesheet ${year.toString()} - ${month.toString()} not available`);
      })()
    );
  }

  // Actions

  async function loadTimesheet(year: number, month: number, includePrivateProjects: boolean) {
    if (releaseTimesheetsTimeoutId) {
      clearTimeout(releaseTimesheetsTimeoutId);
      releaseTimesheetsTimeoutId = null;
    }

    if (
      timesheets.value.some(
        (value) =>
          value.year === year &&
          value.month === month &&
          value.includePrivateProjects === includePrivateProjects,
      )
    ) {
      return;
    }

    const { payday } = requiredConfigEntries('payday');
    const endDate = new Date(year, month - 1, payday);
    const startDate = date.addToDate(endDate, { days: 1, months: -1 });

    const db = getFirestore();
    const projectsRef = collection(db, 'production_projects') as CollectionReference<ProjectAm>;
    const projectsQuery = query(
      projectsRef,
      where('finishDate', '>=', Timestamp.fromDate(startDate)),
      where('finishDate', '<=', Timestamp.fromDate(endDate)),
      ...projectsStoreDefaultSort,
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    const projectAndIds = projectsSnapshot.docs.map((snapshot) => {
      return [snapshot.data(), snapshot.id];
    });
    const projectAms = projectAndIds.map((projectAndId) => projectAndId[0] as ProjectAm);
    const projectIdMap = new Map(projectAndIds as Iterable<readonly [ProjectAm, string]>);
    const extraArgs = () => ({ idMap: projectIdMap });

    let projects = productionMapper.mapArray<ProjectAm, Project>(
      projectAms,
      'ProjectAm',
      'Project',
      { extraArgs },
    );

    projects = [
      ...projects.filter((value) => !value.isPrivate),
      ...(includePrivateProjects
        ? [...projects.filter((value) => value.isPrivate && projectVisibleToUser(value))]
        : []),
    ];

    const timesheet: Timesheet = {
      year,
      month,
      includePrivateProjects,
      projects,
    };

    timesheets.value.push(timesheet);
  }

  function releaseTimesheets({ immediately }: ReleaseDocsActionPayload) {
    if (immediately) {
      timesheets.value = [];
    } else {
      releaseTimesheetsTimeoutId = setTimeout(() => {
        timesheets.value = [];
      }, releaseDocsTimeout);
    }
  }

  return {
    timesheets,
    timesheet,
    loadTimesheet,
    releaseTimesheets,
  };
});
