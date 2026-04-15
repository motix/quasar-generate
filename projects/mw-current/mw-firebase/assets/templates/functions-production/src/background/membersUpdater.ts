import type { CollectionReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import type { MemberAm as Member, ProjectAm as Project } from 'models/production/index.js';

export const membersUpdater = onDocumentWritten('production_members/{id}', async (event) => {
  if (!event.data?.before.exists) {
    return;
  }

  const memberChange = event.data as Change<DocumentSnapshot<Member>>;
  const id = memberChange.before.id;

  const db = getFirestore();

  // Update Project.owner
  // Update ItemContribution.member

  let matchedProjects = 0;

  if (memberChange.after.data()?.fullName !== memberChange.before.data()!.fullName) {
    await updateProjects();

    if (memberChange.after.exists) {
      info(
        '[production-membersUpdater]',
        `Updated ${matchedProjects} projects for member "${memberChange.after.data()!.fullName}".`,
      );
    } else {
      info(
        '[production-membersUpdater]',
        `Updated ${matchedProjects} projects for DELETED member "${memberChange.before.data()!.fullName}".`,
      );
    }
  }

  async function updateProjects(name?: string) {
    const projectsRef = db.collection('production_projects') as CollectionReference<Project>;
    let projectsQuery = projectsRef.orderBy('name').limit(100);

    if (name) {
      projectsQuery = projectsQuery.startAfter(name);
    }

    const projectsSnapshot = await projectsQuery.get();

    info(
      '[production-membersUpdater]',
      `Scanning ${projectsSnapshot.size} projects for member "${memberChange.before.data()!.fullName}"...`,
    );

    for (const snapshot of projectsSnapshot.docs) {
      let hasMatches = false;
      const project = snapshot.data();

      // Update Project.owner
      if (project.owner.id === id) {
        if (memberChange.after.exists) {
          project.owner.fullName = memberChange.after.data()!.fullName;
        } else {
          project.owner.fullName += ' * DELETED *';
        }

        hasMatches = true;
      }

      // Update ItemContribution.member
      project.items.forEach((item) =>
        item.contributions.forEach((contribution) => {
          if (contribution.member.id === id) {
            if (memberChange.after.exists) {
              contribution.member.fullName = memberChange.after.data()!.fullName;
            } else {
              contribution.member.fullName += ' * DELETED *';
            }

            hasMatches = true;
          }
        }),
      );

      if (hasMatches) {
        matchedProjects++;

        info('[production-membersUpdater]', `Updating project "${project.name}"...`);

        await snapshot.ref.set({ owner: project.owner, items: project.items }, { merge: true });
      }
    }

    if (projectsSnapshot.docs.length === 100) {
      await updateProjects(projectsSnapshot.docs[projectsSnapshot.docs.length - 1]!.data().name);
    }
  }
});
