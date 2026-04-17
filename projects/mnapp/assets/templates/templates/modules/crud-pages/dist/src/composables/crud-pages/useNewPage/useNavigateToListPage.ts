import { useRouter } from 'vue-router';

import { Dialog } from 'quasar';

import useReturnUrl from 'composables/useReturnUrl.js';

import type usePageStatus from './usePageStatus.js';

export default function navigateToListPage(isDirty: ReturnType<typeof usePageStatus>['isDirty']) {
  // Composables

  const router = useRouter();

  const { returnUrl, defaultReturnUrl: backUrl } = useReturnUrl();

  // Methods

  function confirmAndGoBack() {
    if (isDirty.value) {
      Dialog.create({
        title: 'Leave',
        message: 'Are you sure want to discard all changes?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        void router.push(returnUrl.value);
      });
    } else {
      void router.push(returnUrl.value);
    }
  }

  return {
    backUrl,
    confirmAndGoBack,
  };
}
