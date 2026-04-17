import { onUnmounted, ref } from 'vue';

import { useSingleScopeComposableStore } from 'stores/SingleScopeComposable.js';

import useCardsView from './useCardsView.js';
import useClientFilter from './useClientFilter.js';
import useGenericConvert from './useGenericConvert.js';
import useNavigateToNewPage from './useNavigateToNewPage.js';
import useNavigateToViewPage from './useNavigateToViewPage.js';
import usePageData from './usePageData.js';
import usePageStatus from './usePageStatus.js';
import useTableView from './useTableView.js';

function newScope<T extends NonNullable<unknown>, TRow extends NonNullable<unknown>>() {
  const pageStatus = usePageStatus();
  const pageData = usePageData<T>(pageStatus.ready);
  const clientFilter = useClientFilter<T>(pageData.items);

  const extraInitialized = ref(false);

  return {
    ...useGenericConvert<T, TRow>(),
    ...pageStatus,
    ...useTableView<T, TRow>(clientFilter.clientFilteredItems),
    ...useCardsView(),
    ...pageData,
    ...clientFilter,
    ...useNavigateToViewPage<T>(pageData.modelFindKeyField),
    ...useNavigateToNewPage(),
    extraInitialized,
  };
}

class NewScopeHelper<T extends NonNullable<unknown>, TRow extends NonNullable<unknown>> {
  Return = newScope<T, TRow>();
}

export * from './useTableView';

export default function useListPage<
  T extends NonNullable<unknown>,
  TRow extends NonNullable<unknown> = T,
  TExtra extends NonNullable<unknown> = Record<string, never>,
>(scopeName: string, hitUseCount?: boolean): NewScopeHelper<T, TRow>['Return'] & TExtra {
  const store = useSingleScopeComposableStore();

  !store.hasScope(scopeName) && store.setScope(scopeName, newScope<T, TRow>());

  if (hitUseCount === true) {
    store.increaseScopeUseCount(scopeName);
    onUnmounted(() => store.decreaseScopeUseCount(scopeName));
  }

  return store.retrieveScope(scopeName);
}

class UseListPageHelper<
  T extends NonNullable<unknown>,
  TRow extends NonNullable<unknown>,
  TExtra extends NonNullable<unknown>,
> {
  Return = useListPage<T, TRow, TExtra>('');
}

export type ListPage<
  T extends NonNullable<unknown>,
  TRow extends NonNullable<unknown>,
  TExtra extends NonNullable<unknown> = Record<string, never>,
> = UseListPageHelper<T, TRow, TExtra>['Return'];
