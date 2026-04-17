import type { Ref } from 'vue';

import type { Member, Project } from 'models/production/index.js';

import useFirebaseAuth from 'composables/useFirebaseAuth.js';

export default function useProjectVisibleToUser(authenticatedMember: Ref<Member | null>) {
  // Composables

  const { hasRole } = useFirebaseAuth();

  // Methods

  function projectVisibleToUser(project: Project) {
    const memberId = authenticatedMember.value?.id;

    return (
      !project.isPrivate ||
      hasRole('finance') ||
      (memberId &&
        (project.owner.id === memberId ||
          project.items.some((item) =>
            item.contributions.some((contribution) => contribution.member.id === memberId),
          )))
    );
  }

  return {
    projectVisibleToUser,
  };
}
