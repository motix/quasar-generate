import { ref } from 'vue';
import { useRouter } from 'vue-router';

import type { UsePageDataHelper } from './usePageData';

export default function useNavigateToViewPage<T extends NonNullable<unknown>>(
  modelFindKeyField: UsePageDataHelper<T>['Return']['modelFindKeyField'],
) {
  // Composables

  const router = useRouter();

  // Data

  const viewUrl = ref<string | null>(null);

  // Methods

  function itemLink(item: T) {
    viewUrl.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] viewUrl not specified');
      })();

    const keyValue = item[modelFindKeyField.value];
    const routeLocation = router.resolve(viewUrl.value + String(keyValue).replaceAll('.', '_'));

    return routeLocation.href;
  }

  function onItemClick(event: MouseEvent, item: T, delay: boolean) {
    viewUrl.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] viewUrl not specified');
      })();

    const keyValue = item[modelFindKeyField.value];

    if (event.ctrlKey || event.metaKey) {
      window.open(itemLink(item), '_blank');
    } else if (!event.altKey) {
      if (delay) {
        // Wait for the ripple
        setTimeout(() => {
          void router.push(viewUrl.value + String(keyValue).replaceAll('.', '_'));
        }, 300);
      } else {
        void router.push(viewUrl.value + String(keyValue).replaceAll('.', '_'));
      }
    }
  }

  return {
    viewUrl,
    itemLink,
    onItemClick,
  };
}
